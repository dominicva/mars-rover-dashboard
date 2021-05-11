require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

// ------------------------------------------------------  UTILS

const upperFirstChar = (str) => str[0].toUpperCase() + str.slice(1);

const parseKey = (key) => {
  const splitKey = key.split('');
  const upperChars = key.match(/[A-Z]/g);
  if (upperChars) {
    upperChars
      .map((char) => key.indexOf(char))
      .map((charIdx, i) => charIdx + i)
      .forEach((i) => splitKey.splice(i, 0, ' '));

    key = splitKey.join('');
  }
  return upperFirstChar(key);
};

const formatEntries = (o, cb) => Object.entries(o).map(cb);

const compose = (arg, fn) => fn(arg);

const extractManifest = (res) => res.latest_photos[0].rover;

const parseManifest = (manifest) => {
  const o = {};
  ({
    name: o.name,
    landing_date: o.landingDate,
    launch_date: o.launchDate,
    status: o.missionStatus,
  } = manifest);
  return o;
};

const manifest = (res) => [extractManifest, parseManifest].reduce(compose, res);

const parseCamera = (cameraResObj) => cameraResObj.full_name;

const parsePhoto = (photoResObj) => {
  const o = {};
  o.camera = parseCamera(photoResObj.camera);
  ({ img_src: o.imgSrc, earth_date: o.earthDate, sol: o.sol } = photoResObj);
  return o;
};

const extractPhotos = (res) => res.latest_photos;

const parsePhotos = (list, parser) => list.map(parser);

const constructResponse = (res) => {
  const roverManifest = manifest(res);
  return {
    ...roverManifest,
    formattedEntries: formatEntries(roverManifest, (entry) => {
      entry[0] = parseKey(entry[0]);
      return entry;
    }),
    photos: parsePhotos(extractPhotos(res), parsePhoto),
  };
};

// ------------------------------------------------------ COMPONENTS

const Component = (tag, className, attribute, innerHtml) => {
  return `
    <${tag} 
      class="${className ? className : ''}"
      ${attribute ? `${attribute.name}="${attribute.value}"` : ``}
    >${innerHtml ? innerHtml : ''}
    </${tag}>
  `;
};

const CardBgImage = (className, data) => {
  return Component('div', className, {
    name: 'style',
    value: `background-image: url(./assets/media/${data.name.toLowerCase()}.jpeg);`,
  });
};

const ExpandGalleryBtn = (className) =>
  Component(
    'button',
    className,
    undefined,
    '<i class="material-icons">add</i>Expand gallery'
  );

const InfoHeading = (labelClass, headingClass, data) =>
  Component(
    'label',
    labelClass,
    undefined,
    `${data[0]}<h2 class="${headingClass}">${data[1]}</h2>`
  );

const InfoItem = (labelClass, itemClass, data) =>
  Component(
    'label',
    labelClass,
    undefined,
    `${data[0]}<li class="${itemClass}">${data[1]}</li>`
  );

const CardInfo = (data) => {
  const { formattedEntries } = data;

  const start = `
    <div class="card__info">
      ${InfoHeading('card__label', 'card__info-heading', formattedEntries[0])}
      <ul class="card__info-items-container">
    `;

  const middle = formattedEntries.slice(1).reduce((accum, entry) => {
    return accum + InfoItem('card__label', 'card__info-item', entry);
  }, start);

  const end = middle + `</ul></div>`;

  return end;
};

const Card = (data) => {
  return [
    CardBgImage('card__bg-image', data),
    ExpandGalleryBtn('card__gallery-btn'),
    CardInfo(data),
  ].reduce((accum, child) => accum + child, ``);
};

// ------------------------------------------------------  API CALL

const { API_KEY } = process.env;

app.get('/rover-info/:rover', async (req, res) => {
  const { rover } = req.params;
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${API_KEY}`;

  try {
    const data = await fetch(url)
      .then((rawRes) => rawRes.json())
      .then((jsRes) => constructResponse(jsRes));

    data.card = Card(data);

    res.send(data);
  } catch (error) {
    console.log('Something went wrong fetching rover data', error);
  }
});

app.listen(port, () => console.log(`Mars rover app listening on port ${port}`));

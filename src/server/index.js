require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');
const { ESRCH } = require('constants');

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

// ------------------------------------------------------  API CALLS

app.get('/rover-info/:rover', async (req, res) => {
  const rover = req.params.rover;
  const manifestsEndpoint = `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}/?api_key=${process.env.API_KEY}`;

  try {
    const info = await fetch(manifestsEndpoint)
      .then((raw) => raw.json())
      .then((parsed) => {
        console.log(parsed);
        const {
          name,
          landing_date: landingDate,
          launch_date: launchDate,
          status,
          max_date: lastPhotoDate,
          total_photos: totalPhotos,
        } = parsed.photo_manifest;

        const o = {
          name,
          landingDate,
          launchDate,
          status,
          lastPhotoDate,
          totalPhotos,
        };

        o.formattedEntries = formatEntries(o, (entry) => {
          entry[0] = parseKey(entry[0]);
          return entry;
        });

        return o;
      });

    res.send(info);
  } catch (error) {
    console.log(error);
  }
});

app.get('/apod', async (req, res) => {
  try {
    let image = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ image });
  } catch (err) {
    console.log('error:', err);
  }
});

app.listen(port, () => console.log(`Mars rover app listening on port ${port}`));

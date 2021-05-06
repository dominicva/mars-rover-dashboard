'use strict';
// const { List, Map, toJS } = Immutable;
let store = {
  title: 'Mars Rover Dashboard',
  apod: '',
  rovers: ['Curiosity', 'Opportunity', 'Spirit'],
  currentRover: {
    name: 'Curiosity',
    landingDate: undefined,
    launchDate: undefined,
    status: undefined,
    lastPhotoDate: undefined,
  },
};

const root = document.getElementById('root');

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async (root, state) => {
  const app = await App(state);

  clearLoading();

  return reduce(app, append, root);
};

const App = async (state) => {
  const { title, apod, rovers, currentRover } = state;

  return [
    MainHeading('main-heading', title),
    Nav('nav-container', ...rovers),
    await Card('card', currentRover.name),
  ];
};

window.addEventListener('load', () => {
  render(root, store);
});

// ------------------------------------------------------  UTILS

const append = (parent, child) => {
  parent.append(child);
  return parent;
};

const reduce = (arr, reducer, accum) => {
  let i = 0;
  if (!accum) accum = arr[i++];
  for (i; i < arr.length; i++) {
    accum = reducer(accum, arr[i]);
  }
  return accum;
};

const clearLoading = () => (root.innerHTML = '');

// ------------------------------------------------------  COMPONENTS

const Component = (tag, className, innerHtml) => {
  const domEl = document.createElement(tag);
  if (className) domEl.className = className;
  if (innerHtml) domEl.innerHTML = innerHtml;
  return domEl;
};

const MainHeading = (className, text) => Component('h1', className, text);

const NavItem = (className, rover) => Component('li', className, rover);

const Nav = (className, ...rovers) => {
  const nav = Component('nav', className);
  const navList = Component('ul');
  append(nav, navList);
  rovers.forEach((rover) => append(navList, NavItem('nav-item', rover)));
  return nav;
};

const CardBgImage = (className, rover) => {
  const img = Component('div', className);
  img.style = `background-image: url('./assets/media/${rover.toLowerCase()}.jpeg');`;
  return img;
};

const ExpandGalleryBtn = (className, text, handler) => {
  const btn = Component('button', className, text);
  const icon = Component('i', 'material-icons', 'add');
  btn.prepend(icon);
  btn.addEventListener('click', (e) => handler(e));
  return btn;
};

const CardInfo = async (rover) => {
  const info = await getRoverInfo(rover);
  const [name] = info;

  const cardInfo = Component('div', 'card__info'); // parent div

  const roverTitle = Component(
    'label',
    'card__label',
    `${name[0]}<h2 class="card__info-heading">${name[1]}</h2>`
  );

  append(cardInfo, roverTitle);

  const statsContainer = Component('ul', 'card__stats-container');

  info
    .slice(1) // don't need info[0] -> rover title handled above
    .map((stat) =>
      Component(
        'label',
        'card__label',
        `${stat[0]}<li class="card__stat">${stat[1]}</li>`
      )
    )
    .forEach((el) => append(statsContainer, el));

  append(cardInfo, statsContainer);

  return cardInfo;
};

const Card = async (className, rover) => {
  const card = Component('div', className);

  const cardInfo = await CardInfo(rover);

  const cardChildren = [
    CardBgImage('card__bg-image', rover),
    ExpandGalleryBtn('card__gallery-btn', 'Expand gallery'),
    cardInfo,
  ];

  return reduce(cardChildren, append, card);
};

const Gallery = (state) => {};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  console.log(photodate.getDate(), today.getDate());

  console.log(photodate.getDate() === today.getDate());
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store);
  }
  // check if the photo of the day is actually type video!
  if (apod.media_type === 'video') {
    return `
          <p>See today's featured video <a href="${apod.url}">here</a></p>
          <p>${apod.title}</p>
          <p>${apod.explanation}</p>
      `;
  } else {
    return `
          <img src="${apod.image.url}" height="350px" width="100%" />
          <p>${apod.image.explanation}</p>
      `;
  }
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
  let { apod } = state;
  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => updateStore(store, { apod }));
};

/**
 * Returns an array of (length 2 string) arrays each containing a formatted
 * string label (first element) for the associated rover stat (second element)
 * @param {string} rover
 * @returns {Array[]} - NB array of arrays
 */
const getRoverInfo = async (rover) => {
  const reqRoute = `http://localhost:3000/rover-info/${rover}`;
  return await fetch(reqRoute).then((raw) => raw.json());
};

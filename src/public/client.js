'use strict';

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
    formattedEntries: [],
  },
};

const root = document.getElementById('root');

const updateStore = (state, newState) =>
  (state = Object.assign(state, newState));

const render = async (root, state) => {
  const app = await App(state);
  clearLoading();
  return reduce(app, append, root);
};

const App = async (state) => [
  MainHeading('main-heading', state),
  Nav('nav-container', state),
  await Card('card', state),
];

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

const MainHeading = (className, { currentRover }) =>
  Component('h1', className, currentRover.name);

const NavItem = (className, rover) => Component('li', className, rover);

const Nav = (className, state) => {
  const { rovers } = state;
  const nav = Component('nav', className);
  const navList = Component('ul');
  append(nav, navList);
  rovers.forEach((rover) => append(navList, NavItem('nav-item', rover)));
  return nav;
};

const CardBgImage = (className, state) => {
  const { name: rover } = state.currentRover;
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

const CardInfo = async (state) => {
  await getRoverInfo(state);
  const { name, formattedEntries } = state.currentRover;

  const cardInfo = Component('div', 'card__info');

  const roverTitle = Component(
    'label',
    'card__label',
    `${name}<h2 class="card__info-heading">${name}</h2>`
  );

  append(cardInfo, roverTitle);

  const statsContainer = Component('ul', 'card__stats-container');

  formattedEntries
    .slice(1) // don't need formattedEntries[0] -> rover title handled above
    .map((entry) =>
      Component(
        'label',
        'card__label',
        `${entry[0]}<li class="card__entry">${entry[1]}</li>`
      )
    )
    .forEach((el) => append(statsContainer, el));

  append(cardInfo, statsContainer);

  return cardInfo;
};

const Card = async (className, state) => {
  const card = Component('div', className);

  const cardInfo = await CardInfo(state);

  const cardChildren = [
    CardBgImage('card__bg-image', state),
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

const getRoverInfo = async (state) => {
  const { name: rover } = state.currentRover;

  const reqRoute = `http://localhost:3000/rover-info/${rover.toLowerCase()}`;
  const data = await fetch(reqRoute).then((raw) => raw.json());

  const updatedStore = store;
  updatedStore.currentRover = data;

  updateStore(store, updatedStore);
};

'use strict';

// ------------------------------------------------------  UTILS

const root = document.getElementById('root');

const getCurrRoverIdx = (state) => {
  return state.rovers.indexOf(state.currentRover);
};

const RoverData = (state) => ({
  index: getCurrRoverIdx(state),
});

const append = (parent, child) => {
  parent.append(child);
  return parent;
};

const reduce = (arr, reducer, accum) => {
  if (!Array.isArray(arr)) throw new Error('arr argument type must be array');
  if (typeof reducer != 'function')
    throw new Error('reducer argument type must be function');
  let i = 0;
  if (!accum) accum = arr[i++];
  for (i; i < arr.length; i++) {
    accum = reducer(accum, arr[i]);
  }
  return accum;
};

const clearDomEl = (el) => (el.innerHTML = '');

const cardAnimate = (currCard) => {
  const prevIdx = store.rovers.indexOf(store.previousRover);
  const newIdx = store.rovers.indexOf(store.currentRover);
  if (newIdx > prevIdx) {
    currCard.style.transform = 'translateX(-120vw)';
  } else if (newIdx < prevIdx) {
    currCard.style.transform = 'translateX(120vw)';
  }
};

const handleCardAnimation = () => {
  const currentCard = document.querySelector('.card');
  if (currentCard) cardAnimate(currentCard);
};

// ------------------------------------------------------  STATE STORAGE

let store = {
  title: 'Mars Rover Dashboard',
  apod: '',
  rovers: ['Perseverance', 'Curiosity', 'Opportunity', 'Spirit'],
  currentRover: 'Perseverance',
  previousRover: 'Perseverance',
};

store.currentRoverData = RoverData(store);

// ------------------------------------------------------  WHERE IT ALL HAPPENS

const updateRover = async (rover) => {
  store.previousRover = store.currentRover;
  store.currentRover = rover;

  handleCardAnimation();

  const data = await getRoverInfo(rover);
  store.currentRoverData = Object.assign(RoverData(store), data);
  console.log('store:', store);

  render(root, store);
};

const render = (root, state) => {
  const app = App(state);
  clearDomEl(root);
  return reduce(app, append, root);
};

const App = (state) => [
  MainHeading('main-heading', state),
  Nav('nav-container', state, navHandler),
  Card('card', state, galleryBtnHandler.bind(this, state)),
];

window.addEventListener('load', () => {
  updateRover(store.currentRover);
});

// ------------------------------------------------------  COMPONENTS

const Component = (tag, className, innerHtml) => {
  const domEl = document.createElement(tag);
  if (className) domEl.className = className;
  if (innerHtml) domEl.innerHTML = innerHtml;
  return domEl;
};

const MainHeading = (className, { title }) => Component('h1', className, title);

const Nav = (className, state, handler) => {
  const { rovers } = state;

  const nav = Component('nav', className);
  const navList = Component('ul');
  navList.addEventListener('click', handler);
  append(nav, navList);

  rovers.forEach((rover) => append(navList, NavItem('nav-item', rover)));

  return nav;
};

const NavItem = (className, rover) => {
  const navItem = Component('li', className, rover);
  if (store.currentRover == rover) navItem.classList.add('selected');
  return navItem;
};

const navHandler = async (e) => await updateRover(e.target.textContent);

const Card = (className, state, handler) => {
  const { previousRover } = state;
  const prevIndex = state.rovers.indexOf(previousRover);
  const { index: newIndex } = state.currentRoverData;
  const { card: cardInnerHtml } = state.currentRoverData;

  const card = Component('div', className, cardInnerHtml);
  const galleryBtn = card.querySelector('.card__gallery-btn');
  galleryBtn.addEventListener('click', handler);

  if (newIndex > prevIndex) {
    card.style.animation = 'animate-right 0.4s ease-in 1 reverse';
  } else if (newIndex < prevIndex) {
    card.style.animation = 'animate-left 0.4s ease-in 1 reverse';
  }

  return card;
};

const galleryBtnHandler = (state) => {
  console.log('rover photos ', state.currentRoverData.photos);
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

const getImageOfTheDay = (state) => {
  let { apod } = state;
  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => updateStore(store, { apod }));
};

const getRoverInfo = async (rover) => {
  const route = `http://localhost:3000/rover-info/${rover.toLowerCase()}`;
  return await fetch(route).then((raw) => raw.json());
};

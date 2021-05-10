'use strict';

// ------------------------------------------------------  UTILS

const root = document.getElementById('root');

const indexGenerator = function* (arr) {
  let i = 0;
  while (i < arr.length) {
    yield i++;
  }
};

const getCurrRoverIdx = (state) => {
  return state.rovers.indexOf(state.currentRover);
};

const RoverData = (state) => ({
  index: getCurrRoverIdx(state),
});

const append = (parent, ...children) =>
  children.reduce((accum, child) => {
    accum.append(child);
    return accum;
  }, parent);

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
  Card('card', state, openGalleryHandler.bind(this, state)),
  GalleryModal('modal', state, closeGalleryHandler),
];

window.addEventListener('load', () => {
  updateRover(store.currentRover);
});

// ------------------------------------------------------  COMPONENTS

// --------------------------------- BASE COMPONENTS

const Component = (tag, className, innerHtml) => {
  const domEl = document.createElement(tag);
  if (className) domEl.className = className;
  if (innerHtml) domEl.innerHTML = innerHtml;
  return domEl;
};

const Icon = (type) => Component('i', 'material-icons', `${type}`);

const Button = (className, label, handler, iconType) => {
  const btn = Component('button', className, label);
  if (iconType) btn.prepend(Icon(iconType));
  if (handler) btn.addEventListener('click', handler);

  return btn;
};

// --------------------------------- EXTENDED COMPONENTS

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

const GalleryModal = (className, state, closeHandler) => {
  const modal = Component('div', className);
  const closeModalBtn = CloseModalBtn(closeHandler);
  const gallery = Gallery('gallery__container', state);
  append(modal, closeModalBtn, gallery);

  return modal;
};

const CloseModalBtn = (handler) =>
  Button('modal__cancel-btn', undefined, handler, 'cancel');

const Gallery = (className, state, handler) => {
  const gallery = Component('div', className);
  const heading = GalleryHeading('gallery__heading', state);

  const image = GalleryImage(
    'gallery__image',
    state.currentRoverData.photos[0].imgSrc
  );

  const backBtn = GalleryBtn('gallery__btn--back', 'back');
  const forwardBtn = GalleryBtn('gallery__btn--forward', 'forward');

  append(gallery, heading, image, backBtn, forwardBtn);

  return gallery;
};

const GalleryHeading = (className, { currentRover }) =>
  Component('h2', className, `${currentRover}'s most recent photos`);

const GalleryImage = (className, imageUrl) => {
  const img = Component('div', className);
  img.setAttribute('style', `background-image: url("${imageUrl}");`);

  return img;
};

const GalleryBtn = (className, direction) =>
  Button(
    className,
    undefined,
    undefined,
    `${direction == 'back' ? 'arrow_back' : 'arrow_forward'}`
  );

// ------------------------------------------------------  EVENT HANDLERS

const navHandler = async (e) => await updateRover(e.target.textContent);

const openGalleryHandler = (state) => {
  const modal = document.querySelector('.modal');
  modal.classList.toggle('show');
  setTimeout(() => {
    modal.classList.toggle('slide-in');
  }, 0);
};

const closeGalleryHandler = (e) => {
  const modal = e.target.closest('.modal');
  modal.classList.toggle('slide-in');
  setTimeout(() => modal.classList.toggle('show'), 500);
};

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

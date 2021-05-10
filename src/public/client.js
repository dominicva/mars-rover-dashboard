'use strict';

// ------------------------------------------------------  UTILS

const root = document.getElementById('root');

const getCurrRoverIdx = (state) => {
  return state.rovers.indexOf(state.currentRover);
};

const RoverData = (state) => ({
  index: getCurrRoverIdx(state),
});

const append = (parent, ...children) =>
  reduce(
    children,
    (a, b) => {
      a.append(b);
      return a;
    },
    parent
  );

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

const iteratePhotoIndex = (state, direction) => {
  let { currentPhotoIndex: i } = state;
  switch (direction) {
    case '+':
      i++;
      break;
    case '-':
      i--;
      break;
  }
  if (i == -1) i = 0;
  state.currentPhotoIndex = i;
};

// ------------------------------------------------------  STATE STORAGE

let store = {
  title: 'Mars Rover Dashboard',
  apod: '',
  rovers: ['Perseverance', 'Curiosity', 'Opportunity', 'Spirit'],
  currentRover: 'Perseverance',
  previousRover: 'Perseverance',
  currentPhotoIndex: 0,
};

store.currentRoverData = RoverData(store);

// ------------------------------------------------------  WHERE IT ALL HAPPENS

const updateRover = async (rover) => {
  store.previousRover = store.currentRover;
  store.currentRover = rover;
  store.currentPhotoIndex = 0;

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
  Modal(
    'modal',
    state,
    closeGalleryHandler,
    changePhotoHandler.bind(this, state)
  ),
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

/**
 * Constructor for generic DOM button element
 * @param {string} className - CSS class
 * @param {object} opts - options: label, handler, iconType
 */
const Button = (className, opts) => {
  const btn = Component('button', className);
  if (opts) {
    const { label, handler, iconType } = opts;
    if (label) btn.textContent = label;
    if (iconType) btn.prepend(Icon(iconType));
    if (handler) btn.addEventListener('click', handler);
  }
  return btn;
};

// --------------------------------- EXTENDED COMPONENTS

const MainHeading = (className, { title }) => Component('h1', className, title);

const Nav = (className, state, handler) => {
  const nav = Component('nav', className);
  const navList = NavList(state);
  navList.addEventListener('click', handler);
  return append(nav, navList);
};

const NavList = ({ rovers }) =>
  append(Component('ul'), ...rovers.map((r) => NavItem('nav-item', r)));

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

const Modal = (className, state, closeHandler, imgGalleryHandler) =>
  append(
    Component('div', className),
    ...[
      CloseModalBtn(closeHandler),
      Gallery('gallery__container', state, imgGalleryHandler),
      ImageInfo('image__info'),
    ]
  );

const CloseModalBtn = (handler) =>
  Button('modal__cancel-btn', { handler: handler, iconType: 'cancel' });

const Gallery = (className, state, handler) => {
  const { currentPhotoIndex: imgIdx, currentRoverData: roverData } = state;

  const gallery = Component('div', className);
  const heading = GalleryHeading('gallery__heading', state);
  const image = GalleryImage('gallery__image', roverData.photos[imgIdx].imgSrc);
  const btns = GalleryBtns('gallery__btns-container', handler);

  return append(gallery, heading, image, btns);
};

const GalleryHeading = (className, { currentRover }) =>
  Component('h2', className, `${currentRover}'s most recent photos`);

const GalleryImage = (className, imageUrl) => {
  const img = Component('div', className);
  img.style.backgroundImage = `url("${imageUrl}")`;
  return img;
};

const GalleryBtns = (className, handler) => {
  const container = Component('div', className);
  const backBtn = GalleryBtn('gallery__btn--back', 'back');
  const forwardBtn = GalleryBtn('gallery__btn--forward', 'forward');

  container.addEventListener('click', handler);
  append(container, backBtn, forwardBtn);
  return container;
};

const GalleryBtn = (className, direction) =>
  Button(className, {
    iconType: `${direction == 'back' ? 'arrow_back' : 'arrow_forward'}`,
  });

const ImageInfo = (className) => {
  const section = Component('section', className);
  return section;
};

// ------------------------------------------------------  EVENT HANDLERS

const changePhotoHandler = (state) => {
  const photo = document.querySelector('.gallery__image');
  const direction = event.target
    .closest('button')
    .matches('.gallery__btn--forward')
    ? '+'
    : '-';

  iteratePhotoIndex(state, direction);

  photo.style.backgroundImage = `url('${
    state.currentRoverData.photos[state.currentPhotoIndex].imgSrc
  }')`;
};

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

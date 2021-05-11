'use strict';

// ------------------------------------------------------  IMMUTABLE

const { List, Map, toJS } = Immutable;

// ------------------------------------------------------  UTILS

const root = document.getElementById('root');

const compose = (arg, fn) => fn(arg);

const composeDomEls = (parent, ...children) =>
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
  const prevIdx = store.get('rovers').indexOf(store.get('previousRover'));
  const newIdx = store.get('rovers').indexOf(store.get('currentRover'));
  if (newIdx > prevIdx) {
    currCard.style.transform = 'translateX(-120vw)';
  } else if (newIdx < prevIdx) {
    currCard.style.transform = 'translateX(120vw)';
  }
};

const triggerCardAnimation = () => {
  const currentCard = document.querySelector('.card');
  if (currentCard) cardAnimate(currentCard);
};

const iteratePhotoIndex = (state, direction) => {
  let { currentPhotoIndex: i } = state;
  if (i == state.currentRoverData.photos.length - 1) return;
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
  return state;
};

const updatePhotoInfo = (state) => {
  document.querySelector('.image-info__container').remove();
  document
    .querySelector('.gallery__container')
    .append(ImageInfo('image-info__container', state));
  return state;
};

const updatePhotoImage = (state) => {
  document.querySelector('.gallery__image').style.backgroundImage = `url('${
    state.currentRoverData.photos[state.currentPhotoIndex].imgSrc
  }')`;
  return state;
};

const getCurrRoverIdx = (state) => {
  state = state.toJS();
  return state.rovers.indexOf(state.currentRover);
};

const RoverData = (state) =>
  Map({
    index: getCurrRoverIdx(state),
  });

// ------------------------------------------------------  STATE STORAGE

let store = Map({
  title: 'Mars Rover Dashboard',
  apod: '',
  rovers: ['Perseverance', 'Curiosity', 'Opportunity', 'Spirit'],
  currentRover: 'Perseverance',
  previousRover: 'Perseverance',
  currentPhotoIndex: 0,
});

store = store.set('currentRoverData', RoverData(store));

// ------------------------------------------------------  WHERE IT ALL HAPPENS

const updateRover = async (rover) => {
  store = store
    .set('previousRover', store.get('currentRover'))
    .set('currentRover', rover)
    .set('currentPhotoIndex', 0);

  triggerCardAnimation();

  const data = await getRoverInfo(rover);
  store = store.set('currentRoverData', RoverData(store).merge(data));

  render(root, store);
};

const render = (root, state) => {
  const app = App(state.toJS());
  clearDomEl(root);
  return reduce(app, composeDomEls, root);
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
  updateRover(store.get('currentRover'));
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
  const navList = NavList(state);
  navList.addEventListener('click', handler);
  return composeDomEls(Component('nav', className), navList);
};

const NavList = ({ rovers }) =>
  composeDomEls(Component('ul'), ...rovers.map((r) => NavItem('nav-item', r)));

const NavItem = (className, rover) => {
  const navItem = Component('li', className, rover);
  if (store.get('currentRover') == rover) navItem.classList.add('selected');
  return navItem;
};

const Card = (className, state, handler) => {
  const { previousRover, rovers, currentRoverData } = state;
  const { index: newIndex, card: cardHtml } = currentRoverData;

  const card = Component('div', className, cardHtml);
  card.querySelector('.card__gallery-btn').addEventListener('click', handler);

  const prevIndex = rovers.indexOf(previousRover);
  if (newIndex > prevIndex) {
    card.style.animation = 'animate-right 0.4s ease-in 1 reverse';
  } else if (newIndex < prevIndex) {
    card.style.animation = 'animate-left 0.4s ease-in 1 reverse';
  }

  return card;
};

const Modal = (className, state, closeHandler, imgGalleryHandler) =>
  composeDomEls(
    Component('div', className),
    CloseModalBtn(closeHandler),
    Gallery('gallery__container', state, imgGalleryHandler)
  );

const CloseModalBtn = (handler) =>
  Button('modal__cancel-btn', { handler: handler, iconType: 'cancel' });

const Gallery = (className, state, handler) => {
  const { currentPhotoIndex: imgIdx, currentRoverData: roverData } = state;

  return composeDomEls(
    Component('div', className),
    GalleryHeading('gallery__heading', roverData),
    GalleryImage('gallery__image', roverData.photos[imgIdx].imgSrc),
    GalleryBtns('gallery__btns-container', handler),
    ImageInfo('image-info__container', state)
  );
};

const GalleryHeading = (className, { name: rover }) =>
  Component('h2', className, `${rover}'s most recent photos`);

const GalleryImage = (className, imageUrl) => {
  const img = Component('div', className);
  img.style.backgroundImage = `url("${imageUrl}")`;
  return img;
};

const GalleryBtns = (className, handler) => {
  const container = composeDomEls(
    Component('div', className),
    GalleryBtn('gallery__btn--back', 'back'),
    GalleryBtn('gallery__btn--forward', 'forward')
  );

  container.addEventListener('click', handler);
  return container;
};

const GalleryBtn = (className, direction) =>
  Button(className, {
    iconType: `${direction == 'back' ? 'arrow_back' : 'arrow_forward'}`,
  });

const ImageInfo = (className, state) => {
  const { currentPhotoIndex: i, currentRoverData: rover } = state;

  return composeDomEls(
    Component('ul', className),
    Component(
      'label',
      'image-info__label',
      `Camera<li class="image-info__item">${rover.photos[i].camera}</li>`
    ),
    Component(
      'label',
      'image-info__label',
      `Earth Date<li class="image-info__item">${rover.photos[i].earthDate}</li>`
    )
  );
};

// ------------------------------------------------------  EVENT HANDLERS

const changePhotoHandler = (state) => {
  const direction = event.target
    .closest('button')
    .matches('.gallery__btn--forward')
    ? '+'
    : '-';

  return reduce(
    [updatePhotoImage, updatePhotoInfo],
    compose,
    iteratePhotoIndex(state, direction)
  );
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

// ------------------------------------------------------  API CALL

const getRoverInfo = async (rover) => {
  const route = `http://localhost:3000/rover-info/${rover.toLowerCase()}`;
  return await fetch(route).then((raw) => raw.json());
};

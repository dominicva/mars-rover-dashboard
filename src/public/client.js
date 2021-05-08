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

// ------------------------------------------------------  STATE STORAGE

let store = {
  title: 'Mars Rover Dashboard',
  apod: '',
  rovers: ['Curiosity', 'Opportunity', 'Spirit'],
  currentRover: 'Curiosity',
  previousRover: 'Curiosity',
};

store.currentRoverData = RoverData(store);

// ------------------------------------------------------  WHERE IT ALL HAPPENS

const updateRover = async (rover) => {
  store.previousRover = store.currentRover;
  store.currentRover = rover;

  const prevIndex = store.rovers.indexOf(store.previousRover);
  const newIndex = store.rovers.indexOf(store.currentRover);
  const currentCard = document.querySelector('.card');

  if (currentCard) {
    if (newIndex > prevIndex) {
      currentCard.style.transform = 'translateX(-120vw)';
    } else if (newIndex < prevIndex) {
      currentCard.style.transform = 'translateX(120vw)';
    }
  }
  const data = await getRoverInfo(rover);
  console.log('data', data);
  store.currentRoverData = Object.assign(RoverData(store), data);

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
  Card('card', state),
];

window.addEventListener('load', () => {
  updateRover(store.currentRover);
});

// ------------------------------------------------------  COMPONENTS

const Component = (tag, className, innerHtml) => {
  // return `
  //   <${tag} class="${className ? className : ''}"
  //   >${innerHtml ? innerHtml : ''}
  //   </${tag}
  // `;
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
  navList.addEventListener('click', (e) => handler(e));
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

const Card = (className, state) => {
  // TODO: refactor so here we only create parent card el and insert
  // template literal from backend response as the innerHTML
  const { previousRover } = state;
  const prevIndex = state.rovers.indexOf(previousRover);
  const { index: newIndex } = state.currentRoverData;

  const { card: cardInnerHtml } = state.currentRoverData;

  const card = Component('div', className, cardInnerHtml);

  if (newIndex > prevIndex) {
    card.style.animation = 'animate-right 0.4s ease-in 1 reverse';
  } else if (newIndex < prevIndex) {
    card.style.animation = 'animate-left 0.4s ease-in 1 reverse';
  }

  // const cardInfo = CardInfo(state);

  // const cardChildren = [
  //   CardBgImage('card__bg-image', state),
  //   ExpandGalleryBtn('card__gallery-btn', 'Expand gallery'),
  //   cardInfo,
  // ];

  // return reduce(cardChildren, append, card);
  return card;
};

const CardBgImage = (className, state) => {
  const { currentRover: r } = state;
  const img = Component('div', className);
  img.style = `background-image: url('./assets/media/${r.toLowerCase()}.jpeg');`;
  return img;
};

const ExpandGalleryBtn = (className, text, handler) => {
  const btn = Component('button', className, text);
  const icon = Component('i', 'material-icons', 'add');
  btn.prepend(icon);
  btn.addEventListener('click', (e) => handler(e));
  return btn;
};

const CardInfo = (state) => {
  const { currentRover } = state;
  const { formattedEntries } = state.currentRoverData;

  const cardInfo = Component('div', 'card__info');

  const roverTitle = Component(
    'label',
    'card__label',
    `Name<h2 class="card__info-heading">${currentRover}</h2>`
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

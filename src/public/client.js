'use strict';

// TODO: refactor store to use Immutable
let store = {
  user: { name: 'Student' },
  title: 'Mars Rover Dashboard',
  apod: '',
  rovers: ['Curiosity', 'Opportunity', 'Spirit'],
  currentRover: 'Curiosity',
};

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async (root, state) => {
  // root.innerHTML = App(state);
  const app = App(state);

  return app.reduce((root, component) => {
    root.append(component);
    return root;
  }, root);
};

// create content
const App = (state) => {
  let { title, apod, rovers } = state;

  return [
    ClearLoading(),
    MainHeading('main-heading', title),
    Nav('nav-container', ...rovers),
    CardBgImage('card__bg-image', store.rovers[0]),
  ];
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

const Component = function (tag, className, text) {
  const domEl = document.createElement(tag);
  if (className) domEl.className = className;
  if (text) domEl.textContent = text;

  return domEl;
};

const ClearLoading = () => (root.innerHTML = '');

const MainHeading = (className, text) => Component('h1', className, text);

const NavItem = (className, rover) => Component('li', className, rover);

const Nav = (className, ...rovers) => {
  const nav = Component('nav', className);
  const navList = Component('ul');
  nav.append(navList);

  rovers.forEach((rover) => navList.append(NavItem('nav-item', rover)));

  return nav;
};

const CardBgImage = (className, rover) => {
  const img = Component('div', className);
  img.style = `background-image: url('./assets/media/${rover.toLowerCase()}.jpeg');`;
  return img;
};

const ExpandGalleryBtn = function (x) {
  // TODO:
  // innerHTML for expand gallery button
  // add click listener with launchGallery as callback
};

const CardInfo = function (state) {
  // TODO:
  // make request for rover info from backend (CALL TO getRoverInfo)
  // update the store accordingly
  // NB refactor currentRover in store to be Immutable object
};

const RoverCard = function (className, rover) {
  const html = `
    <div class="${className}">
     ${CardBgImage(rover)}
    </div>`;

  return html;
};

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

  return data;
};

const getRoverInfo = function (state) {
  // TODO: check this logic works, particularly roverInfo destructuring
  // in updateStore call
  let { currentRover } = state;

  fetch(`http://localhost:3000/rover-info/${currentRover.toLowerCase()}`)
    .then((res) => res.json())
    .then((roverInfo) => updateStore(store, { roverInfo }));
};

// ------------------------------------------------------  LEGACY TO BE ULTIMAT ELY REMOVED

// {
/* <section>
            <h3>Put things on the page!</h3>
            <p>Here is an example section.</p>
            <p>
                One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                but generally help with discoverability of relevant imagery.
            </p>
            ${ImageOfTheDay(apod)}
        </section>
      <footer></footer> */
// }

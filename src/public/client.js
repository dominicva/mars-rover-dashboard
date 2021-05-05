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
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  let { title, apod, rovers } = state;

  return `
        ${MainHeading('main-heading', title)}
        ${Nav('nav-container', ...rovers)}
        ${CardBgImage(store.rovers[0])}
        
  `;
};
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

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

const MainHeading = function (className, text) {
  return `<h1 class="${className}">${text}</h1>`;
};

const NavItem = function (className, rover) {
  return `<li class="${className}">${rover}</li>`;
};

const Nav = function (className, ...rovers) {
  let output = `<nav class="${className}"><ul>`;
  rovers.forEach((rover) => (output += NavItem('nav-item', rover)));
  output += `</ul></nav>`;

  return output;
};

const CardBgImage = function (rover) {
  return `
    <div 
      style="background-image: url('./assets/media/${rover.toLowerCase()}.jpeg');" 
      class="card__bg-image"></div>
    `;
};

const ExpandGalleryBtn = function (x) {
  // TODO:
  // innerHTML for expand gallery button
};

const CardInfo = function (state) {
  // TODO: make request for rover info from backend
  // update the store accordingly
  // NB refactor currentRover in store to be object
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

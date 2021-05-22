# Mars Rover Dashboard

### Big Picture

- A vanilla JS SPA that consumes the NASA API

- Allows the user to select which rover's information they want to view.

- Once they have selected a rover, they will be able to view a gallery of recent images taken by that rover, as well as some additional information about the rover and its mission.

### Run on your local machine

1. Get the code
2. You'll need to have node (and npm) installed
3. Run `npm install`
4. Run `npm start` to start local express server at port 3000

### Code details

1. The app's state lives in an ImmutableJS Map with variable name `store` in src/public/client.js.
2. State gets updated whenever the user changes the rover they want to view.
3. State tracks the previous and current rover to handle transitions.
4. On state change, `render()` gets called
5. `render()` calls `App()`, which returns an array of the all the app's components.
6. `render` then reduces these components with `composeDomEls()` as the reducer.
7. `composeDomEls()` tries to make DOM manipulation feel more functional by wrapping `Element.append()` in `reduce()` with child elements as the reducees and the parent element as the initial accumulator value.
8. For fun, and again to make things feel more 'functional', I implemented my own simple version of `Array.prototype.reduce()`. See the utils section in src/public/client.js
9. I included logic on the backend so when rover data gets fetched the http response includes an html string for the new `Card()` component to be rendered.

### What needs work

- There's currently no build step, and so no modules. Before adding more features I'd probably refactor to include this.
- The current use of ImmutableJS is naive.
- Everything of course! :)

### Trello kanban board

Here's the [Trello board](https://trello.com/b/DYiY5pwu) I made for the project

### Figma designs

Here are the [designs](https://www.figma.com/proto/INxnITiX0tKIFFsR1Iw78K/mars-rover-dashboard?page-id=0%3A1&node-id=2%3A2&viewport=244%2C259%2C1&scaling=scale-down)

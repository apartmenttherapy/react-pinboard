# react-pinboard

`<ReactPinboard>` is a component for responsive Pinterest-style layouts. Pass in any number of children to see them rendered in equally-weighted, dynamic columns.

## Props
* __`cols`__: Can be a static number like `3` or an array of media objects, e.g.:  
  ```
  [
    { media: '(max-width: 1000px)', cols: 4 },
    { media: '(max-width: 500px)', cols: 3 },
    { media: '', cols: 2 }
  ]
  ```
  The first-matching media query will be used, and the columns will be adjusted in real-time as the browser squishes and stretches.
  
* __`spacing`__: The vertical and horizontal space between columns and children. Can be any CSS length value, e.g. `2em`, `15px`, `3vh`.

## Usage

Download on npm: `npm install react-pinboard`

Sample usage:
```
const ReactPinboard = require('react-pinboard');

const cols = [
  { media: '(max-width: 1000px)', cols: 4 },
  { media: '(max-width: 500px)', cols: 3 },
  { media: '', cols: 2 }
];

ReactDOM.render(
  <ReactPinboard cols={cols} spacing="2em">
    <img src="..." />
    <div>
      <h3>Heading</h3>
      <p>...</p>
    </div>
    <SomeOtherReactComponent />
    ...
  </ReactPinboard>,
  document.querySelector('pinboard-container');
);
```


## Features
* __Accepts any child types.__ You can even mix and match images, text, and other rich components, to create a pinboard that's truly customized.

* __Child order is preserved.__ The children will appear in the pinboard in left-to-right, top-to-bottom order. This means that if your children have an obvious numeric order, you don't need to worry about adjacent children being spread way across from each other.  

* __Auto-weighted columns.__ ReactPinboard is economical — it takes up as little vertical space as possible by ensuring that the columns are filled as close to equal-weigh as possible (while maintaining child order).  

* __Safe for server-rendering.__ The server can't measure viewport size, so it assumes a "mobile-first" approach and determines column number from the last value of the `cols` array. The server-render also doesn't know the rendered child heights for column weighting, so it equally-weights the columns. This is naive, but hopefully close enough to the re-layout on mount that it still feels fast for your end users.


## Examples
Here's a few places you can see `react-pinboard` in the wild:
* http://www.thekitchn.com/what-to-read-this-weekend-october-19-25-225017
* http://www.apartmenttherapy.com/renovation-diary-karin-jeffs-bathroom-221802 (Note: numeric ordering is preserved)

// import './footer.js';
// export function createHeading() {
//   const element = document.createElement('h2');
//   element.textContent = 'Hello webpack';
//   element.addEventListener('click', () => alert('Hello webpack'));
//   return element;
// }
import footer from './footer.js';
console.log(footer());
export default () => {
  const element = document.createElement('h2');
  element.textContent = 'Hello webpack';
  element.addEventListener('click', () => alert('Hello webpack'));
  return element;
};

require('normalize.css');
require('./styles/main.scss');

// Dirty hack for development
// I promise to solve this
if (process.env.NODE_ENV === 'development') {
  document.querySelector('link').remove();
}

require('normalize.css');
require('./styles/main.scss');

const calculateAndSetUnavailabilityDays = () => {
  const el = document.getElementById('unavailable_days');

  const now = new Date();
  now.setHours(0);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const finishDate = new Date('2022-06-30');
  const daysCount = ((finishDate - now) / (1000 * 60 * 60 * 24)).toFixed();

  el.innerText = daysCount;
};

// Dirty hack for development
// I promise to solve this
if (process.env.NODE_ENV === 'development') {
  document.querySelector('link').remove();
}

(() => {
  calculateAndSetUnavailabilityDays();
})();

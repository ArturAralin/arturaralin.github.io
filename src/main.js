require('babel-polyfill');
require('normalize.css');
require('./styles/main.scss');

const openSourceActivity = async () => {
  const result = await (await fetch('https://api.github.com/search/issues?q=author:ArturAralin+type:pr')).json();
  const prs = result.items.filter(pr => pr.author_association !== 'OWNER').slice(0, 10);

  const items = prs.map((pr) => {
    const { title, state, repository_url: repositoryUrl } = pr;
    const url = pr.pull_request.html_url;
    const repo = repositoryUrl.split('repos/')[1].split('/')[1];

    const li = document.createElement('li');
    li.innerHTML = `
    <span><a href="${repositoryUrl}" target="blank">${repo}</a>:</span>
    <span><a href="${url}" target="blank">${title}</a></span>
    <span>(${state})</span>
    `;

    return li;
  });

  const openSourceActivityBlock = document.getElementById('open_source_activity');
  items.forEach(item => openSourceActivityBlock.appendChild(item));
};

// const calculateAndSetUnavailabilityDays = () => {
//   const el = document.getElementById('unavailable_days');

//   const now = new Date();
//   now.setHours(0);
//   now.setMinutes(0);
//   now.setSeconds(0);
//   now.setMilliseconds(0);

//   const finishDate = new Date('2022-06-30');
//   const daysCount = ((finishDate - now) / (1000 * 60 * 60 * 24)).toFixed();

//   el.innerText = daysCount;
// };

// Dirty hack for development
// I promise to solve this
if (process.env.NODE_ENV === 'development') {
  document.querySelector('link').remove();
}

(async () => {
  try {
    await openSourceActivity();
  } catch (e) {
    console.error(e);
  }
})();

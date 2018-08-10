require('./main.scss');
const Particles = require('particlesjs');
const md = require('markdown');

window.onload = () => {
  Particles.init({
    selector: '#bg',
    color: '#0c182a'
  });
}

let scrollYValueBeforePopup = null;

const getScrollValue = () => (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);

const createPopUp = (topicName, html) => {
  const app = document.querySelector('.app');
  const popup = document.createElement('div');
  popup.classList.add('popup');

  // Header
  const header = document.createElement('header');
  const h1 = document.createElement('h1');
  h1.innerText = topicName;

  header.classList.add('popup__header');
  const closeButton = document.createElement('button');
  closeButton.innerText = '×';
  closeButton.classList.add('popup__header__button');

  closeButton.addEventListener('click', () => {
    app.style.display = '';
    popup.remove();
    window.scrollTo(0, scrollYValueBeforePopup);
    scrollYValueBeforePopup = null;
  })

  header.appendChild(h1);
  header.appendChild(closeButton);


  const content = document.createElement('main');
  content.innerHTML = html;
  content.classList.add('popup__main');

  popup.appendChild(header);
  popup.appendChild(content);

  scrollYValueBeforePopup = getScrollValue();
  app.style.display = 'none';
  window.scrollTo(0, 0);
  
  return popup;
};


window.popUpCreator = (mdFileName, topic) => {
  fetch(`/data/${mdFileName}.md`)
    .then(r => r.text())
    .then(r => {
      const f = md.parse(r);
      const p = createPopUp(topic, f);

      document.body.appendChild(p);
    })
};






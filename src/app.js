require('./main.scss');
const Particles = require('particlesjs');
const md = require('markdown');

const BG_MIN_WIDTH = 1024;
let scrollYValueBeforePopup = null;
let animatedBackground;

const getScrollValue = () => (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);

const getAttrVal = (attrName, str) => {
  const r = new RegExp(`${attrName}="([^"]*)"`);
  const [attr] = str.match(r);

  return attr.slice(5, attr.length - 1);
};

const replaceImgs = (html) => {
  console.log(html);
  return html.replace(/<p><img.*>.*<\/p>/gm, (val) => {
    const src = getAttrVal('src', val);
    const alt = getAttrVal('alt', val);

    return `<div class="popup__main__picture">
      <div class="popup__main__picture__bg" style="background: url(${src}) center;"></div>
      <img alt="${alt}" src="${src}" />
    </div>`;
  });
};

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
  });

  header.appendChild(h1);
  header.appendChild(closeButton);


  const content = document.createElement('main');

  console.log(replaceImgs(html));

  content.innerHTML = replaceImgs(html);
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
    .then((r) => {
      const f = md.parse(r);
      const p = createPopUp(topic, f);

      document.body.appendChild(p);
    });
};

const getBodyWidth = () => document.querySelector('body').offsetWidth;

const resizeHandler = () => {
  const isShowBg = getBodyWidth() > BG_MIN_WIDTH;

  if (!animatedBackground) {
    animatedBackground = Particles.init({
      selector: '#bg',
      color: '#0c182a',
      maxParticles: 1000,
    });
  }

  if (isShowBg) {
    animatedBackground.resumeAnimation();
  } else {
    animatedBackground.pauseAnimation();
  }
};


window.onload = () => {
  resizeHandler();

  window.addEventListener('resize', resizeHandler);
};

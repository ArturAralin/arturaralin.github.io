const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');

const CV_HTML = path.resolve(__dirname, '../cv.html');
const ROOT_DIR = path.resolve(__dirname, '../');
const PDF_OUTPUT = path.resolve(__dirname, '../cv.pdf');

const srcHtml = fs.readFileSync(CV_HTML, 'utf8');
const options = { format: 'A4' };
const styles = `<style>
  body {
    color: black;
    background: white;
    font-size: 10px !important;
  }

  .cv {
    padding: 0 2em;
  }

  .cv__base_information {
    float: left;
    width: 30%
  }

  .cv__progress_information {
    float: right;
    width: 65%;
  }

  .cv__progress_information h2 {
    font-size: 2em;
  }

  .cv__progress_information__item__techs {
    font-size: 1em;
  }

  .cv__header__title {
    padding: 0.5em 0 0 1em;
  }
</style>`;

const html = [
  '/styles.css',
  '/static/photo.jpg',
].reduce((h, p) => {
  const val = `file://${ROOT_DIR}${p}`;
  return h.replace(p, val);
}, srcHtml);

const s = `${html}${styles}`;

pdf.create(s, options).toFile(PDF_OUTPUT, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('PDF CV Successfully builded');
});

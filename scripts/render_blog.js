const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { URL } = require('url');
const markdownIt = require('markdown-it');
const hljs = require('highlight.js');

const md = markdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {}
    }

    return '';
  },
});

const PAGES_DIR = path.resolve(__dirname, '../pages');
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const POSTS_DIR = path.resolve(__dirname, '../post');
const INDEX_DIR = path.resolve(__dirname, '..');


const BASE_TEMPLATE = fs.readFileSync(path.resolve(TEMPLATES_DIR, './base.html'), 'utf-8');
const GENERAL_TEMPLATE = fs.readFileSync(path.resolve(TEMPLATES_DIR, './general.html'), 'utf-8');
const ARTICLE_TEMPLATE = fs.readFileSync(path.resolve(TEMPLATES_DIR, './article.html'), 'utf-8');

async function getGithubActivity() {
  const result = await (await fetch('https://api.github.com/search/issues?q=author:ArturAralin+type:pr')).json();

  const activity = result.items.filter(pr => pr.author_association !== 'OWNER');

  return activity
    .slice(0, 10)
    .map(({
      title,
      pull_request: {
        html_url
      }
    }) => {
      const url = new URL(html_url);
      const repoName = url.pathname.split('/')[2];

      return `<li><a href="${html_url}" target="_blank">[${repoName}] ${title}</a></li>`
    })
    .join('\n');
};

function render(template, props) {
  return template.replace(/\{\{(.*)\}\}/g, (_, tag) => {
    return props[tag] || `{{${tag}}}`;
  });
}

function patchImgUrls(html) {
  return html.replace(/<img(.*)>/g, (imgTag) => {
    return imgTag.replace(/(src="(.*)" )/g, (src, _, imageUrl) => {
      console.log(imageUrl);
      return src;
    });
  });
}

async function main() {
  const {
    articles = [],
    index
  } = JSON.parse(fs.readFileSync(path.resolve(PAGES_DIR, './index.json')));

  const gh = []; // await getGithubActivity();

  const indexPageHtml = render(BASE_TEMPLATE, {
    title: index.title,
    body: render(GENERAL_TEMPLATE, {
      activity: gh,
      posts: articles.map((article) => {
        return `<li><a href="/post/${article.urlName}">${article.title}</a></li>`
      }).join('\n'),
    }),
  });

  fs.writeFileSync(path.resolve(INDEX_DIR, './index.html'), indexPageHtml);

  articles.forEach((article) => {
    const articleMarkDown = fs.readFileSync(path.resolve(PAGES_DIR, `${article.mdFile}`), 'utf-8');
    const articleHtml = patchImgUrls(md.render(articleMarkDown));

    fs.writeFileSync(
      path.resolve(POSTS_DIR, article.urlName),
      render(BASE_TEMPLATE, {
        title: article.title,
        body: render(ARTICLE_TEMPLATE, {
          content: articleHtml,
        }),
      }),
    );
  });
}

main();

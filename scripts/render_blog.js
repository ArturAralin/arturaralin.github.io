// https://github.com/ArturAralin/arturaralin.github.io/blob/master/pages/logs_analysis_with_pandas/logs_analysis_with_pandas.md

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { URL } = require('url');
const markdownIt = require('markdown-it');
const hljs = require('highlight.js');
const xml = require('xml');
const { minify: minifyHtml } = require('html-minifier');
const string = require('string')
const anchor = require('markdown-it-anchor')

const GITHUB_BLOB_PREFIX = 'https://github.com/ArturAralin/arturaralin.github.io/blob/master';

const md = markdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {}
    }

    return '';
  },
}).use(anchor, {
  permalink: anchor.permalink.headerLink({ safariReaderFix: true })
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
    .slice(0, 5)
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

function render(template, props = {}) {
  const composedHeaders = {
    headers: '',
    ...props,
  };

  return template.replace(/\{\{(.*)\}\}/g, (_, tag) => {
    return composedHeaders[tag] !== undefined
      ? composedHeaders[tag]
      : `{{${tag}}}`
  });
}

function pathUrls(folder, html) {
  return html
    .replace(/<img(.*)>/g, (imgTag) => {
      return imgTag.replace(/src=\"([^"]*)\"/g, (src, imageUrl) => {
        return `src="/pages/${folder}/${imageUrl}"`;
      });
    })
    .replace(/<a(.*)>/g, (imgTag) => {
      return imgTag.replace(/href=\"([^"]*)\"/g, (src, href) => {
        if (href.startsWith('http') || href.startsWith('#')) {
          return `href="${href}"`;
        }

        const newSrc = `${GITHUB_BLOB_PREFIX}/pages/${folder}/${href}`;

        return `href="${newSrc}"`;
      });
    });;
}

function formatDate(rawDate) {
  const date = new Date(rawDate);

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

function sitemapUrl({ loc, lastMod, changeFreq, priority }) {
  const date = new Date(lastMod);

  const addZero = (v) => v < 10 ? `0${v}` : v;

  return {
    url: [
      {},
      {
        loc: [{}, loc],
      },
      {
        lastmod: [{}, `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`],
      },
      {
        changefreq: [{}, changeFreq],
      },
      {
        priority: [{}, priority],
      },
    ]
  };
}

function sitemap(articles) {
  return xml({
    urlset: [
      {
        _attr: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" },
      },
      sitemapUrl({
        loc: 'https://aaralin.ru',
        lastMod: new Date(),
        priority: '1',
        changeFreq: 'daily',
      }),
      ...articles.map((article) => sitemapUrl({
        loc: `https://aaralin.ru/post/${article.urlName}`,
        changeFreq: 'monthly',
        priority: '0.5',
        lastMod: article.updateDate || article.postDate,
      })),
    ]
  });
}

function optimizeHtml(html) {
  return minifyHtml(html, {
    collapseWhitespace: true,
    removeComments: true,
  });
}

async function main() {
  const {
    articles = [],
    index
  } = JSON.parse(fs.readFileSync(path.resolve(PAGES_DIR, './index.json')));

  const orderedArticles = articles.sort((a, b) => {
    return (new Date(b.postDate).getTime()) - (new Date(a.postDate).getTime())
  });

  const postedArticles = orderedArticles.filter((article) => article.postDate);

  const gh = await getGithubActivity();

  // const gh = [];

  const indexPageHtml = render(BASE_TEMPLATE, {
    title: index.title,
    headers: [
      `<meta name="description" content="${index.description}">`
    ].join('\n'),
    body: render(GENERAL_TEMPLATE, {
      activity: gh,
      posts: postedArticles.map((article) => {
        return `<li>
          <a href="/post/${article.urlName}">[${formatDate(article.postDate)}] ${article.title}</a>
          <!--Ключевые слова: ${(article.tags || []).map((tag) => `<small>${tag}</small>`).join(', ')}-->
        </li>`;
      }).join('\n'),
    }),
  });

  // todo: remove all from POSTS_DIR

  fs.writeFileSync(path.resolve(INDEX_DIR, './sitemap.xml'), sitemap(postedArticles));
  fs.writeFileSync(path.resolve(INDEX_DIR, './index.html'), optimizeHtml(indexPageHtml));

  orderedArticles.forEach((article) => {
    const isDraft = !article.postDate;
    const articleMarkDownContent = fs.readFileSync(path.resolve(PAGES_DIR, article.folder, `${article.mdFile}`), 'utf-8');
    const articleMarkDown = isDraft
      ? `# __ЭТО ЧЕРНОВИК. Рано еще. [Лучше посмотри мемы с котами](https://www.yandex.ru/images/search?text=%D0%BC%D0%B5%D0%BC%20%D1%81%20%D0%BA%D0%BE%D1%82%D0%B0%D0%BC%D0%B8)__\n${articleMarkDownContent}`
      : articleMarkDownContent;
    const articleHtml = pathUrls(article.folder, md.render(articleMarkDown));

    fs.writeFileSync(
      path.resolve(POSTS_DIR, article.urlName),
      optimizeHtml(render(BASE_TEMPLATE, {
        title: isDraft
          ? `[Черновик] ${article.title}`
          : article.title,
        body: render(ARTICLE_TEMPLATE, {
          content: articleHtml,
          publishDate: formatDate(article.postDate),
          tags: (article.tags || []).map((tag) => `<u>${tag}</u>`).join(', '),
        }),
      })),
    );
  });
}

main();

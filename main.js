'use strict';

console.log('Привет тебе, посетитель недр консоли!\nЕсли у тебя есть замечания к верстке, оптимизации или ты просто хочешь со мной пообщаться то пиши мне artur.aralin97@gmail.com\n\nWarning! Код, написанный мной, на этом сайте не сжат умышленно, чтобы такие любопытные люди, как вы, могли посмотреть на него :)');

var GITHUB_ACCOUNT_URL = 'https://api.github.com/users/arturaralin/repos';
var IGNORE_REPO = 'ArturAralin/arturaralin.github.io';
var PROJECTS_URL = '/projects/list.json';
var myRepos = document.getElementById('my_repos');

function createTag(text, link) {
  var span = document.createElement('span');
  span.setAttribute('class', 'sel');
  var a = document.createElement('a');
  a.href = link;
  a.text = text;
  a.setAttribute('target', '_blank');
  span.appendChild(a);

  return span;
}

function showOnSite(repo) {
  var description = repo.description;
  var haveHashCode = description && description.indexOf('#showOnSite') > -1 ? true : false;

  return haveHashCode || repo.fork;
}

function appendTags(block, repo) {
  if (showOnSite(repo)) {
    var name = repo.name + (repo.fork ? ' (fork)' : '');
    block.appendChild(createTag(name, repo.html_url));
  }
}

function loadRepos() {
  nanoajax.ajax({url: GITHUB_ACCOUNT_URL}, function(code, res) {
    try {
      var repos = JSON.parse(res);
      var p = document.createElement('p');
      var span = document.createElement('span');
      span.textContent = 'Репозитории: ';
      p.appendChild(span);
      repos.forEach(appendTags.bind(null, p));
      myRepos.appendChild(p);
    } catch(err) {}
  });
}

function init() {
  loadRepos();
}

window.onload = init;

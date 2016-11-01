'use strict';

console.log('Привет тебе, посетитель недр консоли!\nЕсли у тебя есть замечания к верстке, оптимизации или ты просто хочешь со мной пообщаться то пиши мне artur.aralin97@gmail.com\n\nWarning! Код, написанный мной, на этом сайте не сжат умышленно, чтобы такие любопытные люди, как вы, могли посмотреть на него :)');

var GITHUB_ACCOUNT_URL = 'https://api.github.com/users/arturaralin/repos';
var IGNORE_REPO = 'ArturAralin/arturaralin.github.io';
var PROJECTS_URL = '/projects/list.json';
var myRepos = document.getElementById('my_repos');

function loadProjects() {
  function projFactory(name) {
    name = '/projects/' + name;

    return {
      logo: name + '/logo.jpg',
      laptop: name + '/laptop.png',
      tablet: name + '/tablet.png',
      mobile: name + '/mobile.png'
    };
  }

  function createIMGElement(url) {
    var img = document.createElement('img');
    img.src = url;
    return img;
  }

  function appendToContainer(img) {
    myRepos.appendChild(img);
  }

  nanoajax.ajax({url: PROJECTS_URL}, function(code, res) {
    JSON.parse(res)
    .map(projFactory)
    .map(function(project) {
      return createIMGElement(project.logo);
    }).forEach(appendToContainer);
  });
}

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

function appendTags(block, repo) {
  if (repo.full_name !== IGNORE_REPO) {
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

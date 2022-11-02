const {
  T,
  allPass,
  always,
  cond,
  descend,
  equals,
  evolve,
  ifElse,
  isNil,
  join,
  juxt,
  map,
  path,
  pipe,
  prop,
  propEq,
  replace,
  sortWith,
  split,
  toUpper,
  type: ramdaType,
} = require('ramda');
const Handlebars = require('handlebars');
const { resolve: pathResolve } = require('path');
const fs = require('fs');
const PROPS = require('./props.json').en;
const {
  calcAge,
  calcProgressDuration,
  fixMonth,
} = require('./tools');

const BASE_STYLE = 'cv__progress_information';
const TEMPLATE_PATH = pathResolve(__dirname, './cv-template.html');
const OUTPUT_FILE = pathResolve(__dirname, '../src/cv.html');
const TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
const render = Handlebars.compile(TEMPLATE);

const infinityDate = always({ month: Infinity, year: Infinity });

const parseDate = ifElse(
  pipe(ramdaType, equals('String')),
  ifElse(
    equals('*'),
    infinityDate,
    pipe(
      split('.'),
      ([month, year]) => ({ month, year }),
      evolve({
        month: ifElse(
          equals('*'),
          always(Infinity),
          v => parseInt(v, 10),
        ),
        year: v => parseInt(v, 10),
      }),
    ),
  ),
  infinityDate,
);

const buildDate = cond([
  [
    allPass([
      propEq('month', Infinity),
      propEq('year', Infinity),
    ]),
    always(null),
  ],
  [propEq('month', Infinity), ({ year }) => `${year}`],
  [T, ({ month, year }) => `${fixMonth(month)}.${year}`],
]);
const buildEnd = ifElse(
  isNil,
  always('until today'),
  v => `to ${v}`,
);
const newlineToBR = replace(/\n/g, '<br>');

const buildProgress = pipe(
  map(evolve({
    start: parseDate,
    end: parseDate,
  })),
  sortWith([
    descend(path(['start', 'year'])),
    descend(path(['start', 'end'])),
    descend(path(['end', 'year'])),
    descend(path(['end', 'end'])),
  ]),
  map(pipe(
    evolve({
      type: toUpper,
      start: buildDate,
      end: pipe(buildDate, buildEnd),
      description: newlineToBR,
    }),
    ({
      type,
      title,
      description,
      start,
      end,
      techs,
    }) => [
      `<div class="${BASE_STYLE}__item">`,
      `<span class="${BASE_STYLE}__item__type">${type} since ${start} ${end}</span>`,
      `<span class="${BASE_STYLE}__item__title">${title}</span>`,
      `<span class="${BASE_STYLE}__item__description">${description}</span>`,
      type === 'WORK' || type === 'OPEN SOURCE'
        ? `<span class="${BASE_STYLE}__item__techs">Technologies: ${techs.join(', ')}</span>`
        : null,
      '</div>',
    ].filter(Boolean).join('\n'),
  )),
  join('\n'),
);

const joinWithText = text => pipe(
  join(', '),
  v => `${text}${v}`,
);
const buildTechnologies = pipe(
  juxt([
    prop('main'),
    prop('haveExperience'),
  ]),
  evolve([
    joinWithText('Main: '),
    joinWithText('Have experience witch: '),
  ]),
  join('<br><br>'),
);

const removeScriptBlocks = replace(/<script.*><\/script>\n/g, '');

const html = pipe(
  render,
  removeScriptBlocks,
)({
  ...PROPS,
  about: newlineToBR(PROPS.about),
  technologies: buildTechnologies(PROPS.technologies),
  progress: buildProgress(PROPS.progress),
  age: calcAge(PROPS.birthday),
  progressDuration: calcProgressDuration(PROPS.progress),
});

fs.writeFileSync(OUTPUT_FILE, html);

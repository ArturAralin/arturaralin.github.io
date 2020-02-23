const {
  map,
  evolve,
  pipe,
  split,
  ifElse,
  always,
  equals,
  when,
  type: ramdaType,
  sortWith,
  descend,
  path,
  cond,
  allPass,
  propEq,
  T,
  gt,
  join,
  toUpper,
  replace,
  isNil,
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
      description: replace(/\n/g, '<br>'),
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
      // `<span class="${BASE_STYLE}__item__interval">Since ${start} to ${end}</span>`,
      `<span class="${BASE_STYLE}__item__description">${description}</span>`,
      type === 'WORK'
        ? `<span class="${BASE_STYLE}__item__techs">Technologies: ${techs.join(', ')}</span>`
        : null,
      '</div>',
    ].filter(Boolean).join('\n'),
  )),
  join('\n'),
);

const build = evolve({
  progress: buildProgress,
});

const templateProps = build(PROPS);
const r = render({
  ...templateProps,
  age: calcAge(PROPS.birthday),
  progressDuration: calcProgressDuration(PROPS.progress),
});


fs.writeFileSync(OUTPUT_FILE, r);

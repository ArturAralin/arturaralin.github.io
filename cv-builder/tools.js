const moment = require('moment');
const {
  ascend,
  evolve,
  gt,
  head,
  map,
  pipe,
  prop,
  sortWith,
  split,
  when,
} = require('ramda');

const calcAge = pipe(
  date => moment.utc().startOf('day').diff(moment.utc(date, 'DD.MM.YYYY')),
  diff => moment.duration(diff).asYears(),
  years => Math.floor(years),
);

const fixMonth = when(
  gt(10),
  v => `0${v}`,
);

const parseInt10 = v => parseInt(v, 10) || 1;
const calcProgressDuration = pipe(
  map(pipe(
    prop('start'),
    split('.'),
    evolve([parseInt10, parseInt10]),
  )),
  sortWith([
    ascend(prop(0)),
    ascend(prop(1)),
  ]),
  head,
  ([month, year]) => `01.${fixMonth(month)}.${year}`,
  calcAge,
);

module.exports = {
  calcAge,
  calcProgressDuration,
  fixMonth,
};

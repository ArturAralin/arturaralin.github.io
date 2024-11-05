const process = require('process');

const totalIterations = 10 * 1000 * 1000;
const batchIterations = 1000;

let iteration = 0;


function notify() {
  const mem = process.memoryUsage();

  process.stdout.write(`${Date.now()},${mem.heapUsed},${mem.heapTotal},${iteration}\n`);
}

const largeString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".repeat(20000);


let cnt = 0;
function handle(s) {
  const mutated = 'extension' + s + 'second ext';

  if (mutated.startsWith('Lorem ipsum dolor')) {
    cnt += 1;
  }
}

function cool_down_and_exit() {
  setTimeout(() => {
    notify();
    process.exit();
  }, 5000);
}

function test() {
  for (let i = 0; i < batchIterations; i++) {
    iteration += 1;
    handle(largeString);
  }

  notify();

  if (iteration < totalIterations) {
    queueMicrotask(test);
  } else {
    cool_down_and_exit();
  }
}

test();

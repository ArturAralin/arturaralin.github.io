const childProcess = require('child_process');
const fs = require('fs');

const testFille = process.argv[2];
const resultFile = process.argv[3];

let stats;

function init(statsFile) {
  try {
    fs.unlinkSync(statsFile);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  stats = fs.createWriteStream(statsFile);

  stats.write('dt,heap_used,heap_total,iteration\n');
}

function run() {
  const child = childProcess.spawn('node', [testFille])

  child.on('message', (msg) => {
    console.log(msg);
  });

  child.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  child.stdout.on('data', (data) => {
    stats.write(data);
  })

  child.on('exit', (code) => {
    console.log('finish', code);
    process.exit(code);
  });
}

init(resultFile);
run();

const fs = require('fs');
const path = require('path');

const dev = fs.readFileSync(path.join(process.cwd(), 'node_modules/next/dist/cli/next-dev.js'), 'utf8');

function show(label, needle) {
  const i = dev.indexOf(needle);
  console.log('\n===== ' + label + ' @' + i + ' =====');
  if (i >= 0) console.log(dev.slice(Math.max(0, i - 300), i + 250).replace(/\n/g, '\\n'));
}

show('loadEnvConfig call', 'loadEnvConfig');
show('.action(', '.action(');
show('.parse(', '.parse(');
show('loadConfig (next.config) call', 'loadConfig');

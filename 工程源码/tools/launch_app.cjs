const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const appDir = path.resolve(__dirname, '..', '..', '软件本体');
const files = fs.readdirSync(appDir);
const exeFile = files.find(f => f.endsWith('.exe'));
if (!exeFile) {
  console.error('No exe found in', appDir);
  process.exit(1);
}

const exePath = path.join(appDir, exeFile);
console.log('Launching:', exePath);

const p = spawn(exePath, ['--remote-debugging-port=9333'], {
  detached: true,
  stdio: 'ignore'
});
p.unref();
console.log('App launched with PID:', p.pid);

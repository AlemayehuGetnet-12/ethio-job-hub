const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
(async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('Started in-memory MongoDB at', uri);
    const env = Object.assign({}, process.env, { MONGODB_URI: uri });
    const child = spawn(process.execPath, ['server.js'], { cwd: __dirname, env, stdio: 'inherit' });
    child.on('exit', (code) => {
      console.log('backend server exited with code', code);
      process.exit(code);
    });
    // keep the parent process alive until child exits
  } catch (err) {
    console.error('Failed to start in-memory MongoDB or backend:', err);
    process.exit(1);
  }
})();

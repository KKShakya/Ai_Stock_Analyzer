// src/index.ts
import app from './app';
import { config } from './config';
import { setupProcessErrorHandlers } from './middlewares/processErrorHandler';

// Setup process error handlers
setupProcessErrorHandlers();

const { port, host } = config.server;

console.log('Starting User Service...');
console.log('Environment:', config.server.env);
console.log('Port:', port);

const server = app.listen(port, host, () => {
  console.log('User Service running successfully!');
  console.log(`Server: http://${host}:${port}`);
  console.log('---');
});

server.on('error', (error: any) => {
  console.error('Server startup error:', error.message);
  process.exit(1);
});

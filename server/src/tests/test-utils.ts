import { app } from '../app.js';
import type { Server } from 'http';

let server: Server | null = null;

export async function startTestServer() {
  return new Promise<Server>((resolve) => {
    server = app.listen(3000, () => {
      console.log('Test server started on port 3000');
      resolve(server!);
    });
  });
}

export async function stopTestServer() {
  return new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
} 
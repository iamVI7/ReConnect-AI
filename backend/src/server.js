import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  await connectDB();

  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    cors: { origin: env.corsOrigin, credentials: true },
  });

  io.on('connection', (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);
    // Clients join a room per user ID after authenticating, e.g.:
    // socket.on('join', (userId) => socket.join(`user:${userId}`));
  });

  server.listen(env.port, () => {
    console.log(`[server] ReConnect AI backend listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});

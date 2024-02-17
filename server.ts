import express from 'express';
import next from 'next';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import crypto from 'crypto';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*', // Adjust this to your frontend origin for security
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    socket.on('join session', (trackName: string, artistName: string) => {
      const sessionId = crypto.createHash('sha256').update(`${trackName}-${artistName}`).digest('hex');
      console.log(`User joined session: ${sessionId}`);
      socket.join(sessionId);
    });

    socket.on('chat message', (msg: any, sessionId: string) => {
      io.to(sessionId).emit('chat message', msg);
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready`);
  });
});

import { Server } from 'boardgame.io/server';
import { TicTacContract } from './game';

const server = Server({
  games: [TicTacContract],
  origins: ['http://localhost:5173'] // Default Vite dev server port
});

server.run(8000);

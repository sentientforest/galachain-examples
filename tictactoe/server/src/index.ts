import { Server } from 'boardgame.io/server';
import { TicTacToe } from './game';

const server = Server({ 
  games: [TicTacToe],
  origins: ['http://localhost:5173'] // Default Vite dev server port
});

server.run(8000);

<template>
  <div class="container">
    <h1>Tic Tac Toe</h1>

    <div v-if="!matchId" class="start-section">
      <button @click="startNewMatch" class="start-button">Start New Game</button>
      <div class="join-section">
        <input v-model="joinMatchId" placeholder="Enter Game ID" class="game-id-input" />
        <button @click="joinMatch" class="join-button" :disabled="!joinMatchId">Join Game</button>
      </div>
    </div>

    <div v-else class="game-section">
      <div class="game-info">
        <p>Game ID: {{ matchId }}</p>
        <p>Current Player: {{ currentPlayer === '0' ? 'X' : 'O' }}</p>
      <p>You are: {{ currentSymbol }}</p>
      </div>

      <div class="board">
        <div v-for="(cell, index) in cells"
             :key="index"
             class="cell"
             :class="{ 'cell-playable': isPlayable(index) }"
             @click="makeMove(index)">
          {{ cell === '0' ? 'X' : cell === '1' ? 'O' : '' }}
        </div>
      </div>

      <div v-if="winner || isDraw" class="game-over">
        <div :class="['winner-message', winner !== null ? (isWinner ? 'winner-won' : 'winner-lost') : 'winner-draw']">
          {{ winner !== null ? (isWinner ? 'You won!' : 'You lost!') : 'Game ended in a draw!' }}
        </div>
        <button @click="resetGame" class="play-again-button">Reset</button>
      </div>
    </div>
    <div v-if="!metamaskSupport">
      <p>
        This application uses the GalaConnect API via Metamask to sign
        transactions and interact with GalaChain.
      </p>
      <p>
        Visit this site using a browser with the Metamask web extension
        installed to save game state on chain.
      </p>
    </div>
    <div v-else-if="!isConnected" class="connect-section">
      <button @click="connect">Connect Wallet</button>
    </div>
    <div v-else>
      <p class="wallet-address">Connected: {{ walletAddress }}</p>
      <RouterView
        :wallet-address="walletAddress"
        :metamask-client="metamaskClient"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Client } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { TicTacContract, TicTacContractState } from './game';
import { BrowserConnectClient } from "@gala-chain/connect";
import { connectWallet } from "./connect";
import { CreateMatchDto, MakeMoveDto } from "./dtos";

const metamaskSupport = ref(true);
let metamaskClient: BrowserConnectClient;
try {
  metamaskClient = new BrowserConnectClient();
} catch (e) {
  metamaskSupport.value = false;
}

const isConnected = ref(false);
const walletAddress = ref("");
const showInfo = ref(false);

async function connect() {
  await connectWallet(metamaskSupport, metamaskClient, walletAddress, isConnected);
}

interface GameOver {
  winner: string | null;
  draw?: boolean;
}

interface ClientState {
  G: TicTacContractState;
  ctx: {
    currentPlayer: string;
    gameover?: GameOver;
  };
  isActive?: boolean;
}

type TicTacContractClient = ReturnType<typeof Client<TicTacContractState, Record<string, unknown>>>;

const serverBaseUrl = import.meta.env.VITE_PROJECT_API ?? 'http://localhost:8000';

const createClient = (matchId: string, playerId: string): TicTacContractClient => {
  return Client<TicTacContractState, Record<string, unknown>>({
    game: TicTacContract,
    matchID: matchId,
    playerID: playerId,
    debug: false,
    multiplayer: SocketIO({ server: serverBaseUrl })
  });
};

const matchId = ref('');
const joinMatchId = ref('');
const currentPlayer = ref<string>('0');
const cells = ref<(string | null)[]>(Array(9).fill(null));
const winner = ref<string | null>(null);
const isDraw = ref(false);
const playerID = ref<string>('0');
const client = ref<TicTacContractClient | null>(null);

const isWinner = computed(() => winner.value === playerID.value);
const currentSymbol = computed(() => playerID.value === '0' ? 'X' : 'O');

let unsubscribe: Function | undefined;

const initializeClient = (matchId: string, initialPlayerId: string) => {
  playerID.value = initialPlayerId;
  console.log('Initializing client with:', { matchId, initialPlayerId });

  client.value = createClient(matchId, initialPlayerId);

  console.log('Client initialized:', {
    playerID: client.value.playerID,
    matchID: client.value.matchID
  });

  unsubscribe = client.value.subscribe((state: ClientState | null) => {
    if (state) {
      console.log('Game State Update:', {
        cells: state.G.cells,
        currentPlayer: state.ctx.currentPlayer,
        winner: state.ctx.gameover?.winner ?? null,
        draw: state.ctx.gameover?.draw,
        clientPlayerID: client.value?.playerID
      });

      cells.value = state.G.cells;
      currentPlayer.value = state.ctx.currentPlayer;
      winner.value = state.ctx.gameover?.winner ?? null;
      isDraw.value = (state.ctx.gameover?.draw) ?? false;

      if (state.ctx.gameover) {
        console.log('Game Over State:', {
          winner: state.ctx.gameover.winner,
          currentPlayerId: client.value?.playerID,
          isWinner: state.ctx.gameover.winner === client.value?.playerID
        });
      }
    }
  });

  client.value.start();
};

const startNewMatch = async () => {
  try {
    const response = await fetch('http://localhost:8000/games/tic-tac-contract/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numPlayers: 2 })
    });
    const data = await response.json();
    matchId.value = data.matchID;

    initializeClient(data.matchID, '0');
  } catch (error) {
    console.error('Failed to start new game:', error);
  }
};

const isPlayable = (index: number): boolean => {
  return !cells.value[index] &&
         !winner.value &&
         !isDraw.value &&
         playerID.value === currentPlayer.value;
};

const makeMove = (index: number) => {
  if (!client.value || !isPlayable(index)) return;
  client.value.moves.makeMove(index);
};

const resetGame = () => {
  matchId.value = '';
  currentPlayer.value = '0';
  cells.value = Array(9).fill(null);
  winner.value = null;
  isDraw.value = false;
  playerID.value = '0';
  if (client.value) {
    client.value.stop();
    client.value = null;
  }
  if (unsubscribe !== undefined) {
    unsubscribe();
    unsubscribe = undefined;
  }
};

const joinMatch = () => {
  if (!joinMatchId.value) return;
  matchId.value = joinMatchId.value;
  initializeClient(joinMatchId.value, '1');
  joinMatchId.value = '';
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px auto;
  max-width: 300px;
}

.cell {
  aspect-ratio: 1;
  background: #fff;
  border: 2px solid #333;
  font-size: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cell-playable {
  cursor: pointer;
}

.cell-playable:hover {
  background-color: #f0f0f0;
}

.cell:not(.cell-playable) {
  cursor: not-allowed;
}

.start-button {
  padding: 10px 20px;
  font-size: 1.2em;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-button:hover {
  background-color: #45a049;
}

.game-info {
  margin: 20px 0;
}

.winner-message {
  margin-top: 20px;
  font-size: 1.5em;
  font-weight: bold;
}

.winner-won {
  color: #4CAF50;
}

.winner-lost {
  color: #f44336;
}

.winner-draw {
  color: #ff9800;
}

.game-over {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.play-again-button {
  padding: 10px 20px;
  font-size: 1.2em;
  background-color: #9c27b0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.play-again-button:hover {
  background-color: #7b1fa2;
}

.join-section {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.game-id-input {
  padding: 8px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
}

.join-button {
  padding: 8px 16px;
  font-size: 1em;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.join-button:hover {
  background-color: #1976D2;
}

.join-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

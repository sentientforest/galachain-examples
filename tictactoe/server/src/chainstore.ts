import { LogEntry, Server, State, StorageAPI } from 'boardgame.io';
import { Async } from 'boardgame.io/internal';
import { createValidDTO } from "@gala-chain/api";
import { CreateMatchDto, MakeMoveDto, FetchMatchesDto } from "./dtos";

export interface TicTacMatch {
  matchId: string;
}
export class Chainstore extends Async {
  private apiUrl: string;
  private contractPath: string;

  constructor(apiUrl?: string, contractPath?: string) {
    super();
    this.apiUrl = apiUrl ?? "http://localhost:3000";
    this.contractPath = contractPath ?? "/api/product/TicTacContract";
  }

  async connect(): Promise<void> {
    console.log('Connected to custom storage');
  }

  async createMatch(matchId: string, {
    initialState,
    metadata: {
      gameName,
      players,
      setupData,
      gameover,
      nextMatchID,
      unlisted
    }
  }: StorageAPI.CreateMatchOpts): Promise<void> {
    const dto = initialState.G.dto;

    const url = `${this.apiUrl}${this.contractPath}/CreateMatch`;

    if (typeof dto !== 'string') {
      return;
    } else {
      await fetch(`${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dto
      });
    }
  }

  /**
   * Create a new game.
   * @deprecated Use createMatch instead
   */
  createGame(matchID: string, opts: StorageAPI.CreateGameOpts): Promise<void> {
    return this.createMatch(matchID, opts);
  }

  /**
   * Update the game state.
   *
   * If passed a deltalog array, setState should append its contents to the
   * existing log for this game.
   */
  async setState(
    matchID: string,
    state: State,
    deltalog?: LogEntry[]
  ): Promise<void> {
    // todo: implement deltalog array / append support
    const dto = state.G.dto;

    const url = `${this.apiUrl}${this.contractPath}/SetMatchState`;

    if (typeof dto !== 'string') {
      return;
    } else {
      await fetch(`${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dto
      });
    }
  }

  /**
   * Update the game metadata.
   */
  async setMetadata(
    matchID: string,
    metadata: Server.MatchData
  ): Promise<void> {
    // todo: implement
  }

  /**
   * Fetch the game state.
   */
  async fetch<O extends StorageAPI.FetchOpts>(
    matchID: string,
    { state, log, metadata, initialState }: O
  ): Promise<StorageAPI.FetchResult<O>> {
    const dto = new FetchMatchesDto();
    dto.matchId = matchID;

    const url = `${this.apiUrl}${this.contractPath}/FetchMatch`;

    const result = {} as StorageAPI.FetchFields;

    const chainRes = await fetch(`${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    if (!chainRes.ok) {
      throw new Error(`Failed to lookup match ${matchID} on chain`);
    }

    const match = await chainRes.json();

    if (!match.boardgameState) {
      return result;
    }

    // Parse the serialized state
    const gameState = JSON.parse(match.boardgameState);

    if (metadata) {
      result.metadata = gameState.metadata;
    }

    if (initialState) {
      result.initialState = gameState.initialState;
    }

    if (state) {
      result.state = gameState.state;
    }

    if (log) {
      result.log = gameState.log;
    }

    return result as StorageAPI.FetchResult<O>;
  }

  /**
   * Remove the game state.
   */
  async wipe(matchID: string): Promise<void> {}

  /**
   * Return all matches.
   */
  /* istanbul ignore next */
  async listMatches(opts?: StorageAPI.ListMatchesOpts): Promise<string[]> {
    // todo: implement signing from server-side identity
    const dto = new FetchMatchesDto();

    const url = `${this.apiUrl}${this.contractPath}/FetchMatches`;

    const results: string[] = [];

    const chainRes = await fetch(`${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    if (!chainRes.ok) {
      throw new Error(`Failed to lookup matches on chain`);
    }

    const chainResults = await chainRes.json();

    return chainResults.map((m: TicTacMatch) => m.matchId)
  }

  /**
   * Return all games.
   *
   * @deprecated Use listMatches instead, if implemented
   */
  async listGames(): Promise<string[]> {
    const response = await fetch(`${this.apiUrl}/games`);
    const games = await response.json();
    return games.map((game: any) => game.matchId);
  }
}

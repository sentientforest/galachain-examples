import { LogEntry, Server, State, StorageAPI } from 'boardgame.io';
import { Async } from 'boardgame.io/internal';
import { createValidDTO, createValidSubmitDTO, serialize } from "@gala-chain/api";
import { instanceToInstance, plainToInstance } from "class-transformer";
import {
  MatchStateLogOperation,
  MatchStateLogEntry,
  MatchStatePlugin,
  MatchStateContext,
  MatchGameState,
  MatchState,
  MatchStateDto,
  MatchPlayerMetadata,
  MatchMetadata,
  MatchDto,
  FetchMatchDto,
  FetchMatchesDto,
  FetchMatchesResDto,
  FetchMatchIdsResDto
} from "./dtos";

export interface ChainstoreConfig {
  apiUrl?: string;
  contractPath?: string;
  endpoints?: {
    createMatch?: string;
    setMatchState?: string;
    fetchMatch?: string;
    fetchMatches?: string;
  };
}

/**
* @description
*
* Storage Adapter for boardgame.io that uses GalaChain as a
* backend. Influenced by the flatfile.ts example provided in the
* boardgame.io project.
*/
export class Chainstore extends Async {
  private apiUrl: string;
  private contractPath: string;
  private endpoints: {
    createMatch: string;
    setMatchState: string;
    fetchMatch: string;
    fetchMatches: string;
  };
  private requestQueues: { [key: string]: Promise<any> };

  constructor(config?: ChainstoreConfig) {
    super();
    this.apiUrl = config?.apiUrl ?? "http://localhost:3000";
    this.contractPath = config?.contractPath ?? "/api/product/GameMatchContract";
    this.endpoints = {
      createMatch: config?.endpoints?.createMatch ?? "CreateMatch",
      setMatchState: config?.endpoints?.setMatchState ?? "SetMatchState",
      fetchMatch: config?.endpoints?.fetchMatch ?? "FetchMatch",
      fetchMatches: config?.endpoints?.fetchMatches ?? "FetchMatches"
    };
    this.requestQueues = {};
  }

  private async chainRequest(
    key: string,
    request: () => Promise<any>
  ): Promise<any> {
    if (!(key in this.requestQueues)) this.requestQueues[key] = Promise.resolve();

    // chains the current promise onto the resolution of any previous/pending promise
    this.requestQueues[key] = this.requestQueues[key].then(request, request);

    return this.requestQueues[key];
  }

  async connect(): Promise<void> {
    // No-op for HTTP API
    // todo: consider querying a health check or version endpoint of the target chain/ops deployment
    return;
  }

  async createMatch(
    matchID: string,
    opts: StorageAPI.CreateMatchOpts
  ): Promise<void> {
    const { initialState, metadata } = opts;

    // todo: optimize these into a single call on chain
    await this.setState(InitialStateKey(matchID), initialState);
    await this.setState(matchID, initialState);
    await this.setMetadata(matchID, metadata);
  }

  async fetch<O extends StorageAPI.FetchOpts>(
    matchID: string,
    { state, log, metadata, initialState }: O
  ): Promise<StorageAPI.FetchResult<O>> {
    return this.chainRequest(matchID, async () => {
      const dto = new FetchMatchDto();
      dto.matchID = matchID;

      const url = `${this.apiUrl}${this.contractPath}/${this.endpoints.fetchMatch}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch match ${matchID} from chain`);
      }

      const chainRes = await response.json();

      return chainRes.Data as StorageAPI.FetchResult<O>;
    });
  }

  async clear() {
    // todo: implement if needed
    return;
  }

  async setState(
    matchID: string,
    state: State,
    deltalog?: LogEntry[]
  ): Promise<void> {
    const { G, ctx } = state;
    return await this.chainRequest(matchID, async () => {
      const stateDto = await createValidDTO(MatchState, {
        G: plainToInstance(MatchGameState, G),
        ctx: plainToInstance(MatchStateContext, ctx)
      });

      const deltalogDto: MatchStateLogEntry[] | undefined = deltalog ?
        deltalog.map((d) => plainToInstance(MatchStateLogEntry, d)) :
        deltalog;

      const dto = await createValidDTO(MatchStateDto, {
        matchID,
        state: stateDto,
        deltalog: deltalogDto,
        uniqueKey: `${matchID}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      })

      const url = `${this.apiUrl}${this.contractPath}/${this.endpoints.setMatchState}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialize(dto)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to set state for match ${matchID} on chain: ${error}`);
      }
    });
  }

  async setMetadata(
    matchID: string,
    metadata: Server.MatchData
  ): Promise<void> {
    return await this.chainRequest(matchID, async () => {
      const matchPlayers: Record<number, MatchPlayerMetadata> = {};

      for (const p in metadata.players) {
        matchPlayers[p] = plainToInstance(MatchMetadata, metadata.players[p])
      }

      const metadataDto = await createValidDTO(MatchMetadata, {
        ...metadata,
        players: matchPlayers
      });

      const dto = await createValidDTO(MatchStateDto, {
        matchID,
        metadata: metadataDto,
        uniqueKey: `${matchID}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      });

      const url = `${this.apiUrl}${this.contractPath}/${this.endpoints.setMatchState}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialize(dto)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to set state for match ${matchID} on chain: ${error}`);
      }
    });
  }

  async wipe(matchID: string): Promise<void> {
    // todo: implement deleteState methods on chain
    // await this.removeItem(matchID);
    // await this.removeItem(InitialStateKey(matchID))
    // await this.removeItem(LogKey(matchID));
    // await this.removeItem(MetadataKey(matchID));
    return;
  }

  async listMatches(opts?: StorageAPI.ListMatchesOpts): Promise<string[]> {
    const dto = new FetchMatchesDto();

    const url = `${this.apiUrl}${this.contractPath}/${this.endpoints.fetchMatches}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    if (!response.ok) {
      throw new Error('Failed to list matches from chain');
    }

    const { results } = await response.json();

    return results;
  }
}

// todo: move these values to contants / enum type
// and rather than following a single string as in flat file, e.g
// `${matchID}:initial` with GalaChain composite keys we use
// separate parts ...
export function InitialStateKey(matchID: string) {
  return `${matchID}:initial`;
}

export function MetadataKey(matchID: string) {
  return `${matchID}:metadata`
}

export function LogKeySuffix(matchID: string) {
  return `${matchID}:log`;
}

import { createValidChainObject, deserialize, ChainCallDTO, SubmitCallDTO, serialize } from "@gala-chain/api";
import { Exclude, Type } from "class-transformer";
import {
  Allow,
  IsArray,
  IsBoolean,
  IsDefined,
  IsInstance,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested
} from "class-validator";
import { GameStatus, PlayerSymbol, TicTacMatch } from "./TicTacMatch";
import { ChainMatchMetadata, ChainMatchPlayerMetadata } from "./types";

// todo: something in this import fails if react is not installed
// import { ActionShape, ActivePlayers, ActivePlayersArg, PlayerID } from "boardgame.io";
// begin port from boardgame.io types
export type StageName = string;
export type PlayerID = string;
export type StageArg =
  | StageName
  | {
      stage?: StageName;
      /** @deprecated Use `minMoves` and `maxMoves` instead. */
      moveLimit?: number;
      minMoves?: number;
      maxMoves?: number;
    };

export interface ActivePlayers {
  [playerID: string]: StageName;
}
export type ActivePlayersArg =
  | PlayerID[]
  | {
      currentPlayer?: StageArg;
      others?: StageArg;
      all?: StageArg;
      value?: Record<PlayerID, StageArg>;
      minMoves?: number;
      maxMoves?: number;
      /** @deprecated Use `minMoves` and `maxMoves` instead. */
      moveLimit?: number;
      revert?: boolean;
      next?: ActivePlayersArg;
    };
// end port of types

export class MatchStateLogOperation extends ChainCallDTO {
  @IsString()
  op: string;

  @IsString()
  path: string;

  @IsDefined()
  value: any;
}

export class MatchStateLogEntry extends ChainCallDTO {
  @IsNotEmpty()
  action: unknown;
    // | ActionShape.MakeMove
    // | ActionShape.GameEvent
    // | ActionShape.Undo
    // | ActionShape.Redo;

  @IsNumber()
  _stateID: number;

  @IsNumber()
  turn: number;

  @IsOptional()
  @IsString()
  phase?: string;

  @IsOptional()
  @IsBoolean()
  redact?: boolean;

  @IsOptional()
  @IsBoolean()
  automatic?: boolean;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => MatchStateLogOperation)
  patch?: MatchStateLogOperation[];
}

export class MatchStatePlugin extends ChainCallDTO {
  @IsDefined()
  data: any;

  @IsOptional()
  api?: any;
}

export class MatchStateContext extends ChainCallDTO {
  @IsNumber()
  numPlayers: number;

  @IsArray()
  playOrder: Array<string>;

  @IsNumber()
  playOrderPos: number;

  @IsOptional()
  activePlayers: null | Record<string, string>;

  @IsNotEmpty()
  currentPlayer: string;

  @IsOptional()
  @IsNumber()
  numMoves?: number;

  @IsOptional()
  gameover?: any;

  @IsNumber()
  turn: number;

  @IsOptional()
  @IsString()
  phase?: string;

  @IsOptional()
  @IsString()
  _internal?: string;

  @Exclude()
  _activePlayersMinMoves?: Record<PlayerID, number>;

  @Exclude()
  _activePlayersMaxMoves?: Record<PlayerID, number>;

  @Exclude()
  _activePlayersNumMoves?: Record<PlayerID, number>;

  @Exclude()
  _prevActivePlayers?: Array<{
    activePlayers: null | ActivePlayers;
    _activePlayersMinMoves?: Record<PlayerID, number>;
    _activePlayersMaxMoves?: Record<PlayerID, number>;
    _activePlayersNumMoves?: Record<PlayerID, number>;
  }>;

  @Exclude()
  _nextActivePlayers?: ActivePlayersArg;

  @Exclude()
  _random?: {
    seed: string | number;
  };
}

// @JSONSchema({ description: "Extend this class with any custom game state" })
/**
* @description
*
* Extend this class with custom properties to track state specific to
* a turn-based game
*/
export class MatchGameState extends ChainCallDTO {
  @IsNumber()
  @IsOptional()
  @IsString()
  public playerX?: string | undefined;

  @IsOptional()
  @IsString()
  public playerO?: string | undefined;

  @IsArray()
  public board: (PlayerSymbol | null)[];

  public status: GameStatus;

  public currentPlayer: PlayerSymbol;

  public currentMove?: number;

  public createdAt: number;

  public lastMoveAt: number;
}

export class MatchState extends ChainCallDTO {
  @IsNumber()
  _stateID: number;

  @Type(() => MatchGameState)
  G: MatchGameState;

  @Type(() => MatchStateContext)
  ctx: MatchStateContext;

  @IsDefined()
  plugins: Record<string, MatchStatePlugin>;
}


export class MatchPlayerMetadata extends ChainCallDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  credentials?: string;

  @IsOptional()
  @Allow()
  data?: any;

  @IsOptional()
  @IsBoolean()
  isConnected?: boolean;
}

export class MatchMetadata extends ChainCallDTO {
  @IsNotEmpty()
  gameName: string;

  @Type(() => MatchPlayerMetadata)
  players: { [id: number]: MatchPlayerMetadata };

  @IsOptional()
  setupData?: unknown;

  @IsOptional()
  gameover?: unknown;

  @IsOptional()
  @IsString()
  nextMatchID?: string;

  @IsOptional()
  @IsBoolean()
  unlisted?: boolean;

  @IsNumber()
  createdAt: number;

  @IsNumber()
  updatedAt: number;

  public async gameMetadataToChainEntries(
    matchID: string
  ): Promise<[ChainMatchMetadata, ChainMatchPlayerMetadata[]]> {
    const matchMetadata: ChainMatchMetadata = await createValidChainObject(ChainMatchMetadata, {
      gameName: this.gameName,
      matchID: matchID,
      setupData: this.setupData,
      gameover: this.gameover,
      nextMatchID: this.nextMatchID,
      unlisted: this.unlisted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });

    const playerMetadataEntries: ChainMatchPlayerMetadata[] = [];

    for (const playerId in this.players) {
      const playerMetadata = await createValidChainObject(ChainMatchPlayerMetadata, {
        gameName: this.gameName,
        matchID: matchID,
        playerId: playerId,
        name: this.players[playerId].name,
        // todo: what exactly is this "credentials" string used for in boardgame.io, should it be stored?
        // i.e. is it sensitive or non-sensitive data? If sensitive, it shouldn't be on chain
        // need to investigate boardgame.io library internals or client implementations more closely
        credentials: this.players[playerId].credentials,
        data: this.players[playerId].data,
        isConnected: this.players[playerId].isConnected
      });

      playerMetadataEntries.push(playerMetadata);
    }

    return [matchMetadata, playerMetadataEntries];
  }
}

export class MatchStateDto extends ChainCallDTO {
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @IsOptional()
  @Type(() => MatchState)
  state?: MatchState

  @IsOptional()
  @ValidateNested()
  @Type(() => MatchMetadata)
  metadata?: MatchMetadata;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchStateLogEntry)
  deltalog?: MatchStateLogEntry[]
}


export class CreateMatchDto extends ChainCallDTO {
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @IsNotEmpty()
  @IsString()
  initialStateID: string;

  @Type(() => MatchState)
  state: MatchState;

  @ValidateNested()
  @Type(() => MatchMetadata)
  metadata: MatchMetadata;
}

export class MatchDto extends ChainCallDTO {
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MatchState)
  state?: MatchState;

  @IsOptional()
  @ValidateNested()
  @Type(() => MatchMetadata)
  metadata?: MatchMetadata;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchStateLogEntry)
  log?: MatchStateLogEntry[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MatchState)
  initialState?: MatchState;
}

export class FetchMatchDto extends ChainCallDTO {
  @IsString()
  public matchID: string;

  @IsOptional()
  @IsBoolean()
  includeState?: boolean;

  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;

  @IsOptional()
  @IsBoolean()
  includeLog?: boolean;

  @IsOptional()
  @IsBoolean()
  includeInitialState?: boolean;
}

export class FetchMatchesDto extends ChainCallDTO {
  @IsOptional()
  @IsString()
  public matchID?: string;

  @IsOptional()
  @IsString()
  public bookmark?: string;

  @IsOptional()
  @IsNumber()
  public limit?: number;
}

export class FetchMatchesResDto extends ChainCallDTO {
  @IsArray()
  @Type(() => TicTacMatch)
  public results: TicTacMatch[];

  @IsString()
  @IsOptional()
  public bookmark?: string;
}

export class FetchMatchIdsResDto extends ChainCallDTO {
  @IsArray()
  public results: string[];

  @IsOptional()
  @IsString()
  public bookmark?: string;
}

// Game-specific DTOs
export class JoinMatchDto extends ChainCallDTO {
  @IsNotEmpty()
  @IsString()
  public matchID: string;
}

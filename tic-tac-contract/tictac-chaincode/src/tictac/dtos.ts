import { ChainCallDTO, createValidChainObject, deserialize, serialize } from "@gala-chain/api";
import { Exclude, Type } from "class-transformer";
import {
  Allow,
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested
} from "class-validator";

import { TicTacMatch } from "./TicTacMatch";
import {
  ChainMatchMetadata,
  ChainMatchPlayerMetadata,
  GameStatus,
  MatchStatePlugin,
  PlayerSymbol
} from "./types";

export class MatchStateLogOperation extends ChainCallDTO {
  @IsString()
  op: string;

  @IsString()
  path: string;

  @IsDefined()
  value: unknown;
}

export class MatchStateLogEntry extends ChainCallDTO {
  @IsNotEmpty()
  action: unknown;

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
  gameover?: unknown;

  @IsNumber()
  turn: number;

  @IsOptional()
  @IsString()
  phase?: string;

  @IsOptional()
  @IsString()
  _internal?: string;

  @IsOptional()
  @Allow()
  _activePlayersMinMoves?: Record<string, number>;

  @IsOptional()
  @Allow()
  _activePlayersMaxMoves?: Record<string, number>;

  @IsOptional()
  @Allow()
  _activePlayersNumMoves?: Record<string, number>;

  @IsOptional()
  @Allow()
  _prevActivePlayers?: Array<{
    activePlayers: null | Record<string, string>;
    _activePlayersMinMoves?: Record<string, number>;
    _activePlayersMaxMoves?: Record<string, number>;
    _activePlayersNumMoves?: Record<string, number>;
  }>;

  @IsOptional()
  @Allow()
  _nextActivePlayers?: unknown;

  @IsOptional()
  @Allow()
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
  @IsOptional()
  @IsNumber()
  _stateID: number | null;

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
  state?: MatchState;

  @IsOptional()
  @ValidateNested()
  @Type(() => MatchMetadata)
  metadata?: MatchMetadata;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchStateLogEntry)
  deltalog?: MatchStateLogEntry[];
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

  @IsOptional()
  @Type(() => MatchState)
  public state?: MatchState;
}

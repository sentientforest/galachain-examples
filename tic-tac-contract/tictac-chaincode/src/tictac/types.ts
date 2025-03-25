import { ChainKey, ChainObject, SubmitCallDTO, deserialize, serialize } from "@gala-chain/api";
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

export enum GameStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  X_WON = "X_WON",
  O_WON = "O_WON",
  DRAW = "DRAW"
}

export enum PlayerSymbol {
  X = "X",
  O = "O"
}

export class ChainMatchStateLogOperation extends ChainObject {
  public static INDEX_KEY = "BGCMSLO";
  @ChainKey({ position: 0 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @IsString()
  op: string;

  @IsString()
  path: string;

  @IsDefined()
  value: unknown;
}

export class ChainMatchStateLogEntry extends ChainObject {
  public static INDEX_KEY = "BGCMSLE";

  @ChainKey({ position: 0 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @ChainKey({ position: 1 })
  @IsNumber()
  _stateID: number;

  @IsNotEmpty()
  action: unknown;

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
  @Type(() => ChainMatchStateLogOperation)
  patch?: ChainMatchStateLogOperation[];
}

export class MatchStatePlugin extends ChainObject {
  @IsDefined()
  data: any;

  @IsOptional()
  api?: any;
}

export class ChainMatchStatePlugins extends ChainObject {
  public static INDEX_KEY = "BGCMSP";

  @ChainKey({ position: 0 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @IsDefined()
  plugins: Record<string, MatchStatePlugin>;
}

export class ChainMatchStateContext extends ChainObject {
  public static INDEX_KEY = "BGCMSC";
  @ChainKey({ position: 0 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

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

export class ChainMatchPlayerMetadata extends ChainObject {
  public static INDEX_KEY = "BGCMPM";

  @ChainKey({ position: 0 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @ChainKey({ position: 1 })
  @IsString()
  playerId: string;

  @IsNotEmpty()
  gameName: string;

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

export class ChainMatchMetadata extends ChainObject {
  public static INDEX_KEY = "BGCMMD";

  @ChainKey({ position: 0 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @IsNotEmpty()
  gameName: string;

  @IsOptional()
  setupData?: any;

  @IsOptional()
  gameover?: any;

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
}

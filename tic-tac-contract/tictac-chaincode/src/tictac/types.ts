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

  @IsNotEmpty()
  action: unknown;

  @IsNumber()
  _stateID: number;

  @IsNumber()
  turn: number;

  @IsString()
  phase: string;

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

export class ChainMatchStatePlugin extends ChainObject {
  public static INDEX_KEY = "BGCMSP";

  @ChainKey({ position: 0 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @IsDefined()
  data: any;

  @IsOptional()
  api?: any;
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

  @IsNotEmpty()
  phase: string;

  @IsNotEmpty()
  _internal: string;

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

  // public serialize() {
  //   const {
  //     numPlayers,
  //     playOrder,
  //     playOrderPos,
  //     activePlayers,
  //     currentPlayer,
  //     numMoves,
  //     gameover,
  //     turn,
  //     phase,
  //     _activePlayersMinMoves,
  //     _activePlayersMaxMoves,
  //     _prevActivePlayers,
  //     _nextActivePlayers,
  //     _random
  //   } = this;

  //   const _internal = JSON.stringify({
  //     _activePlayersMinMoves,
  //     _activePlayersMaxMoves,
  //     _prevActivePlayers,
  //     _nextActivePlayers,
  //     _random
  //   });

  //   const data = {
  //     numPlayers,
  //     playOrder,
  //     playOrderPos,
  //     activePlayers,
  //     currentPlayer,
  //     numMoves,
  //     gameover,
  //     turn,
  //     phase,
  //     _internal
  //   };

  //   return serialize(data);
  // }

  // public deserialize<MatchStateContext>(
  //   constructor: MatchStateContext,
  //   object: string | Record<string, unknown> | Record<string, unknown>[]
  // ): MatchStateContext {
  //   const matchContext = deserialize(MatchStateContext, object);

  //   const {
  //     _activePlayersMinMoves,
  //     _activePlayersMaxMoves,
  //     _prevActivePlayers,
  //     _nextActivePlayers,
  //     _random
  //   } = JSON.parse(matchContext._internal);

  //   matchContext._activePlayersMinMoves = _activePlayersMinMoves;
  //   matchContext._activePlayersMaxMoves = _activePlayersMaxMoves;
  //   matchContext._prevActivePlayers = _prevActivePlayers;
  //   matchContext._nextActivePlayers = _nextActivePlayers;
  //   matchContext._random = _random;

  //   return matchContext as MatchStateContext;
  // }
}

// @JSONSchema({ description: "Extend this class with any custom game state" })
/**
 * @description
 *
 * Extend this class with custom properties to track state specific to
 * a turn-based game
 */
// using implementation in ./TicTacMatch.ts
// export class TicTacMatchGameState extends ChainObject {
//   @ChainKey({ position: 0 })
//   @IsNotEmpty()
//   @IsString()
//   matchID: string;

//   @IsArray()
//   @Type(() => String)
//   board: (PlayerSymbol | null)[];

//   @IsString()
//   currentPlayer: PlayerSymbol;

//   constructor() {
//     super();
//     this.board = Array(9).fill(null);
//     this.currentPlayer = PlayerSymbol.X;
//   }
// }

export class ChainMatchPlayerMetadata extends ChainObject {
  public static INDEX_KEY = "BGCMPM";
  @ChainKey({ position: 0 })
  @IsNotEmpty()
  gameName: string;

  @ChainKey({ position: 1 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @ChainKey({ position: 2 })
  @IsString()
  playerId: string;

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
  gameName: string;

  @ChainKey({ position: 1 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

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

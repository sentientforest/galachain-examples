/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { deserialize, ChainCallDTO, SubmitCallDTO, serialize } from "@gala-chain/api";
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
import { ActionShape, ActivePlayers, ActivePlayersArg, PlayerID } from "boardgame.io";

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
  action:
    | ActionShape.MakeMove
    | ActionShape.GameEvent
    | ActionShape.Undo
    | ActionShape.Redo;

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
  playOrder: Array<PlayerID>;

  @IsNumber()
  playOrderPos: number;

  @IsOptional()
  activePlayers: null | ActivePlayers;

  @IsNotEmpty()
  currentPlayer: PlayerID;

  @IsOptional()
  @IsNumber()
  numMoves?: number;

  @IsOptional()
  gameover?: any;

  @IsNumber()
  turn: number;

  @IsNotEmpty()
  phase: string;

  @IsNotEmpty()
  _internal: string;

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

  public serialize() {
    const {
      numPlayers,
      playOrder,
      playOrderPos,
      activePlayers,
      currentPlayer,
      numMoves,
      gameover,
      turn,
      phase,
      _activePlayersMinMoves,
      _activePlayersMaxMoves,
      _prevActivePlayers,
      _nextActivePlayers,
      _random
    } = this;

    const _internal = JSON.stringify({
      _activePlayersMinMoves,
      _activePlayersMaxMoves,
      _prevActivePlayers,
      _nextActivePlayers,
      _random
    });

    const data = {
      numPlayers,
      playOrder,
      playOrderPos,
      activePlayers,
      currentPlayer,
      numMoves,
      gameover,
      turn,
      phase,
      _internal
    }

    return serialize(data);
  }

  public deserialize<T>(
    constructor: MatchStateContext,
    object: string | Record<string, unknown> | Record<string, unknown>[]
  ): MatchStateContext {
    const matchContext = deserialize(MatchStateContext, object);

    const {
      _activePlayersMinMoves,
      _activePlayersMaxMoves,
      _prevActivePlayers,
      _nextActivePlayers,
      _random
    } = JSON.parse(matchContext._internal);

    matchContext._activePlayersMinMoves = _activePlayersMinMoves;
    matchContext._activePlayersMaxMoves = _activePlayersMaxMoves;
    matchContext._prevActivePlayers = _prevActivePlayers;
    matchContext._nextActivePlayers = _nextActivePlayers;
    matchContext._random = _random;

    return matchContext;
  }
}

export enum PlayerSymbol {
  X = "X",
  O = "O"
}

// @JSONSchema({ description: "Extend this class with any custom game state" })
/**
* @description
*
* Extend this class with custom properties to track state specific to
* a turn-based game
*/
export class MatchGameState extends ChainCallDTO {
  @IsArray()
  @Type(() => String)
  board: (PlayerSymbol | null)[];

  @IsString()
  currentPlayer: PlayerSymbol;

  constructor() {
    super();
    this.board = Array(9).fill(null);
    this.currentPlayer = PlayerSymbol.X;
  }
}

export class MatchState extends ChainCallDTO {
  @Type(() => MatchGameState)
  G: MatchGameState;

  @Type(() => MatchStateContext)
  ctx: MatchStateContext;
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
  @Type(() => MatchDto)
  public results: MatchDto[];

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
  @IsOptional()
  @IsString()
  public matchID: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.playerO === undefined)
  public playerX?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.playerX === undefined)
  public playerO?: string;

  constructor(
    matchID: string,
    playerX: string | undefined,
    playerO: string | undefined,
    uniqueKey: string,
  ) {
    super();
    this.matchID = matchID;
    this.playerX = playerX;
    this.playerO = playerO;
  }
}

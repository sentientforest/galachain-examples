/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { ChainCallDTO, SubmitCallDTO } from "@gala-chain/api";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

import { TicTacGame } from "./TicTacGame";

export class CreateGameDto extends SubmitCallDTO {
  @IsString()
  public readonly playerO: string;

  constructor(playerO: string, uniqueKey: string) {
    super();
    this.playerO = playerO;
    this.uniqueKey = uniqueKey;
  }
}

export class MakeMoveDto extends SubmitCallDTO {
  @IsString()
  public readonly gameId: string;

  @IsNumber()
  @Min(0)
  @Max(8)
  public readonly position: number;

  constructor(gameId: string, position: number, uniqueKey: string) {
    super();
    this.gameId = gameId;
    this.position = position;
    this.uniqueKey = uniqueKey;
  }
}

export class FetchGamesDto extends ChainCallDTO {
  @IsString()
  @IsOptional()
  public readonly player?: string;

  @IsString()
  @IsOptional()
  public readonly gameId?: string;

  @IsString()
  @IsOptional()
  public readonly bookmark?: string;

  @IsOptional()
  public readonly limit?: number;

  constructor(player?: string, gameId?: string, bookmark?: string, limit?: number) {
    super();
    this.player = player;
    this.gameId = gameId;
    this.bookmark = bookmark;
    this.limit = limit;
  }
}

export class PagedGamesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicTacGame)
  public readonly games: TicTacGame[];

  @IsString()
  public readonly bookmark: string;

  constructor(games: TicTacGame[], bookmark: string) {
    this.games = games;
    this.bookmark = bookmark;
  }
}

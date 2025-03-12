/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { Evaluate, GalaChainContext, GalaContract, Submit } from "@gala-chain/chaincode";

import { version } from "../../package.json";
import { TicTacGame } from "./TicTacGame";
import { createGame } from "./createGame";
import { CreateGameDto, FetchGamesDto, MakeMoveDto, PagedGamesDto } from "./dtos";
import { fetchGames } from "./fetchGames";
import { makeMove } from "./makeMove";

export class TicTacContract extends GalaContract {
  constructor() {
    super("TicTacContract", version);
  }

  @Submit({
    in: CreateGameDto,
    out: TicTacGame
  })
  public async CreateGame(ctx: GalaChainContext, dto: CreateGameDto): Promise<TicTacGame> {
    return createGame(ctx, dto);
  }

  @Submit({
    in: MakeMoveDto,
    out: TicTacGame
  })
  public async MakeMove(ctx: GalaChainContext, dto: MakeMoveDto): Promise<TicTacGame> {
    return makeMove(ctx, dto);
  }

  @Evaluate({
    in: FetchGamesDto,
    out: PagedGamesDto
  })
  public async FetchGames(ctx: GalaChainContext, dto: FetchGamesDto): Promise<PagedGamesDto> {
    return await fetchGames(ctx, dto);
  }
}

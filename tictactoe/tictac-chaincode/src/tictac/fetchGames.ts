/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { GalaChainContext } from "@gala-chain/chaincode";
import { FetchGamesDto, PagedGamesDto } from "./dtos";
import { TicTacGame } from "./TicTacGame";

export async function fetchGames(ctx: GalaChainContext, dto: FetchGamesDto): Promise<PagedGamesDto> {
  const query = {
    gameId: dto.gameId,
    $or: [
      { playerX: dto.player },
      { playerO: dto.player }
    ]
  };

  // Remove undefined properties
  Object.keys(query).forEach(key => {
    if (query[key] === undefined) {
      delete query[key];
    }
  });

  const { items: games, bookmark } = await ctx.store.getAll(TicTacGame, {
    limit: dto.limit,
    bookmark: dto.bookmark,
    query
  });

  return new PagedGamesDto(games, bookmark);
}

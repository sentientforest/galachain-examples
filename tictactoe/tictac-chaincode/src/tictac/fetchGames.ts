/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import {
  GalaChainContext,
  getObjectsByPartialCompositeKeyWithPagination,
  takeUntilUndefined
} from "@gala-chain/chaincode";

import { TicTacGame } from "./TicTacGame";
import { FetchGamesDto, PagedGamesDto } from "./dtos";

export async function fetchGames(ctx: GalaChainContext, dto: FetchGamesDto): Promise<PagedGamesDto> {
  const query = takeUntilUndefined(dto.gameId, dto.player);

  const lookup = await getObjectsByPartialCompositeKeyWithPagination(
    ctx,
    TicTacGame.INDEX_KEY,
    query,
    TicTacGame,
    dto.bookmark ?? "",
    dto.limit ?? 1000
  );

  return new PagedGamesDto(lookup.results, lookup.metadata.bookmark);
}

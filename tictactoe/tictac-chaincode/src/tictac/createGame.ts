/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { GalaChainContext } from "@gala-chain/chaincode";
import { CreateGameDto } from "./dtos";
import { TicTacGame } from "./TicTacGame";

export async function createGame(ctx: GalaChainContext, dto: CreateGameDto): Promise<void> {
  const playerX = ctx.callingUser;
  const gameId = ctx.stub.getTxID();
  const timestamp = ctx.txUnixTime;

  const game = new TicTacGame(gameId, playerX, dto.playerO, timestamp);
  await ctx.store.put(game);
}

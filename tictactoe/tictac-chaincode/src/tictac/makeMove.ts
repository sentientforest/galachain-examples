/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { GalaChainContext } from "@gala-chain/chaincode";
import { MakeMoveDto } from "./dtos";
import { TicTacGame } from "./TicTacGame";

export async function makeMove(ctx: GalaChainContext, dto: MakeMoveDto): Promise<void> {
  const player = ctx.callingUser;
  const timestamp = ctx.txUnixTime;

  // Get the game
  const game = await ctx.store.get(TicTacGame, {
    gameId: dto.gameId
  });

  // Make the move
  game.makeMove(player, dto.position, timestamp);

  // Save the updated game state
  await ctx.store.put(game);
}

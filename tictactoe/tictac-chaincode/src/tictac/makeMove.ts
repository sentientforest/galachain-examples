/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { GalaChainContext, getObjectByKey, putChainObject } from "@gala-chain/chaincode";

import { TicTacGame } from "./TicTacGame";
import { MakeMoveDto } from "./dtos";

export async function makeMove(ctx: GalaChainContext, dto: MakeMoveDto): Promise<TicTacGame> {
  const player = ctx.callingUser;
  const timestamp = ctx.txUnixTime;

  // Get the game
  const gameKey = TicTacGame.getCompositeKeyFromParts(TicTacGame.INDEX_KEY, [dto.gameId]);
  const game = await getObjectByKey(ctx, TicTacGame, gameKey);

  // Make the move
  game.makeMove(player, dto.position, timestamp);

  // Save the updated game state
  await putChainObject(ctx, game);

  return game;
}

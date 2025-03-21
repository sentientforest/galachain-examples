/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { ConflictError, ValidationFailedError, createValidChainObject } from "@gala-chain/api";
import { GalaChainContext, getObjectByKey, putChainObject } from "@gala-chain/chaincode";

import { TicTacMatch } from "./TicTacMatch";
import { JoinMatchDto } from "./dtos";
import { ChainMatchStateContext, GameStatus } from "./types";

export async function joinMatch(ctx: GalaChainContext, dto: JoinMatchDto): Promise<TicTacMatch> {
  const { matchID, state } = dto;

  if (!state) {
    throw new ValidationFailedError(`No state provided for joining match ${matchID}`);
  }

  const key = TicTacMatch.getCompositeKeyFromParts(TicTacMatch.INDEX_KEY, [matchID]);
  const match = await getObjectByKey(ctx, TicTacMatch, key);

  if (match.status !== GameStatus.OPEN) {
    throw new ConflictError(
      `${ctx.callingUser} joinMatch called on closed match (${match.status}): ${dto.serialize()}`
    );
  }
  // Update match with new state
  match.playerO = state.G.playerO;
  match.playerX = state.G.playerX;
  match.board = state.G.board;
  match.currentPlayer = state.G.currentPlayer;
  match.status = state.G.status;
  match.currentMove = state.G.currentMove;
  match.lastMoveAt = state.G.lastMoveAt;

  await putChainObject(ctx, match);

  // Update game context
  const matchCtx = await createValidChainObject(ChainMatchStateContext, {
    matchID,
    ...state.ctx
  });

  await putChainObject(ctx, matchCtx);

  return match;
}

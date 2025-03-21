/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { createValidDTO } from "@gala-chain/api";
import { GalaChainContext, getObjectByKey, getObjectsByPartialCompositeKey } from "@gala-chain/chaincode";

import { TicTacMatch } from "./TicTacMatch";
import {
  FetchMatchDto,
  MatchDto,
  MatchGameState,
  MatchMetadata,
  MatchPlayerMetadata,
  MatchState,
  MatchStateContext
} from "./dtos";
import { ChainMatchMetadata, ChainMatchPlayerMetadata, ChainMatchStateContext } from "./types";

export async function fetchMatch(ctx: GalaChainContext, dto: FetchMatchDto): Promise<MatchDto> {
  const { matchID } = dto;

  // Get game state
  const gameKey = TicTacMatch.getCompositeKeyFromParts(TicTacMatch.INDEX_KEY, [matchID]);
  const match = await getObjectByKey(ctx, TicTacMatch, gameKey);

  // Get game context
  const contextKey = ChainMatchStateContext.getCompositeKeyFromParts(ChainMatchStateContext.INDEX_KEY, [
    matchID
  ]);
  const context = await getObjectByKey(ctx, ChainMatchStateContext, contextKey);

  // Get metadata
  const metadataKey = ChainMatchMetadata.getCompositeKeyFromParts(ChainMatchMetadata.INDEX_KEY, [matchID]);
  const metadata = await getObjectByKey(ctx, ChainMatchMetadata, metadataKey);

  // Get player metadata
  const playerMetadataEntries = await getObjectsByPartialCompositeKey(
    ctx,
    ChainMatchPlayerMetadata.INDEX_KEY,
    [matchID],
    ChainMatchPlayerMetadata
  );

  // Convert player metadata entries to MatchPlayerMetadata instances
  const players: { [id: number]: MatchPlayerMetadata } = {};
  for (const entry of playerMetadataEntries) {
    const playerMetadata = await createValidDTO(MatchPlayerMetadata, {
      name: entry.name,
      credentials: entry.credentials,
      data: entry.data,
      isConnected: entry.isConnected
    });
    players[parseInt(entry.playerId)] = playerMetadata;
  }

  // Create MatchGameState
  const gameState = await createValidDTO(MatchGameState, {
    playerX: match.playerX,
    playerO: match.playerO,
    board: match.board,
    currentPlayer: match.currentPlayer,
    status: match.status,
    currentMove: match.currentMove,
    createdAt: match.createdAt,
    lastMoveAt: match.lastMoveAt
  });

  // Create MatchStateContext
  const stateContext = await createValidDTO(MatchStateContext, {
    numPlayers: context.numPlayers,
    playOrder: context.playOrder,
    playOrderPos: context.playOrderPos,
    activePlayers: context.activePlayers,
    currentPlayer: context.currentPlayer,
    numMoves: context.numMoves,
    gameover: context.gameover,
    turn: context.turn,
    phase: context.phase,
    _internal: context._internal
  });

  // Create MatchState
  const state = await createValidDTO(MatchState, {
    G: gameState,
    ctx: stateContext
  });

  // Create MatchMetadata
  const matchMetadata = await createValidDTO(MatchMetadata, {
    gameName: metadata.gameName,
    players,
    setupData: metadata.setupData,
    gameover: metadata.gameover,
    nextMatchID: metadata.nextMatchID,
    unlisted: metadata.unlisted,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt
  });

  // Create final MatchDto
  const matchDto = await createValidDTO(MatchDto, {
    matchID,
    state,
    metadata: matchMetadata
  });

  return matchDto;
}

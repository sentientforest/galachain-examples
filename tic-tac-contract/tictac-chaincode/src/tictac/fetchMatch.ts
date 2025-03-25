import { createValidDTO } from "@gala-chain/api";
import { GalaChainContext, getObjectByKey, getObjectsByPartialCompositeKey } from "@gala-chain/chaincode";
import { plainToInstance } from "class-transformer";

import { TicTacMatch } from "./TicTacMatch";
import {
  FetchMatchDto,
  MatchDto,
  MatchGameState,
  MatchMetadata,
  MatchPlayerMetadata,
  MatchState,
  MatchStateContext,
  MatchStateLogEntry
} from "./dtos";
import {
  ChainMatchMetadata,
  ChainMatchPlayerMetadata,
  ChainMatchStateContext,
  ChainMatchStateLogEntry,
  ChainMatchStatePlugins
} from "./types";

export async function fetchMatch(ctx: GalaChainContext, dto: FetchMatchDto): Promise<MatchDto> {
  const { matchID, includeState, includeLog, includeMetadata, includeInitialState } = dto;

  const matchDto = await createValidDTO(MatchDto, {
    matchID
  });

  if (includeState) {
    const gameKey = TicTacMatch.getCompositeKeyFromParts(TicTacMatch.INDEX_KEY, [matchID]);
    const match = await getObjectByKey(ctx, TicTacMatch, gameKey);

    const contextKey = ChainMatchStateContext.getCompositeKeyFromParts(ChainMatchStateContext.INDEX_KEY, [
      matchID
    ]);
    const context = await getObjectByKey(ctx, ChainMatchStateContext, contextKey);

    const pluginKey = ChainMatchStatePlugins.getCompositeKeyFromParts(ChainMatchStatePlugins.INDEX_KEY, [
      matchID
    ]);
    const pluginsEntry = await getObjectByKey(ctx, ChainMatchStatePlugins, pluginKey).catch(() => {
      return plainToInstance(ChainMatchStatePlugins, { matchID, plugins: {} });
    });

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

    const state = await createValidDTO(MatchState, {
      _stateID: match._stateID,
      G: gameState,
      ctx: stateContext,
      plugins: pluginsEntry.plugins
    });

    matchDto.state = state;
  }

  if (includeLog) {
    const matchLogEntries: ChainMatchStateLogEntry[] = await getObjectsByPartialCompositeKey(
      ctx,
      ChainMatchStateLogEntry.INDEX_KEY,
      [matchID],
      ChainMatchStateLogEntry
    );

    const log = matchLogEntries.map((entry) => {
      return plainToInstance(MatchStateLogEntry, entry);
    });

    matchDto.log = log;
  }

  if (includeMetadata) {
    const metadataKey = ChainMatchMetadata.getCompositeKeyFromParts(ChainMatchMetadata.INDEX_KEY, [matchID]);
    const metadata = await getObjectByKey(ctx, ChainMatchMetadata, metadataKey).catch(() => undefined);

    if (metadata) {
      const playerMetadataEntries: ChainMatchPlayerMetadata[] = await getObjectsByPartialCompositeKey(
        ctx,
        ChainMatchPlayerMetadata.INDEX_KEY,
        [matchID],
        ChainMatchPlayerMetadata
      );

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

      matchDto.metadata = matchMetadata;
    }
  }

  if (includeInitialState) {
    const initialKey = InitialStateKey(matchID);
    const gameKey = TicTacMatch.getCompositeKeyFromParts(TicTacMatch.INDEX_KEY, [initialKey]);
    const match = await getObjectByKey(ctx, TicTacMatch, gameKey);

    const contextKey = ChainMatchStateContext.getCompositeKeyFromParts(ChainMatchStateContext.INDEX_KEY, [
      initialKey
    ]);
    const context = await getObjectByKey(ctx, ChainMatchStateContext, contextKey);

    const pluginKey = ChainMatchStatePlugins.getCompositeKeyFromParts(ChainMatchStatePlugins.INDEX_KEY, [
      initialKey
    ]);
    const pluginsEntry = await getObjectByKey(ctx, ChainMatchStatePlugins, pluginKey).catch(() => {
      return plainToInstance(ChainMatchStatePlugins, { initialKey, plugins: {} });
    });

    const initialGameState = await createValidDTO(MatchGameState, {
      playerX: match.playerX,
      playerO: match.playerO,
      board: match.board,
      currentPlayer: match.currentPlayer,
      status: match.status,
      currentMove: match.currentMove,
      createdAt: match.createdAt,
      lastMoveAt: match.lastMoveAt
    });

    const initialContext = await createValidDTO(MatchStateContext, {
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

    const initialState = await createValidDTO(MatchState, {
      _stateID: match._stateID,
      G: initialGameState,
      ctx: initialContext,
      plugins: pluginsEntry.plugins
    });

    matchDto.initialState = initialState;
  }

  return matchDto;
}

// todo: move these values to contants / enum type
// and rather than following a single string as in flat file, e.g
// `${matchID}:initial` with GalaChain composite keys we use
// separate parts ...
export function InitialStateKey(matchID: string) {
  return `${matchID}:initial`;
}

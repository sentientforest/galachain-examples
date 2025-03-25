import { createValidChainObject } from "@gala-chain/api";
import { GalaChainContext, putChainObject } from "@gala-chain/chaincode";

import { TicTacMatch } from "./TicTacMatch";
import { CreateMatchDto } from "./dtos";
import {
  ChainMatchMetadata,
  ChainMatchPlayerMetadata,
  ChainMatchStateContext,
  ChainMatchStatePlugins
} from "./types";

export async function createMatch(ctx: GalaChainContext, dto: CreateMatchDto): Promise<CreateMatchDto> {
  const { matchID, initialStateID, state, metadata } = dto;
  const { _stateID, plugins } = state;

  const matchMetadata = await createValidChainObject(ChainMatchMetadata, {
    matchID: matchID,
    gameName: metadata.gameName,
    setupData: metadata.setupData,
    gameover: metadata.gameover,
    nextMatchID: metadata.nextMatchID,
    unlisted: metadata.unlisted,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt
  });

  const playerMetadataEntries: ChainMatchPlayerMetadata[] = [];

  for (const playerId in metadata.players) {
    const playerMetadata = await createValidChainObject(ChainMatchPlayerMetadata, {
      matchID: matchID,
      playerId: playerId,
      gameName: metadata.gameName,
      name: metadata.players[playerId].name,
      // todo: what exactly is this "credentials" string used for in boardgame.io, should it be stored?
      // i.e. is it sensitive or non-sensitive data? If sensitive, it shouldn't be on chain
      // need to investigate boardgame.io library internals or client implementations more closely
      credentials: metadata.players[playerId].credentials,
      data: metadata.players[playerId].data,
      isConnected: metadata.players[playerId].isConnected
    });

    playerMetadataEntries.push(playerMetadata);
  }

  const matchCtx = await createValidChainObject(ChainMatchStateContext, {
    matchID,
    ...state.ctx
  });

  const matchGame = await createValidChainObject(TicTacMatch, {
    _stateID,
    matchID,
    ...state.G
  });

  const matchPlugins = await createValidChainObject(ChainMatchStatePlugins, {
    matchID: matchID,
    plugins
  });

  const initialMatchCtx = await createValidChainObject(ChainMatchStateContext, {
    matchID: initialStateID,
    ...state.ctx
  });

  const initialMatchGame = await createValidChainObject(TicTacMatch, {
    _stateID: _stateID,
    matchID: initialStateID,
    ...state.G
  });

  const initialMatchPlugins = await createValidChainObject(ChainMatchStatePlugins, {
    matchID: initialStateID,
    plugins
  });

  await putChainObject(ctx, initialMatchGame);
  await putChainObject(ctx, initialMatchCtx);
  await putChainObject(ctx, matchGame);
  await putChainObject(ctx, matchCtx);
  await putChainObject(ctx, matchMetadata);
  for (const playerMetadata of playerMetadataEntries) {
    await putChainObject(ctx, playerMetadata);
  }
  await putChainObject(ctx, matchPlugins);
  await putChainObject(ctx, initialMatchPlugins);

  return dto;
}

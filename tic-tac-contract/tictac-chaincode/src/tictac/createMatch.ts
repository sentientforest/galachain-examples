import { createValidChainObject } from "@gala-chain/api";
import { GalaChainContext, putChainObject } from "@gala-chain/chaincode";

import { TicTacMatch } from "./TicTacMatch";
import { CreateMatchDto } from "./dtos";
import { ChainMatchMetadata, ChainMatchPlayerMetadata, ChainMatchStateContext } from "./types";

export async function createMatch(ctx: GalaChainContext, dto: CreateMatchDto): Promise<CreateMatchDto> {
  const { matchID, initialStateID, state, metadata } = dto;

  const matchMetadata = await createValidChainObject(ChainMatchMetadata, {
    gameName: metadata.gameName,
    matchID: matchID,
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
      gameName: metadata.gameName,
      matchID: matchID,
      playerId: playerId,
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
    matchID,
    ...state.G
  });

  const initialMatchCtx = await createValidChainObject(ChainMatchStateContext, {
    matchID: initialStateID,
    ...state.ctx
  });

  const initialMatchGame = await createValidChainObject(TicTacMatch, {
    matchID: initialStateID,
    ...state.G
  });

  await putChainObject(ctx, initialMatchGame);
  await putChainObject(ctx, initialMatchCtx);
  await putChainObject(ctx, matchGame);
  await putChainObject(ctx, matchCtx);
  await putChainObject(ctx, matchMetadata);
  for (const playerMetadata of playerMetadataEntries) {
    await putChainObject(ctx, playerMetadata);
  }

  return dto;
}

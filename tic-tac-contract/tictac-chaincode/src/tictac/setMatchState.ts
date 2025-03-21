import { NotImplementedError, ValidationFailedError, createValidChainObject } from "@gala-chain/api";
import { GalaChainContext, getObjectByKey, putChainObject } from "@gala-chain/chaincode";

import { TicTacMatch } from "./TicTacMatch";
import { MatchStateDto } from "./dtos";
import { ChainMatchStateContext } from "./types";

export async function setMatchState(ctx: GalaChainContext, dto: MatchStateDto): Promise<TicTacMatch> {
  const player = ctx.callingUser;
  const timestamp = ctx.txUnixTime;
  const { matchID, state, metadata, deltalog } = dto;

  if (Array.isArray(deltalog)) {
    throw new NotImplementedError(`Patching Match State by deltalog is not yet implemented.`);
  }

  if (!state) {
    throw new ValidationFailedError(
      `Calling user ${player} submitted no state object for setMatchState call: ${dto.serialize()}`
    );
  }
  const currentMove = state.G.currentMove;
  const gameStateContext = state.ctx;

  const matchKey = TicTacMatch.getCompositeKeyFromParts(TicTacMatch.INDEX_KEY, [matchID]);
  const match = await getObjectByKey(ctx, TicTacMatch, matchKey);

  if (currentMove) {
    match.makeMove(player, currentMove, timestamp);
  } else {
    throw new ValidationFailedError(
      `Caller ${ctx.callingUser} provided no current move provided for setState call: ${dto.serialize()}`
    );
  }

  await putChainObject(ctx, match);

  if (gameStateContext) {
    const matchCtx = await createValidChainObject(ChainMatchStateContext, {
      matchID,
      ...state.ctx
    });

    await putChainObject(ctx, matchCtx);
  }

  if (metadata) {
    const [matchMetadata, playerMetadataEntries] = await metadata.gameMetadataToChainEntries(matchID);
    await putChainObject(ctx, matchMetadata);
    for (const playerMetadata of playerMetadataEntries) {
      await putChainObject(ctx, playerMetadata);
    }
  }

  return match;
}

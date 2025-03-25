import { ValidationFailedError, createValidChainObject } from "@gala-chain/api";
import { GalaChainContext, getObjectByKey, putChainObject } from "@gala-chain/chaincode";
import { plainToInstance } from "class-transformer";

import { TicTacMatch } from "./TicTacMatch";
import { MatchStateDto } from "./dtos";
import { ChainMatchStateContext, ChainMatchStateLogEntry, ChainMatchStatePlugins } from "./types";

export async function setMatchState(ctx: GalaChainContext, dto: MatchStateDto): Promise<TicTacMatch> {
  const player = ctx.callingUser;
  const timestamp = ctx.txUnixTime;
  const { matchID, state, metadata, deltalog } = dto;

  if (!state && !Array.isArray(deltalog)) {
    throw new ValidationFailedError(
      `Calling user ${player} submitted no state object nor a deltaLog for setMatchState call: ${dto.serialize()}`
    );
  }

  const matchKey = TicTacMatch.getCompositeKeyFromParts(TicTacMatch.INDEX_KEY, [matchID]);
  const match = await getObjectByKey(ctx, TicTacMatch, matchKey);

  if (state) {
    const currentMove = state.G.currentMove;

    if (typeof currentMove === "number") {
      match.makeMove(player, currentMove, timestamp);
      // todo: else if (?) { ...iterate deltalog for currentmove }
    } else {
      throw new ValidationFailedError(
        `Caller ${ctx.callingUser} provided no current move provided for setState call: ${dto.serialize()}`
      );
    }

    match._stateID = state._stateID;

    await putChainObject(ctx, match);

    if (state.ctx) {
      const matchCtx = await createValidChainObject(ChainMatchStateContext, {
        matchID,
        ...state.ctx
      });

      await putChainObject(ctx, matchCtx);
    }

    if (state.plugins) {
      const statePlugins = await createValidChainObject(ChainMatchStatePlugins, {
        matchID: matchID,
        plugins: state.plugins
      });

      await putChainObject(ctx, statePlugins);
    }
  }

  if (metadata) {
    const [matchMetadata, playerMetadataEntries] = await metadata.gameMetadataToChainEntries(matchID);
    await putChainObject(ctx, matchMetadata);
    for (const playerMetadata of playerMetadataEntries) {
      await putChainObject(ctx, playerMetadata);
    }
  }

  if (Array.isArray(deltalog)) {
    const logEntries = deltalog.map((delta) => {
      return plainToInstance(ChainMatchStateLogEntry, {
        matchID: matchID,
        ...delta
      });
    });

    for (const logEntry of logEntries) {
      await putChainObject(ctx, logEntry);
    }
  }

  return match;
}

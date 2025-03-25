import { ValidationFailedError } from "@gala-chain/api";
import { GalaChainContext, putChainObject } from "@gala-chain/chaincode";

import { MatchStateDto } from "./dtos";

export async function setMatchMetadata(ctx: GalaChainContext, dto: MatchStateDto): Promise<MatchStateDto> {
  const { matchID, metadata } = dto;

  if (!metadata) {
    throw new ValidationFailedError(
      `Caller ${ctx.callingUser} setMatchMetadata dto missing metadata: ${dto.serialize()}`
    );
  }
  const [matchMetadata, playerMetadataEntries] = await metadata.gameMetadataToChainEntries(matchID);
  await putChainObject(ctx, matchMetadata);
  for (const playerMetadata of playerMetadataEntries) {
    await putChainObject(ctx, playerMetadata);
  }

  return dto;
}

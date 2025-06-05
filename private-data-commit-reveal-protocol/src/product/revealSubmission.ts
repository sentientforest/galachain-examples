import { GalaChainContext } from "@gala-chain/chaincode";

import { RevealSubmissionDto, RevealSubmissionResDto } from "./api";

export async function revealSubmission(
  ctx: GalaChainContext,
  dto: RevealSubmissionDto
): Promise<RevealSubmissionResDto> {
  throw new Error("not implemented");
}

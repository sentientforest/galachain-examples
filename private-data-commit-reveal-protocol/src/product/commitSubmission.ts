import { GalaChainContext } from "@gala-chain/chaincode";

import { CommitSubmissionDto, CommitSubmissionResDto } from "./api";

export async function commitSubmission(
  ctx: GalaChainContext,
  dto: CommitSubmissionDto
): Promise<CommitSubmissionResDto> {
  throw new Error("Not Implemented");
}

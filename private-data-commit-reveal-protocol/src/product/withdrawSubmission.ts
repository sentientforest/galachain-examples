import { GalaChainContext } from "@gala-chain/chaincode";

import { WithdrawSubmissionDto, WithdrawSubmissionResDto } from "./api";

export async function withdrawSubmission(
  ctx: GalaChainContext,
  dto: WithdrawSubmissionDto
): Promise<WithdrawSubmissionResDto> {
  throw new Error("not implemented");
}

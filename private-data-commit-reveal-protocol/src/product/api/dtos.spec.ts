import {
  ChainUser,
  FeeVerificationDto,
  asValidUserRef,
  createValidDTO,
  randomUniqueKey
} from "@gala-chain/api";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";
import BigNumber from "bignumber.js";
import { plainToInstance } from "class-transformer";

import {
  CommitSubmissionDto,
  CommitSubmissionResDto,
  ICommitSubmissionDto,
  IRevealSubmissionDto,
  IWithdrawSubmissionDto,
  RevealSubmissionDto,
  RevealSubmissionResDto,
  WithdrawSubmissionDto,
  WithdrawSubmissionResDto
} from "./dtos";

describe("dtos", () => {
  it("should construct CommitSubmissionDto with constructor", async () => {
    // Given
    const dto = new CommitSubmissionDto({
      collection: "test collection",
      hash: bytesToHex(sha256(utf8ToBytes("test"))),
      uniqueKey: "test nonce"
    });

    // When
    const validation = await dto.validate();

    // Then
    expect(validation).toEqual([]);
  });
});

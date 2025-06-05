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
  const testHash = bytesToHex(sha256(utf8ToBytes("test")));

  it("should construct CommitSubmissionDto with constructor", async () => {
    // Given
    const dto = new CommitSubmissionDto({
      collection: "test collection",
      hash: testHash,
      uniqueKey: "test nonce"
    });

    // When
    const validation = await dto.validate();

    // Then
    expect(validation).toEqual([]);
  });

  it("should construct CommitSubmissionResDto with plainToInstance", async () => {
    // Given
    const dto = plainToInstance(CommitSubmissionResDto, {
      collection: "test collection",
      owner: asValidUserRef("client|abc"),
      hash: testHash,
      nonce: "0"
    });

    // When
    const validation = await dto.validate();

    // Then
    expect(validation).toEqual([]);
  });
});

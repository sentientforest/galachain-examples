import {
  BigNumberIsPositive,
  BigNumberProperty,
  ChainKey,
  ChainObject,
  IsUserRef,
  UserRef
} from "@gala-chain/api";
import BigNumber from "bignumber.js";
import { IsNotEmpty, IsString } from "class-validator";

export interface ISubmissionCommitment {
  collection: string;
  owner: UserRef;
  hash: string;
  nonce: string;
}

export class SubmissionCommitment extends ChainObject {
  public static INDEX_KEY = "PDCRSC"; // private data commit reveal Submission Commitment

  public static SEPARATOR = "/";

  constructor(data: ISubmissionCommitment) {
    super();
    this.collection = data.collection;
    this.owner = data.owner;
    this.hash = data.hash;
    this.nonce = data.nonce;
  }

  @ChainKey({ position: 0 })
  @IsNotEmpty()
  @IsString()
  collection: string;

  @ChainKey({ position: 1 })
  @IsNotEmpty()
  @IsString()
  owner: UserRef;

  @ChainKey({ position: 2 })
  @IsNotEmpty()
  @IsString()
  hash: string;

  @ChainKey({ position: 3 })
  @IsNotEmpty()
  @IsString()
  nonce: string;
}

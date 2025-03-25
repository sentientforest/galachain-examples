import {
  GalaChainContext,
  GalaContract,
  GalaTransaction,
  GalaTransactionType,
  UnsignedEvaluate
} from "@gala-chain/chaincode";

import { version } from "../../package.json";
import { TicTacMatch } from "./TicTacMatch";
import { createMatch } from "./createMatch";
import {
  CreateMatchDto,
  FetchMatchDto,
  FetchMatchesDto,
  FetchMatchesResDto,
  JoinMatchDto,
  MatchDto
} from "./dtos";
import { fetchMatch } from "./fetchMatch";
import { fetchMatches } from "./fetchMatches";
import { joinMatch } from "./joinMatch";
import { setMatchMetadata } from "./setMatchMetadata";
import { setMatchState } from "./setMatchState";

export class TicTacContract extends GalaContract {
  constructor() {
    super("TicTacContract", version);
  }

  @GalaTransaction({
    in: CreateMatchDto,
    out: CreateMatchDto,
    type: GalaTransactionType.SUBMIT,
    verifySignature: true,
    enforceUniqueKey: true
  })
  public async CreateMatch(ctx: GalaChainContext, dto: CreateMatchDto): Promise<CreateMatchDto> {
    return createMatch(ctx, dto);
  }

  @UnsignedEvaluate({
    in: FetchMatchDto,
    out: MatchDto
  })
  public async FetchMatch(ctx: GalaChainContext, dto: FetchMatchDto): Promise<MatchDto> {
    return fetchMatch(ctx, dto);
  }

  @GalaTransaction({
    in: JoinMatchDto,
    out: TicTacMatch,
    type: GalaTransactionType.SUBMIT,
    verifySignature: true,
    enforceUniqueKey: true
  })
  public async JoinMatch(ctx: GalaChainContext, dto: JoinMatchDto): Promise<TicTacMatch> {
    return joinMatch(ctx, dto);
  }

  @GalaTransaction({
    in: MatchDto,
    out: TicTacMatch,
    type: GalaTransactionType.SUBMIT,
    verifySignature: true,
    enforceUniqueKey: true
  })
  public async SetMatchState(ctx: GalaChainContext, dto: MatchDto): Promise<TicTacMatch> {
    return setMatchState(ctx, dto);
  }

  @GalaTransaction({
    in: MatchDto,
    out: MatchDto,
    type: GalaTransactionType.SUBMIT,
    verifySignature: true,
    enforceUniqueKey: true
  })
  public async SetMatchMetadata(ctx: GalaChainContext, dto: MatchDto): Promise<MatchDto> {
    return setMatchMetadata(ctx, dto);
  }

  @UnsignedEvaluate({
    in: FetchMatchesDto,
    out: FetchMatchesResDto
  })
  public async FetchMatches(ctx: GalaChainContext, dto: FetchMatchesDto): Promise<FetchMatchesResDto> {
    return await fetchMatches(ctx, dto);
  }
}

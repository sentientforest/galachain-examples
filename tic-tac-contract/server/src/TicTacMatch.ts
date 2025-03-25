import { ChainKey, ChainObject, DefaultError } from "@gala-chain/api";
import { Exclude } from "class-transformer";
import { IsArray, IsOptional, IsString } from "class-validator";

export enum GameStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  X_WON = "X_WON",
  O_WON = "O_WON",
  DRAW = "DRAW"
}

export enum PlayerSymbol {
  X = "X",
  O = "O"
}

export class TicTacMatch extends ChainObject {
  @Exclude()
  static INDEX_KEY = "GCTTT";

  @ChainKey({ position: 0 })
  @IsString()
  public matchID: string;

  @IsOptional()
  @IsString()
  public playerX?: string | undefined;

  @IsOptional()
  @IsString()
  public playerO?: string | undefined;

  @IsArray()
  public board: (PlayerSymbol | null)[];

  public status: GameStatus;

  public currentPlayer: PlayerSymbol;

  public currentMove?: number;

  public createdAt: number;

  public lastMoveAt: number;

  // Serialized boardgame.io state
  public boardgameState?: string | undefined;

  constructor(
    matchId: string,
    playerX: string | undefined,
    playerO: string | undefined,
    createdAt: number,
    boardgameState?: string | undefined
  ) {
    super();
    this.matchID = matchId;
    this.playerX = playerX;
    this.playerO = playerO;
    this.board = Array(9).fill(null);
    this.status = GameStatus.IN_PROGRESS;
    this.currentPlayer = PlayerSymbol.X;
    this.createdAt = createdAt;
    this.lastMoveAt = createdAt;
    this.boardgameState = boardgameState;
  }
}

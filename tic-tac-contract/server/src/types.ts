import { ChainKey, ChainObject} from "@gala-chain/api";
import {
  Allow,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";

export class ChainMatchPlayerMetadata extends ChainObject {
  public static INDEX_KEY = "BGCMPM";
  @ChainKey({ position: 0 })
  @IsNotEmpty()
  gameName: string;

  @ChainKey({ position: 1 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @ChainKey({ position: 2 })
  @IsString()
  playerId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  credentials?: string;

  @IsOptional()
  @Allow()
  data?: any;

  @IsOptional()
  @IsBoolean()
  isConnected?: boolean;
}

export class ChainMatchMetadata extends ChainObject {
  public static INDEX_KEY = "BGCMMD";

  @ChainKey({ position: 0 })
  @IsNotEmpty()
  gameName: string;

  @ChainKey({ position: 1 })
  @IsNotEmpty()
  @IsString()
  matchID: string;

  @IsOptional()
  setupData?: any;

  @IsOptional()
  gameover?: any;

  @IsOptional()
  @IsString()
  nextMatchID?: string;

  @IsOptional()
  @IsBoolean()
  unlisted?: boolean;

  @IsNumber()
  createdAt: number;

  @IsNumber()
  updatedAt: number;
}

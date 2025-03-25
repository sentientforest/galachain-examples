/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */
import { ChainKey, ChainObject, DefaultError } from "@gala-chain/api";
import { Exclude } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

import { GameStatus, PlayerSymbol } from "./types";

export class TicTacMatch extends ChainObject {
  @Exclude()
  static INDEX_KEY = "GCTTT";

  @ChainKey({ position: 0 })
  @IsString()
  public matchID: string;

  @IsOptional()
  @IsNumber()
  public _stateID: number | null;

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

  constructor(matchId: string, playerX: string | undefined, playerO: string | undefined, createdAt: number) {
    super();
    this.matchID = matchId;
    this.playerX = playerX;
    this.playerO = playerO;
    this.board = Array(9).fill(null);
    this.status = GameStatus.IN_PROGRESS;
    this.currentPlayer = PlayerSymbol.X;
    this.createdAt = createdAt;
    this.lastMoveAt = createdAt;
  }

  private checkWinner(): GameStatus {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a] === PlayerSymbol.X ? GameStatus.X_WON : GameStatus.O_WON;
      }
    }

    if (this.board.every((cell) => cell !== null)) {
      return GameStatus.DRAW;
    }

    return GameStatus.IN_PROGRESS;
  }

  public canMakeMove(player: string, position: number): void {
    // todo: collect and combine errors into single throw
    // const moveViolations = [];
    if (this.status !== GameStatus.IN_PROGRESS) {
      throw new MatchStatusError(player, position, this.currentPlayer, this.status);
    }

    if (position < 0 || 8 < position) {
      throw new PositionOutOfRangeError(player, position, this.currentPlayer, this.status);
    }

    if (this.board[position] !== null) {
      throw new InvalidMoveError(player, position, this.currentPlayer, this.status);
    }

    if (this.currentPlayer !== player) {
      throw new MoveOutOfTurnError(player, position, this.currentPlayer, this.status);
    }
  }

  public makeMove(nextPlayer: string, position: number, timestamp: number): void {
    const currentPlayer = this.currentPlayer;

    this.canMakeMove(currentPlayer, position);

    this.board[position] = this.currentPlayer;
    this.lastMoveAt = timestamp;

    // Update game status
    const newStatus = this.checkWinner();
    if (newStatus !== GameStatus.IN_PROGRESS) {
      this.status = newStatus;
    }

    // Switch current player
    this.currentPlayer = this.currentPlayer === PlayerSymbol.X ? PlayerSymbol.O : PlayerSymbol.X;

    if (this.currentPlayer !== nextPlayer) {
      throw new MoveOutOfTurnError(nextPlayer, position, currentPlayer, newStatus);
    }
  }
}

export class InvalidMoveError extends DefaultError {
  constructor(player: string, position: number, currentPlayer: PlayerSymbol, status: GameStatus) {
    super(`Invalid move: ${position} by ${player}. currentPlayer: ${currentPlayer}`, {
      player,
      position,
      currentPlayer,
      status
    });
  }
}

export class MatchStatusError extends DefaultError {
  constructor(player: string, position: number, currentPlayer: PlayerSymbol, status: GameStatus) {
    super(`Invalid match status: ${status}`, { player, position, currentPlayer, status });
  }
}

export class PositionOutOfRangeError extends DefaultError {
  constructor(player: string, position: number, currentPlayer: PlayerSymbol, status: GameStatus) {
    super(`Position out of range: ${position} by ${player}.`, { player, position, currentPlayer, status });
  }
}

export class MoveOutOfTurnError extends DefaultError {
  constructor(player: string, position: number, currentPlayer: PlayerSymbol, status: GameStatus) {
    super(`Move out of turn: currentPlayer: ${currentPlayer}, move by: ${player} to position ${position}`, {
      player,
      position,
      currentPlayer,
      status
    });
  }
}

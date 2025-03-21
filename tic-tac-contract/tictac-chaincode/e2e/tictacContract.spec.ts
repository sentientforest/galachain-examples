import { GalaChainResponse, GalaChainResponseType, createValidDTO, randomUniqueKey } from "@gala-chain/api";
import { ChainClient, ChainUser, CommonContractAPI, commonContractAPI } from "@gala-chain/client";
import { AdminChainClients, TestClients, transactionErrorKey, transactionSuccess } from "@gala-chain/test";
import { afterAll, beforeAll, describe, expect, jest, test } from "@jest/globals";

import {
  CreateMatchDto,
  FetchMatchDto,
  FetchMatchesDto,
  FetchMatchesResDto,
  JoinMatchDto,
  MatchDto,
  MatchGameState,
  MatchMetadata,
  MatchPlayerMetadata,
  MatchState,
  MatchStateContext,
  TicTacMatch
} from "../src/tictac";
import { GameStatus, PlayerSymbol } from "../src/tictac/types";

jest.setTimeout(30000);

describe("TicTac Contract", () => {
  const testMatchID = "e2e-test-match-id";
  const initialStateID = `${testMatchID}-initial-state`;
  const tictacContractConfig = {
    tictac: {
      channel: "product-channel",
      chaincode: "basic-product",
      contract: "TicTacContract",
      api: tictacContractAPI
    }
  };
  let client: AdminChainClients<typeof tictacContractConfig>;
  let playerX: ChainUser;
  let playerO: ChainUser;
  let matchId: string;
  let matchCreatedAt: number;

  beforeAll(async () => {
    client = await TestClients.createForAdmin(tictacContractConfig);
    playerX = await client.createRegisteredUser();
    playerO = await client.createRegisteredUser();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  test("Create a new game", async () => {
    // Given
    const gameState = await createValidDTO(MatchGameState, {
      playerX: playerX.identityKey,
      playerO: undefined,
      board: Array(9).fill(null),
      currentPlayer: PlayerSymbol.X,
      status: GameStatus.OPEN,
      createdAt: Date.now(),
      lastMoveAt: Date.now()
    });

    const stateContext = await createValidDTO(MatchStateContext, {
      numPlayers: 2,
      playOrder: [playerX.publicKey],
      playOrderPos: 0,
      activePlayers: null,
      currentPlayer: playerX.publicKey,
      numMoves: 0,
      turn: 0,
      phase: "play",
      _internal: JSON.stringify({})
    });

    const matchState = await createValidDTO(MatchState, {
      G: gameState,
      ctx: stateContext
    });

    const playerXMetadata = await createValidDTO(MatchPlayerMetadata, {
      name: "Player X",
      credentials: playerX.identityKey
    });

    const playerOMetadata = await createValidDTO(MatchPlayerMetadata, {
      name: "Player O"
    });

    const metadata = await createValidDTO(MatchMetadata, {
      gameName: "tictac",
      players: {
        0: playerXMetadata,
        1: playerOMetadata
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    const dto = await createValidDTO(CreateMatchDto, {
      matchID: testMatchID,
      initialStateID: initialStateID,
      state: matchState,
      metadata: metadata,
      uniqueKey: randomUniqueKey()
    }).signed(playerX.privateKey);

    // When
    const response = await client.tictac.CreateMatch(dto);

    // Then
    expect(response).toEqual(transactionSuccess());

    // Store game ID for subsequent tests
    const fetchDto = new FetchMatchesDto().signed(playerX.privateKey);
    const fetchResponse = await client.tictac.FetchMatches(fetchDto);
    const pagedGames = (fetchResponse as GalaChainResponse<FetchMatchesResDto>).Data!;
    expect(pagedGames).toBeDefined();
    expect(pagedGames.results.length).toBeGreaterThan(0);

    // Find our newly created game
    const ourGame = pagedGames.results.find(
      (match) => match.playerX === playerX.identityKey && match.playerO === undefined
    );
    expect(ourGame).toBeDefined();
    expect(ourGame).toEqual(
      expect.objectContaining({
        matchID: testMatchID,
        playerX: playerX.identityKey,
        status: GameStatus.OPEN,
        currentPlayer: PlayerSymbol.X,
        board: Array(9).fill(null),
        createdAt: expect.any(Number),
        lastMoveAt: expect.any(Number)
      })
    );
    matchId = ourGame!.matchID;
    matchCreatedAt = ourGame!.createdAt || 0;
    expect(matchId).toEqual(testMatchID);
  });

  test("Fetch games for player X", async () => {
    // Given
    const dto = await createValidDTO(FetchMatchesDto, {}).signed(playerX.privateKey);

    // When
    const response = await client.tictac.FetchMatches(dto);

    // Then
    const pagedGames = (response as GalaChainResponse<FetchMatchesResDto>).Data!;
    expect(pagedGames).toBeDefined();
    expect(pagedGames.results.length).toBeGreaterThan(0);

    // Find our game
    const ourGame = pagedGames.results.find((match) => match.playerX === playerX.identityKey);
    expect(ourGame).toBeDefined();
    expect(ourGame).toEqual(
      expect.objectContaining({
        matchID: testMatchID,
        playerX: playerX.identityKey,
        status: GameStatus.OPEN,
        currentPlayer: PlayerSymbol.X,
        board: Array(9).fill(null)
      })
    );
  });

  test("Allow player O to join open game", async () => {
    // Given
    const gameState = await createValidDTO(MatchGameState, {
      playerX: playerX.identityKey,
      playerO: playerO.identityKey,
      board: Array(9).fill(null),
      currentPlayer: PlayerSymbol.X,
      status: GameStatus.IN_PROGRESS,
      createdAt: matchCreatedAt,
      lastMoveAt: matchCreatedAt
    });

    const stateContext = await createValidDTO(MatchStateContext, {
      numPlayers: 2,
      playOrder: [playerX.publicKey, playerO.publicKey],
      playOrderPos: 0,
      activePlayers: null,
      currentPlayer: playerX.publicKey,
      numMoves: 0,
      turn: 0,
      phase: "play",
      _internal: JSON.stringify({})
    });

    const matchState = await createValidDTO(MatchState, {
      G: gameState,
      ctx: stateContext
    });

    const dto = await createValidDTO(JoinMatchDto, {
      matchID: matchId,
      state: matchState,
      uniqueKey: randomUniqueKey()
    }).signed(playerO.privateKey);

    // When
    const response = await client.tictac.JoinMatch(dto);

    // Then
    expect(response).toEqual(transactionSuccess());

    const match = response.Data;
    expect(match).toBeDefined();
    expect(match?.playerX).toBe(playerX.identityKey);
    expect(match?.playerO).toBe(playerO.identityKey);
    expect(match?.board).toEqual(Array(9).fill(null));
    expect(match?.currentPlayer).toBe(PlayerSymbol.X);
    expect(match?.status).toBe(GameStatus.IN_PROGRESS);
  });

  test("Make valid moves alternating between players", async () => {
    // Player X makes first move
    const gameState = await createValidDTO(MatchGameState, {
      playerX: playerX.identityKey,
      playerO: playerO.identityKey,
      board: [PlayerSymbol.X, null, null, null, null, null, null, null, null],
      currentPlayer: PlayerSymbol.X,
      currentMove: 0,
      status: GameStatus.IN_PROGRESS,
      createdAt: matchCreatedAt,
      lastMoveAt: matchCreatedAt
    });

    const stateContext = await createValidDTO(MatchStateContext, {
      numPlayers: 2,
      playOrder: [playerX.publicKey, playerO.publicKey],
      playOrderPos: 1,
      activePlayers: null,
      currentPlayer: playerX.publicKey,
      numMoves: 1,
      turn: 1,
      phase: "play",
      _internal: JSON.stringify({})
    });

    const matchState = await createValidDTO(MatchState, {
      G: gameState,
      ctx: stateContext
    });

    const moveX1 = await createValidDTO(MatchDto, {
      matchID: matchId,
      state: matchState,
      uniqueKey: randomUniqueKey()
    }).signed(playerX.privateKey);

    // When
    const response = await client.tictac.SetMatchState(moveX1);

    // Then
    expect(response).toEqual(transactionSuccess());

    // Player O makes second move
    const gameState2 = await createValidDTO(MatchGameState, {
      playerX: playerX.identityKey,
      playerO: playerO.identityKey,
      board: [PlayerSymbol.X, null, null, null, PlayerSymbol.O, null, null, null, null],
      currentPlayer: PlayerSymbol.O,
      currentMove: 4,
      status: GameStatus.IN_PROGRESS,
      createdAt: matchCreatedAt,
      lastMoveAt: matchCreatedAt
    });

    const stateContext2 = await createValidDTO(MatchStateContext, {
      numPlayers: 2,
      playOrder: [playerX.publicKey, playerO.publicKey],
      playOrderPos: 0,
      activePlayers: null,
      currentPlayer: playerO.publicKey,
      numMoves: 2,
      turn: 2,
      phase: "play",
      _internal: JSON.stringify({})
    });

    const matchState2 = await createValidDTO(MatchState, {
      G: gameState2,
      ctx: stateContext2
    });

    const moveO1 = await createValidDTO(MatchDto, {
      matchID: matchId,
      state: matchState2,
      uniqueKey: randomUniqueKey()
    }).signed(playerO.privateKey);

    // When
    const response2 = await client.tictac.SetMatchState(moveO1);

    // Then
    expect(response2).toEqual(transactionSuccess());

    // Verify current game state
    const fetchDto = await createValidDTO(FetchMatchDto, {
      matchID: matchId
    }).signed(playerX.privateKey);
    const fetchResponse = await client.tictac.FetchMatch(fetchDto);
    expect(fetchResponse).toEqual(transactionSuccess());
    const match = (fetchResponse as GalaChainResponse<MatchDto>).Data!;
    expect(match).toBeDefined();
    expect(match.state).toBeDefined();

    const currentGameState = match.state?.G;
    expect(currentGameState).toBeDefined();
    expect(currentGameState?.board).toEqual([
      PlayerSymbol.X,
      null,
      null,
      null,
      PlayerSymbol.O,
      null,
      null,
      null,
      null
    ]);
    expect(currentGameState?.currentPlayer).toBe(PlayerSymbol.X);
    expect(currentGameState?.status).toBe(GameStatus.IN_PROGRESS);
  });

  test("Fail to make move out of turn", async () => {
    // Given - Player O tries to move when it's X's turn
    const invalidGameState = await createValidDTO(MatchGameState, {
      playerX: playerX.identityKey,
      playerO: playerO.identityKey,
      board: [PlayerSymbol.X, PlayerSymbol.O, null, null, PlayerSymbol.O, null, null, null, null],
      currentPlayer: PlayerSymbol.O, // It's X's turn but O is trying to move
      currentMove: 1,
      status: GameStatus.IN_PROGRESS,
      createdAt: matchCreatedAt,
      lastMoveAt: matchCreatedAt
    });

    const stateContext = await createValidDTO(MatchStateContext, {
      numPlayers: 2,
      playOrder: [playerX.publicKey, playerO.publicKey],
      playOrderPos: 0,
      activePlayers: null,
      currentPlayer: playerO.publicKey, // Should be X's turn
      numMoves: 3,
      turn: 3,
      phase: "play",
      _internal: JSON.stringify({})
    });

    const invalidMatchState = await createValidDTO(MatchState, {
      G: invalidGameState,
      ctx: stateContext
    });

    const invalidMove = await createValidDTO(MatchDto, {
      matchID: matchId,
      state: invalidMatchState,
      uniqueKey: randomUniqueKey()
    }).signed(playerO.privateKey);

    // When - Player O tries to move
    const response = await client.tictac.SetMatchState(invalidMove);

    // Then
    expect(response).toEqual(transactionErrorKey("INVALID_MOVE"));
  });

  test("Fail to make move in occupied position", async () => {
    // Given - Player X tries to move in position already taken by O
    const invalidGameState = await createValidDTO(MatchGameState, {
      playerX: playerX.identityKey,
      playerO: playerO.identityKey,
      board: [PlayerSymbol.X, null, null, null, PlayerSymbol.O, null, null, null, null],
      currentPlayer: PlayerSymbol.X,
      currentMove: 4,
      status: GameStatus.IN_PROGRESS,
      createdAt: matchCreatedAt,
      lastMoveAt: matchCreatedAt
    });

    const stateContext = await createValidDTO(MatchStateContext, {
      numPlayers: 2,
      playOrder: [playerX.publicKey, playerO.publicKey],
      playOrderPos: 0,
      activePlayers: null,
      currentPlayer: playerX.publicKey,
      numMoves: 2,
      turn: 2,
      phase: "play",
      _internal: JSON.stringify({})
    });

    const matchState = await createValidDTO(MatchState, {
      G: invalidGameState,
      ctx: stateContext
    });

    // X tries to move in position 1 which is already taken by O
    const invalidMove = await createValidDTO(MatchDto, {
      matchID: matchId,
      state: matchState,
      uniqueKey: randomUniqueKey()
    }).signed(playerX.privateKey);

    // When
    const response = await client.tictac.SetMatchState(invalidMove);

    // Then
    expect(response).toEqual(transactionErrorKey("INVALID_MOVE"));
  });

  test("Complete game with X winning", async () => {
    // X plays center-right
    const gameStateX2 = await createValidDTO(MatchGameState, {
      playerX: playerX.identityKey,
      playerO: playerO.identityKey,
      board: [PlayerSymbol.X, PlayerSymbol.X, null, null, PlayerSymbol.O, null, null, null, null],
      currentPlayer: PlayerSymbol.X,
      currentMove: 1,
      status: GameStatus.IN_PROGRESS,
      createdAt: matchCreatedAt,
      lastMoveAt: matchCreatedAt
    });

    const stateContextX2 = await createValidDTO(MatchStateContext, {
      numPlayers: 2,
      playOrder: [playerX.publicKey, playerO.publicKey],
      playOrderPos: 1,
      activePlayers: null,
      currentPlayer: playerO.publicKey,
      numMoves: 3,
      turn: 3,
      phase: "play",
      _internal: JSON.stringify({})
    });

    const matchStateX2 = await createValidDTO(MatchState, {
      G: gameStateX2,
      ctx: stateContextX2
    });

    const moveX2 = await createValidDTO(MatchDto, {
      matchID: matchId,
      state: matchStateX2,
      uniqueKey: randomUniqueKey()
    }).signed(playerX.privateKey);

    // When
    const responseX2 = await client.tictac.SetMatchState(moveX2);

    // Then
    expect(responseX2).toEqual(transactionSuccess());

    // O plays bottom-right
    const gameStateO2 = await createValidDTO(MatchGameState, {
      playerX: playerX.identityKey,
      playerO: playerO.identityKey,
      board: [PlayerSymbol.X, PlayerSymbol.X, null, null, PlayerSymbol.O, null, null, null, PlayerSymbol.O],
      currentPlayer: PlayerSymbol.O,
      currentMove: 8,
      status: GameStatus.IN_PROGRESS,
      createdAt: matchCreatedAt,
      lastMoveAt: matchCreatedAt
    });

    const stateContextO2 = await createValidDTO(MatchStateContext, {
      numPlayers: 2,
      playOrder: [playerX.publicKey, playerO.publicKey],
      playOrderPos: 0,
      activePlayers: null,
      currentPlayer: playerX.publicKey,
      numMoves: 4,
      turn: 4,
      phase: "play",
      _internal: JSON.stringify({})
    });

    const matchStateO2 = await createValidDTO(MatchState, {
      G: gameStateO2,
      ctx: stateContextO2
    });

    const moveO2 = await createValidDTO(MatchDto, {
      matchID: matchId,
      state: matchStateO2,
      uniqueKey: randomUniqueKey()
    }).signed(playerO.privateKey);

    // When
    const responseO2 = await client.tictac.SetMatchState(moveO2);

    // Then
    expect(responseO2).toEqual(transactionSuccess());

    // X plays right for the win
    const winningGameState = await createValidDTO(MatchGameState, {
      playerX: playerX.identityKey,
      playerO: playerO.identityKey,
      board: [
        PlayerSymbol.X,
        PlayerSymbol.X,
        PlayerSymbol.X,
        null,
        PlayerSymbol.O,
        null,
        null,
        null,
        PlayerSymbol.O
      ],
      currentPlayer: PlayerSymbol.X,
      currentMove: 2,
      status: GameStatus.X_WON,
      createdAt: matchCreatedAt,
      lastMoveAt: matchCreatedAt
    });

    const winningStateContext = await createValidDTO(MatchStateContext, {
      numPlayers: 2,
      playOrder: [playerX.publicKey, playerO.publicKey],
      playOrderPos: 1,
      activePlayers: null,
      currentPlayer: playerO.publicKey,
      numMoves: 5,
      turn: 5,
      phase: "play",
      _internal: JSON.stringify({})
    });

    const winningMatchState = await createValidDTO(MatchState, {
      G: winningGameState,
      ctx: winningStateContext
    });

    const winningMove = await createValidDTO(MatchDto, {
      matchID: matchId,
      state: winningMatchState,
      uniqueKey: randomUniqueKey()
    }).signed(playerX.privateKey);

    // When
    const winningResponse = await client.tictac.SetMatchState(winningMove);

    // Then
    expect(winningResponse).toEqual(transactionSuccess());

    // Verify final game state
    const fetchDto = await createValidDTO(FetchMatchDto, {
      matchID: matchId
    }).signed(playerX.privateKey);
    const fetchResponse = await client.tictac.FetchMatch(fetchDto);
    const match = (fetchResponse as GalaChainResponse<MatchDto>).Data!;
    expect(match).toBeDefined();
    expect(match.state).toBeDefined();

    const finalGameState = match.state?.G;
    expect(finalGameState).toBeDefined();
    expect(finalGameState?.board).toEqual([
      PlayerSymbol.X,
      PlayerSymbol.X,
      PlayerSymbol.X,
      null,
      PlayerSymbol.O,
      null,
      null,
      null,
      PlayerSymbol.O
    ]);
    expect(finalGameState?.currentPlayer).toBe(PlayerSymbol.X);
    expect(finalGameState?.status).toBe(GameStatus.X_WON);
  });
});

interface TicTacContractAPI {
  CreateMatch(dto: CreateMatchDto): Promise<GalaChainResponse<CreateMatchDto>>;
  JoinMatch(dto: JoinMatchDto): Promise<GalaChainResponse<TicTacMatch>>;
  SetMatchState(dto: MatchDto): Promise<GalaChainResponse<TicTacMatch>>;
  SetMatchMetadata(dto: MatchDto): Promise<GalaChainResponse<MatchDto>>;
  FetchMatch(dto: FetchMatchDto): Promise<GalaChainResponse<MatchDto>>;
  FetchMatches(dto: FetchMatchesDto): Promise<GalaChainResponse<FetchMatchesResDto>>;
}

function tictacContractAPI(client: ChainClient): TicTacContractAPI & CommonContractAPI {
  return {
    ...commonContractAPI(client),

    CreateMatch(dto: CreateMatchDto) {
      return client.submitTransaction("CreateMatch", dto) as Promise<GalaChainResponse<CreateMatchDto>>;
    },

    JoinMatch(dto: JoinMatchDto) {
      return client.submitTransaction("JoinMatch", dto) as Promise<GalaChainResponse<TicTacMatch>>;
    },

    SetMatchState(dto: MatchDto) {
      return client.submitTransaction("SetMatchState", dto) as Promise<GalaChainResponse<TicTacMatch>>;
    },

    SetMatchMetadata(dto: MatchDto) {
      return client.submitTransaction("SetMatchMetadata", dto) as Promise<GalaChainResponse<MatchDto>>;
    },

    FetchMatch(dto: FetchMatchDto) {
      return client.evaluateTransaction("FetchMatch", dto) as Promise<GalaChainResponse<MatchDto>>;
    },

    FetchMatches(dto: FetchMatchesDto) {
      return client.evaluateTransaction("FetchMatches", dto) as Promise<
        GalaChainResponse<FetchMatchesResDto>
      >;
    }
  };
}

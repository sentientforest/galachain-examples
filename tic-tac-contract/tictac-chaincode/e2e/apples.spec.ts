/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { GalaChainResponse, GalaChainResponseType, randomUniqueKey } from "@gala-chain/api";
import { ChainClient, ChainUser, CommonContractAPI, commonContractAPI } from "@gala-chain/client";
import { AdminChainClients, TestClients, transactionErrorKey, transactionSuccess } from "@gala-chain/test";
import { afterAll, beforeAll, describe, expect, jest, test } from "@jest/globals";

import {
  AppleTree,
  AppleTreeDto,
  FetchTreesDto,
  PagedTreesDto,
  PickAppleDto,
  PlantAppleTreesDto,
  Variety
} from "../src/apples";
import { PlantAppleTreeDto } from "../src/apples/dtos";

jest.setTimeout(30000);

describe("Apple trees", () => {
  const appleContractConfig = {
    apples: {
      channel: "product-channel",
      chaincode: "basic-product",
      contract: "AppleContract",
      api: appleContractAPI
    }
  };
  let client: AdminChainClients<typeof appleContractConfig>;
  let user: ChainUser;

  beforeAll(async () => {
    client = await TestClients.createForAdmin(appleContractConfig);
    user = await client.createRegisteredUser();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  test("Plant a bunch of trees", async () => {
    // Given
    const dto = new PlantAppleTreesDto(
      [
        new AppleTreeDto(Variety.GALA, 1),
        new AppleTreeDto(Variety.GOLDEN_DELICIOUS, 2),
        new AppleTreeDto(Variety.GALA, 3)
      ],
      randomUniqueKey()
    ).signed(user.privateKey);

    // When
    const response = await client.apples.PlantTrees(dto);

    // Then
    expect(response).toEqual(transactionSuccess());
  });

  test("Fetch GALA trees planted by a user", async () => {
    // Given
    const dto = new FetchTreesDto(user.identityKey, Variety.GALA).signed(user.privateKey);

    // When
    const response = await client.apples.FetchTrees(dto);

    // Then
    expect(response).toEqual(
      transactionSuccess({
        trees: [
          expect.objectContaining({ plantedBy: user.identityKey, variety: Variety.GALA, index: 1 }),
          expect.objectContaining({ plantedBy: user.identityKey, variety: Variety.GALA, index: 3 })
        ],
        bookmark: ""
      })
    );
  });

  test("Fail to pick a GOLDEN_DELICIOUS apple because tree is too young", async () => {
    // Given
    const dto = new PickAppleDto(user.identityKey, Variety.GOLDEN_DELICIOUS, 2, randomUniqueKey()).signed(
      user.privateKey
    );

    // When
    const response = await client.apples.PickApple(dto);

    // Then
    expect(response).toEqual(transactionErrorKey("NO_APPLES_LEFT"));
  });

  test("Support Dry Run operations", async () => {
    // Given
    const dto = new PlantAppleTreeDto(Variety.HONEYCRISP, 10, randomUniqueKey());
    const saved = new AppleTree(user.identityKey, Variety.HONEYCRISP, 10, new Date().getTime());

    // When
    const response = await client.apples.DryRun("PlantTree", user.publicKey, dto);

    // Then
    expect(response).toEqual(
      transactionSuccess({
        response: { Status: GalaChainResponseType.Success },
        reads: {},
        writes: {
          [saved.getCompositeKey()]: expect.any(String),
          [`\u0000UNTX\u0000${dto.uniqueKey}\u0000`]: expect.any(String)
        },
        deletes: {}
      })
    );
  });
});

interface AppleContractAPI {
  PlantTree(dto: AppleTreeDto): Promise<GalaChainResponse<void>>;
  PlantTrees(dto: PlantAppleTreesDto): Promise<GalaChainResponse<void>>;
  FetchTrees(dto: FetchTreesDto): Promise<GalaChainResponse<PagedTreesDto>>;
  PickApple(dto: PickAppleDto): Promise<GalaChainResponse<void>>;
}

function appleContractAPI(client: ChainClient): AppleContractAPI & CommonContractAPI {
  return {
    ...commonContractAPI(client),

    PlantTree(dto: PlantAppleTreeDto) {
      return client.submitTransaction("PlantTree", dto) as Promise<GalaChainResponse<void>>;
    },

    PlantTrees(dto: PlantAppleTreesDto) {
      return client.submitTransaction("PlantTrees", dto) as Promise<GalaChainResponse<void>>;
    },

    FetchTrees(dto: FetchTreesDto) {
      return client.evaluateTransaction("FetchTrees", dto) as Promise<GalaChainResponse<PagedTreesDto>>;
    },

    PickApple(dto: PickAppleDto) {
      return client.submitTransaction("PickApple", dto) as Promise<GalaChainResponse<void>>;
    }
  };
}

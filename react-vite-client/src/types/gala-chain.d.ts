declare module "@gala-chain/connect" {
  export class BrowserConnectClient {
    galaChainAddress: string;
    constructor();
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    sign(data: unknown): Promise<string>;
    getPublicKey(): Promise<{ publicKey: string }>;
  }
}

declare module "@gala-chain/api" {
  export interface TokenInstanceKey {
    collection: string;
    category: string;
    type: string;
    additionalKey: string;
    instance: string;
  }

  export interface TokenInstance {
    tokenInstanceKey: TokenInstanceKey;
    quantity: string;
  }

  export interface BurnTokensDto {
    owner: string;
    tokenInstances: TokenInstance[];
    uniqueKey: string;
  }
}

import { RouteFn } from '@adonisjs/core/types/http'
import fs from "node:fs"
import { HttpContext, Request, Response } from '@adonisjs/core/http'
import env from '#start/env'
import { createValidDTO, createValidSubmitDTO, RegisterEthUserDto } from '@gala-chain/api'

import {
  GalaChainResponse,
  GetMyProfileDto,
  RegisterUserDto,
  UserProfile,
  randomUniqueKey,
  signatures
} from "@gala-chain/api";
import {
  // ChainClient,
  ChainUser,
  // ContractConfig,
  // HFClientConfig,
  // PublicKeyContractAPI,
  // RestApiClientConfig,
  // gcclient,
  // publicKeyContractAPI
} from "@gala-chain/client";
import * as path from "path";
import process from "process";


export default class IdentitiesController {
  private adminPrivateKeyString: string | undefined = env.get('CHAIN_ADMIN_SECRET_KEY')

  private getAdminPrivateKey() {
    if (!this.adminPrivateKeyString) {
      this.adminPrivateKeyString = fs
        .readFileSync(env.get('CHAIN_ADMIN_SECRET_KEY_PATH'))
        .toString();
    }
  
    return this.adminPrivateKeyString;
  }

  public health(ctx: HttpContext) {
    return ctx.response.send("OK");
  }

  public config(ctx: HttpContext) {
    const adminPrivateKeyString = this.getAdminPrivateKey();

    ctx.response.send({
      adminKeyAvailable: !!adminPrivateKeyString,
      chainApi: env.get('CHAIN_API'),
      channel: env.get('PRODUCT_CHANNEL')
    })
  }

  public async registerRandomEthUser(ctx: HttpContext) {
    const { request, response } = ctx
  
    const adminPrivateKeyString = this.getAdminPrivateKey();

    const apiBase = env.get('CHAIN_API')
    const channel = env.get('PRODUCT_CHANNEL') ?? 'product'
    const url = `${apiBase}/api/${channel}/PublicKeyContract/RegisterEthUser`
  
    const newUser = ChainUser.withRandomKeys();
  
    const dto = new RegisterEthUserDto();
    dto.publicKey = newUser.publicKey;
    dto.uniqueKey = randomUniqueKey();
    dto.sign(adminPrivateKeyString, false);
  
    const chainRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto.serialize()
    });
  
    if (!chainRes.ok) {
      return response.status(500).send({
        url: url,
        status: chainRes.status,
        body: chainRes.body,
        dto: dto.serialize(),
        user: newUser
      });
    }
  
    response.json({
      response: chainRes.json(),
      user: newUser
    });
  }

  public async registerEthUser(ctx: HttpContext) {
    const { request, response } = ctx
  
    const adminPrivateKeyString = this.getAdminPrivateKey();

    const apiBase = env.get('CHAIN_API')
    const channel = env.get('PRODUCT_CHANNEL') ?? 'product'
    const url = `${apiBase}/api/${channel}/PublicKeyContract/RegisterEthUser`
  
    console.log(request.headers())
  
    const requestBody = request.body();
  
    if (!requestBody || typeof requestBody.publicKey !== "string") {
      return response.status(400).send("Bad Request\n");
    }
  
    const dto = await createValidSubmitDTO(RegisterEthUserDto, {
      publicKey: requestBody.publicKey,
      uniqueKey: randomUniqueKey()
    });
  
    dto.sign(adminPrivateKeyString, false);
  
    const chainRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto.serialize()
    });
  
    if (!chainRes.ok) {
      return response.status(500).send({
        url: url,
        status: chainRes.status,
        body: chainRes.body,
        dto: dto.serialize(),
      });
    }
  
    response.json(dto.serialize());
  }
}
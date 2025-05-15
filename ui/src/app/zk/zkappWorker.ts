
import { Mina, PublicKey, fetchAccount } from 'o1js';
import * as Comlink from "comlink";


import { LiquidityRatioVerifierSmartContract } from '@contracts/build/src/StablecoinProofOfReservesRiskVerifierSmartContract';

import { LiquidityRatioZkprogram } from '@contracts/build/src/StablecoinProofOfReservesRiskZKProgramWithSign';
import { initializeOracles } from '@contracts/build/src/config/oracleKeys';
type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

const state = {
  AppInstance: null as null | typeof LiquidityRatioVerifierSmartContract,
  zkappInstance: null as null | LiquidityRatioVerifierSmartContract,
  transaction: null as null | Transaction,
};
initializeOracles();

export const api = {
  async setActiveInstanceToDevnet() {
    const Network = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
    console.log('Devnet network instance configured');
    Mina.setActiveInstance(Network);
  },
  async loadContract() {
    const { LiquidityRatioVerifierSmartContract } = await import('@contracts/build/src/StablecoinProofOfReservesRiskVerifierSmartContract.js');
    state.AppInstance = LiquidityRatioVerifierSmartContract;
  },
  async compileContract() {
    const { verificationKey } = await LiquidityRatioZkprogram.compile();
    console.log("Verification key:", verificationKey.toString());
    await state.AppInstance!.compile();
  },
  async fetchAccount(publicKey58: string) {
    const publicKey = PublicKey.fromBase58(publicKey58);
    console.log("Fetching account for public key:", publicKey.toString());
    return fetchAccount({ publicKey });
  },
  async initZkappInstance(publicKey58: string) {
    // const publicKey = PublicKey.fromBase58(publicKey58);
    // state.zkappInstance = new state.AppInstance!(publicKey);
  },
  async getNum() {
    // const currentNum = await state.zkappInstance!.num.get();
    // return JSON.stringify(currentNum.toJSON());
  },
  async createUpdateTransaction() {
    console.log("Fetching compliance data...");
  },
  async proveUpdateTransaction() {
    await state.transaction!.prove();
  },
  async getTransactionJSON() {
    return state.transaction!.toJSON();
  },
  async sign() {
    return state.transaction?.send();
  }
};

// Expose the API to be used by the main thread
Comlink.expose(api);
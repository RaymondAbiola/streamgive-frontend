import { Client } from '@stellar/stellar-sdk/contract';

import type { WalletSignTransaction } from '@/components/wallet/WalletProvider';
import type { NgoRegistryMethods } from './contractTypes';

import { NETWORK_PASSPHRASE, NGO_REGISTRY_CONTRACT_ID, SOROBAN_RPC_URL } from './stellar';

export async function getNgoRegistryClient(
  publicKey: string,
  signTransaction: WalletSignTransaction,
) {
  if (!NGO_REGISTRY_CONTRACT_ID) {
    throw new Error('NEXT_PUBLIC_NGO_REGISTRY_CONTRACT_ID is not set');
  }

  const client = await Client.from({
    contractId: NGO_REGISTRY_CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: SOROBAN_RPC_URL,
    publicKey,
    signTransaction,
  });

  return client as Client & NgoRegistryMethods;
}

import type { AssembledTransaction } from '@stellar/stellar-sdk/contract';

/**
 * Hand-written method signatures for our two deployed Soroban contracts.
 *
 * `Client.from()` builds its methods at runtime from the contract spec it
 * fetches off the network, so TypeScript only ever sees the bare `Client`
 * base class — every contract call reads as a missing property and the
 * argument shapes go unchecked. The usual fix is generated bindings
 * (`stellar contract bindings typescript`), but that needs a deployed
 * contract id to point at, which we don't have until the testnet deploy
 * lands. These mirror the contracts' public functions in the meantime.
 *
 * Keep them in step with the contract crates' src/lib.rs in streamgive-contracts;
 * a drift here is only caught at runtime, as a failed transaction.
 */
export type DonationVaultMethods = {
  /** Returns the new stream's id. */
  create_stream(args: {
    donor: string;
    ngo: string;
    token: string;
    deposit: bigint;
    rate: bigint;
  }): Promise<AssembledTransaction<bigint>>;

  top_up(args: { stream_id: bigint; amount: bigint }): Promise<AssembledTransaction<null>>;

  cancel_stream(args: { stream_id: bigint }): Promise<AssembledTransaction<null>>;

  modify_rate(args: { stream_id: bigint; new_rate: bigint }): Promise<AssembledTransaction<null>>;

  withdraw(args: { stream_id: bigint }): Promise<AssembledTransaction<null>>;
};

export type NgoRegistryMethods = {
  approve_ngo(args: { ngo_owner: string }): Promise<AssembledTransaction<null>>;
};

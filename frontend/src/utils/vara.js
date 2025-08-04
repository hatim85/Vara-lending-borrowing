// utils/actorId.js

import {
  decodeAddress,
  encodeAddress,
  cryptoWaitReady
} from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

/**
 * Converts a Substrate SS58-formatted address into:
 * - hexActorId: lowercase hex string prefixed with 0x (your contract's actor identifier)
 * - varaAddress: SS58 address encoded with Vara's network prefix (default 137, per Vara docs)
 *
 * @param {string} substrateAddress - a "5..." style SS58 address from Polkadot.js extension
 * @param {number} varaPrefix - default SS58 prefix for Vara network (137)
 * @returns Promise<{ hexActorId: string, varaAddress: string }>
 */
export async function toVaraAddress(
  substrateAddress,
  varaPrefix = 137
) {
  await cryptoWaitReady(); // ensure underlying WASM crypto is initialized

  // Step 1: decodeSubstrate
  const publicKey_u8 = decodeAddress(substrateAddress);

  // Step 2: convert to hex actorId (32-byte Blake2-256 public key)
  const hexActorId = u8aToHex(publicKey_u8).toLowerCase();

  // Step 3: re-encode to SS58 format with Vara's prefix
  const varaAddress = encodeAddress(publicKey_u8, varaPrefix);

  return (
    varaAddress
  );
}

// Example usage:
// (async () => {
//   const addr = '5CFRWvagxVavCy3ingtCEeUvzoEWoX9X4KVzWh2Egy2a7Yi7';
//   const { hexActorId, varaAddress } = await toActorIdAndVaraAddress(addr);
//   console.log('hex actorId:', hexActorId);
//   console.log('Vara-format address:', varaAddress);
// })();

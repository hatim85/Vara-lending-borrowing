// src/utils/actorId.js

import { decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

/**
 * Converts Polkadot SS58-format address string to hex-format actor ID.
 * @param {string} address - Polkadot/SS58 address (e.g. "5Grwva...").
 * @returns {string} Hex string representing ActorId in contract calls.
 */
export function ss58ToActorId(address) {
  if (!address || typeof address !== 'string') {
    throw new TypeError(`ss58ToActorId expected a string, got ${typeof address}`);
  }
  const u8a = decodeAddress(address);
  return u8aToHex(u8a);
}

// src/utils/constants.js

/**
 * Decimal precision constants matching contract logic.
 *
 * TVARA_UNIT = 10^12 base units per TVARA token.
 * WAD        = 10^18 base units for price/oracles in USD.
 */
export const TVARA_UNIT = 10n ** 12n;
export const WAD = 10n ** 18n;

/**
 * Interest shares as per contract:
 * LENDER_INTEREST_SHARE = 4%
 * TREASURY_INTEREST_SHARE = 2%
 * TOTAL_INTEREST_SHARE_PERCENT = 6%
 */
export const LENDER_INTEREST_SHARE = 4n;
export const TREASURY_INTEREST_SHARE = 2n;

/**
 * Annual interest rate parameters (in WAD):
 * Base rate = 6% per year; Max = 10%; optimal utilization = 80%
 */
export const BASE_RATE = (6n * WAD) / 100n;
export const MAX_RATE = (10n * WAD) / 100n;
export const OPT_UTIL = (8n * WAD) / 10n;   // 80%
export const PERCENT100 = 100n;            // for fraction math

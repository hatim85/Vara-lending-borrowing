import { ActorId } from 'sails-js';

declare global {
  export interface UserInfo {
    collateral: number | string | bigint;
    debt: number | string | bigint;
    lender_balance: number | string | bigint;
    tvara_price: number | string | bigint;
    health_factor: number | string | bigint;
    accrued_interest: number | string | bigint;
    lender_interest_earned: number | string | bigint;
  }

  export interface CollateralDeposited {
    user: ActorId;
    amount: number | string | bigint;
  }

  export interface Borrowed {
    user: ActorId;
    amount: number | string | bigint;
  }

  export interface Repaid {
    user: ActorId;
    amount: number | string | bigint;
    collateral_to_return: number | string | bigint;
    interest_deducted: number | string | bigint;
    debt_fully_paid: boolean;
  }

  export interface Liquidated {
    user: ActorId;
    collateral_sold: number | string | bigint;
    debt_cleared: number | string | bigint;
  }

  export interface LiquidityProvided {
    lender: ActorId;
    amount: number | string | bigint;
  }

  export interface LiquidityWithdrawn {
    lender: ActorId;
    amount: number | string | bigint;
  }

  export interface InterestClaimed {
    lender: ActorId;
    amount: number | string | bigint;
  }
};
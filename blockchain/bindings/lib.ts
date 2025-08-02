import { GearApi, Program, HexString, decodeAddress } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types';
import { TransactionBuilder, ActorId, throwOnErrorReply, getServiceNamePrefix, getFnNamePrefix, ZERO_ADDRESS } from 'sails-js';

export class SailsProgram {
  public readonly registry: TypeRegistry;
  public readonly lendingService: LendingService;
  private _program: Program;

  constructor(public api: GearApi, programId?: `0x${string}`) {
    const types: Record<string, any> = {
      UserInfo: {"collateral":"u128","debt":"u128","lender_balance":"u128","tvara_price":"u128","health_factor":"u128","accrued_interest":"u128","lender_interest_earned":"u128"},
      CollateralDeposited: {"user":"[u8;32]","amount":"u128"},
      Borrowed: {"user":"[u8;32]","amount":"u128"},
      Repaid: {"user":"[u8;32]","amount":"u128","collateral_to_return":"u128","interest_deducted":"u128","debt_fully_paid":"bool"},
      Liquidated: {"user":"[u8;32]","collateral_sold":"u128","debt_cleared":"u128"},
      LiquidityProvided: {"lender":"[u8;32]","amount":"u128"},
      LiquidityWithdrawn: {"lender":"[u8;32]","amount":"u128"},
      InterestClaimed: {"lender":"[u8;32]","amount":"u128"},
    }

    this.registry = new TypeRegistry();
    this.registry.setKnownTypes({ types });
    this.registry.register(types);
    if (programId) {
      this._program = new Program(programId, api);
    }

    this.lendingService = new LendingService(this);
  }

  public get programId(): `0x${string}` {
    if (!this._program) throw new Error(`Program ID is not set`);
    return this._program.id;
  }

  newCtorFromCode(code: Uint8Array | Buffer | HexString, vft_address: ActorId): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'upload_program',
      ['New', vft_address],
      '(String, [u8;32])',
      'String',
      code,
      async (programId) =>  {
        this._program = await Program.new(programId, this.api);
      }
    );
    return builder;
  }

  newCtorFromCodeId(codeId: `0x${string}`, vft_address: ActorId) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'create_program',
      ['New', vft_address],
      '(String, [u8;32])',
      'String',
      codeId,
      async (programId) =>  {
        this._program = await Program.new(programId, this.api);
      }
    );
    return builder;
  }
}

export class LendingService {
  constructor(private _program: SailsProgram) {}

  public adminWithdrawFunds(amount_tvara: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'AdminWithdrawFunds', amount_tvara],
      '(String, String, u128)',
      'Null',
      this._program.programId
    );
  }

  public adminWithdrawTreasury(amount_tvara: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'AdminWithdrawTreasury', amount_tvara],
      '(String, String, u128)',
      'Null',
      this._program.programId
    );
  }

  public borrow(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'Borrow'],
      '(String, String)',
      'Null',
      this._program.programId
    );
  }

  public claimInterest(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'ClaimInterest'],
      '(String, String)',
      'Null',
      this._program.programId
    );
  }

  public depositCollateral(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'DepositCollateral'],
      '(String, String)',
      'Null',
      this._program.programId
    );
  }

  public lend(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'Lend'],
      '(String, String)',
      'Null',
      this._program.programId
    );
  }

  public liquidate(user: ActorId): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'Liquidate', user],
      '(String, String, [u8;32])',
      'Null',
      this._program.programId
    );
  }

  public pause(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'Pause'],
      '(String, String)',
      'Null',
      this._program.programId
    );
  }

  public repay(user: ActorId, amount: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'Repay', user, amount],
      '(String, String, [u8;32], u128)',
      'Null',
      this._program.programId
    );
  }

  public resume(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'Resume'],
      '(String, String)',
      'Null',
      this._program.programId
    );
  }

  public updateTvaraPrice(new_price: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'UpdateTvaraPrice', new_price],
      '(String, String, u128)',
      'Null',
      this._program.programId
    );
  }

  public withdraw(amount: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'Withdraw', amount],
      '(String, String, u128)',
      'Null',
      this._program.programId
    );
  }

  public withdrawCollateral(user: ActorId, amount: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['LendingService', 'WithdrawCollateral', user, amount],
      '(String, String, [u8;32], u128)',
      'Null',
      this._program.programId
    );
  }

  public async getAdmin(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ActorId> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'GetAdmin']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, [u8;32])', reply.payload);
    return result[2].toJSON() as unknown as ActorId;
  }

  public async getAllBorrowersInfo(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Record<ActorId, UserInfo>> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'GetAllBorrowersInfo']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, BTreeMap<[u8;32], UserInfo>)', reply.payload);
    return result[2].toJSON() as unknown as Record<ActorId, UserInfo>;
  }

  public async getBorrowRatePerYear(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'GetBorrowRatePerYear']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getCollateral(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetCollateral', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getDebt(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetDebt', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getHealthFactor(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetHealthFactor', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getLastAccrualTs(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'GetLastAccrualTs']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u64)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getLenderBalance(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetLenderBalance', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getLenderEarnedInterest(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetLenderEarnedInterest', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getLenderInterestEarned(lender: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetLenderInterestEarned', lender]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getLiquidity(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'GetLiquidity']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getTotalOutstandingDebt(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetTotalOutstandingDebt', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getTotalPrincipalBorrowed(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'GetTotalPrincipalBorrowed']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getTreasuryBalance(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'GetTreasuryBalance']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getTvaraPrice(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'GetTvaraPrice']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getUserAccruedInterest(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetUserAccruedInterest', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getUserInfo(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<UserInfo> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetUserInfo', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, UserInfo)', reply.payload);
    return result[2].toJSON() as unknown as UserInfo;
  }

  public async getUserPosition(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<[number | string | bigint, number | string | bigint, number | string | bigint, number | string | bigint]> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['LendingService', 'GetUserPosition', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, (u128, u128, u128, u128))', reply.payload);
    return result[2].toJSON() as unknown as [number | string | bigint, number | string | bigint, number | string | bigint, number | string | bigint];
  }

  public async getUtilizationRate(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'GetUtilizationRate']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async isPaused(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<boolean> {
    const payload = this._program.registry.createType('(String, String)', ['LendingService', 'IsPaused']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, bool)', reply.payload);
    return result[2].toJSON() as unknown as boolean;
  }

  public subscribeToCollateralDepositedEvent(callback: (data: CollateralDeposited) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'LendingService' && getFnNamePrefix(payload) === 'CollateralDeposited') {
        callback(this._program.registry.createType('(String, String, CollateralDeposited)', message.payload)[2].toJSON() as unknown as CollateralDeposited);
      }
    });
  }

  public subscribeToBorrowedEvent(callback: (data: Borrowed) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'LendingService' && getFnNamePrefix(payload) === 'Borrowed') {
        callback(this._program.registry.createType('(String, String, Borrowed)', message.payload)[2].toJSON() as unknown as Borrowed);
      }
    });
  }

  public subscribeToRepaidEvent(callback: (data: Repaid) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'LendingService' && getFnNamePrefix(payload) === 'Repaid') {
        callback(this._program.registry.createType('(String, String, Repaid)', message.payload)[2].toJSON() as unknown as Repaid);
      }
    });
  }

  public subscribeToLiquidatedEvent(callback: (data: Liquidated) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'LendingService' && getFnNamePrefix(payload) === 'Liquidated') {
        callback(this._program.registry.createType('(String, String, Liquidated)', message.payload)[2].toJSON() as unknown as Liquidated);
      }
    });
  }

  public subscribeToLiquidityProvidedEvent(callback: (data: LiquidityProvided) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'LendingService' && getFnNamePrefix(payload) === 'LiquidityProvided') {
        callback(this._program.registry.createType('(String, String, LiquidityProvided)', message.payload)[2].toJSON() as unknown as LiquidityProvided);
      }
    });
  }

  public subscribeToLiquidityWithdrawnEvent(callback: (data: LiquidityWithdrawn) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'LendingService' && getFnNamePrefix(payload) === 'LiquidityWithdrawn') {
        callback(this._program.registry.createType('(String, String, LiquidityWithdrawn)', message.payload)[2].toJSON() as unknown as LiquidityWithdrawn);
      }
    });
  }

  public subscribeToInterestClaimedEvent(callback: (data: InterestClaimed) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'LendingService' && getFnNamePrefix(payload) === 'InterestClaimed') {
        callback(this._program.registry.createType('(String, String, InterestClaimed)', message.payload)[2].toJSON() as unknown as InterestClaimed);
      }
    });
  }
}
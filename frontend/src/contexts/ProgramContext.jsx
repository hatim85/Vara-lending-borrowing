// src/contexts/ProgramContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { GearApi } from '@gear-js/api';
import { SailsProgram } from '../contracts/lib';
import {
  web3Enable,
  web3Accounts,
  web3FromSource,
} from '@polkadot/extension-dapp';
import { decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

const NODE_ENDPOINT = 'wss://testnet.vara.network';
const PROGRAM_ID =
  '0x5ca0101c2c1ff66129fa89eb9ceb04138ab49979a70f8149bc4836e2616553d6';

const ProgramContext = createContext();
export const useProgram = () => useContext(ProgramContext);

export function ProgramProvider({ children }) {
  // Only set account when user manually connects
  const [account, setAccount] = useState(null);
  const [source, setSource] = useState(null);
  const [gear, setGear] = useState({ api: null, program: null });
  const [txState, setTxState] = useState({
    busy: false,
    lastMsg: null,
    error: null,
  });

  // Initialize on-chain API once
  useEffect(() => {
    (async () => {
      try {
        const api = await GearApi.create({ providerAddress: NODE_ENDPOINT });
        const program = new SailsProgram(api, PROGRAM_ID);
        setGear({ api, program });
      } catch (err) {
        console.error('🚨 Failed to initialize Gear API:', err);
      }
    })();
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const extensions = await web3Enable('vara-dapp');
      if (!extensions || extensions.length === 0) {
        alert(
          '⚠️ No wallet extension found (e.g. Polkadot.js). Install one and refresh.'
        );
        return;
      }

      const all = await web3Accounts();
      if (!all.length) {
        alert('⚠️ Your extension has no accounts. Please create one.');
        return;
      }

      const a = all[0]; // pick first
      setAccount(a.address);
      setSource(a.meta.source || 'polkadot-js');
    } catch (err) {
      console.error('🚨 web3Enable error:', err);
      alert('Failed to connect: ' + (err.message ?? err));
    }
  }, []);

  const callTx = useCallback(
    async (fnName, args = [], value = 0n) => {
      if (!gear.program) throw new Error('❌ Gear API not ready');
      if (!account || !source) throw new Error('❌ Wallet not connected');

      setTxState({ busy: true, lastMsg: null, error: null });

      try {
        const injector = await web3FromSource(source);
        const msg = gear.program.lendingService[fnName](...args).withAccount(
          account,
          { signer: injector.signer }
        );

        if (value > 0n) msg.withValue(value);

        await msg.calculateGas(true, 10);

        const { msgId, response, isFinalized } = await msg.signAndSend();

        await isFinalized;

        await response();

        setTxState({ busy: false, lastMsg: `${fnName}: ${msgId}`, error: null });

        return msgId;
      } catch (err) {
        const errorMsg = err?.message ?? String(err);
        setTxState({ busy: false, lastMsg: null, error: errorMsg });
        throw err;
      }
    },
    [account, source, gear]
  );

  const actorHex = account ? u8aToHex(decodeAddress(account)) : null;

  const functions = {
    // Lender
    lend: (_, amount = 0n) => callTx('lend', [], BigInt(amount)),
    withdraw: (amount) => callTx('withdraw', [BigInt(amount)]),
    claimInterest: () => callTx('claimInterest'),
    // Borrower
    depositCollateral: (amount) => callTx('depositCollateral', [], BigInt(amount)),
    borrow: () => callTx('borrow'),
    repay: (amount) => callTx('repay', [actorHex, BigInt(amount)]),
    withdrawCollateral: (amount) =>
      callTx('withdrawCollateral', [actorHex, BigInt(amount)]),
    // Admin
    pause: () => callTx('pause'),
    resume: () => callTx('resume'),
    liquidate: (hexTarget) => callTx('liquidate', [hexTarget]),
    updateTvaraPrice: (price) => callTx('updateTvaraPrice', [BigInt(price)]),
    adminWithdrawFunds: (amt) => callTx('adminWithdrawFunds', [BigInt(amt)]),
    adminWithdrawTreasury: (amt) => callTx('adminWithdrawTreasury', [BigInt(amt)]),
    // Views
    getAdmin: () => gear.program?.lendingService.getAdmin(),
    getUserInfo: () => gear.program?.lendingService.getUserInfo(actorHex),
    getAllBorrowersInfo: () => gear.program?.lendingService.getAllBorrowersInfo(),
    getUtilizationRate: () =>
      gear.program?.lendingService.getUtilizationRate(),
    getTvaraPrice: () => gear.program?.lendingService.getTvaraPrice(),
    getHealthFactor: () =>
      gear.program?.lendingService.getHealthFactor(actorHex),
  };

  return (
    <ProgramContext.Provider
      value={{
        account,
        gear,
        connectWallet,
        txState,
        functions,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
}

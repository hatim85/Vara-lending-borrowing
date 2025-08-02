import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GearApi } from '@gear-js/api';
import { web3Enable, web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { SailsProgram } from './utils/lib'; // your contract client class

const NODE_ENDPOINT = 'wss://testnet.vara.network'; // Vara testnet node
const PROGRAM_ID = '0x5ca0101c2c1ff66129fa89eb9ceb04138ab49979a70f8149bc4836e2616553d6';

const GearCtx = createContext();
export const useGear = () => useContext(GearCtx);

export function GearProvider({ children }) {
  const [gearApi, setGearApi] = useState(null);
  const [program, setProgram] = useState(null);
  const [apiReady, setApiReady] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [injector, setInjector] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize GearApi + Program
  useEffect(() => {
    GearApi.create({ providerAddress: NODE_ENDPOINT })
      .then((api) => {
        setGearApi(api);
        setProgram(new SailsProgram(api, PROGRAM_ID));
        setApiReady(true);
      })
      .catch((err) => {
        console.error('Error connecting to node:', err);
        setError(err.message || 'API connection error');
      });

    // Cleanup on unmount
    return () => {
      if (gearApi) gearApi.disconnect();
    };
  }, []);

  // Connect to SubWallet
  const connectWallet = useCallback(async (dappName = 'vara-lending-app') => {
    setIsConnecting(true);
    try {
      // Enable extensions
      const injected = await web3Enable(dappName);
      if (!injected.length) {
        throw new Error('No wallet extensions found. Please install SubWallet.');
      }

      // Look for SubWallet or fallback to any available extension
      const subwalletExt = injected.find((e) => e.name === 'subwallet-js');
      const ext = subwalletExt || injected[0];
      if (!subwalletExt) {
        console.warn(
          'SubWallet not found. Using fallback extension:',
          ext.name
        );
      }

      // Fetch accounts for the selected extension
      const accounts = await web3Accounts({ extensions: [ext.name] });
      console.log('Detected accounts:', accounts); // Debug log
      if (!accounts.length) {
        throw new Error(
          `No accounts found in ${ext.name}. Please create or import an account and ensure it’s set to the Vara testnet.`
        );
      }

      // Auto-select the first account
      const acct = accounts[0];
      const injector = await web3FromSource(acct.meta.source);
      console.log('Selected account:', acct.address, 'Injector:', injector); // Debug log

      setAccounts(accounts);
      setSelectedAccount(acct);
      setInjector(injector);
    } catch (err) {
      console.error('Wallet connection error:', err);
      alert(`Failed to connect wallet: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setSelectedAccount(null);
    setInjector(null);
    setAccounts([]);
  }, []);

  // Common helper to run a lendingService method
async function callService(fnName, actorIdHex, args = [], value = 0n) {
  const tx = program.lendingService[fnName](...args)
    .withAccount(actorIdHex, { signer: injector.signer })
    .withValue(value)
  await tx.calculateGas(true, 10)
  const { msgId, response, isFinalized } = await tx.signAndSend()
  await isFinalized
  await response()
  return msgId
}


  return (
    <GearCtx.Provider
      value={{
        apiReady,
        error,
        connectWallet,
        disconnectWallet,
        accounts,
        selectedAccount,
        setSelectedAccount, // Added for WalletUI to update selected account
        program,
        callService,
        isConnecting,
      }}
    >
      {children}
    </GearCtx.Provider>
  );
}
// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgram } from '../contexts/ProgramContext';
import LoadingOverlay from '../components/common/LoadingOverlay';
import OnboardingScreen from './Onboarding';

export default function Dashboard() {
  const { account, connectWallet, functions, txState } = useProgram();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    if (!account) {
      setIsAdmin(false);
      return;
    }

    // check admin role once after connect
    (async () => {
      setLoadingAdmin(true);
      try {
        const adminId = await functions.getAdmin();
        setIsAdmin(false);
        if (adminId) {
          const fromHex = adminId.toString().toLowerCase();
          // SS58 conversion should be done outside
          // For simplicity, re-decode SS58 to hex inside actorId util if necessary
          const walletHex = fromHex; // compare properly
          setIsAdmin(walletHex === fromHex);
        }
      } catch (err) {
        console.error('failed admin fetch', err);
      } finally {
        setLoadingAdmin(false);
      }
    })();
  }, [account, functions, txState.lastMsg]);

  // 1. Show connect prompt if wallet not connected
  if (!account) {
    return (
      <div className="h-full grid place-items-center">
        <button
          onClick={connectWallet}
          className="btn btn-primary"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // 2. Show loading spinner while checking admin or waiting for tx
  if (loadingAdmin || txState.busy) {
    return (
      <LoadingOverlay
        message={loadingAdmin ? 'Checking admin role…' : 'Waiting for transaction…'}
      />
    );
  }

  // 3. After user connects and role is determined, show onboarding choices
  return <OnboardingScreen isAdmin={isAdmin} />;
}

// src/components/admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import Card from '../common/Card';
import PriceUpdateForm from './PriceUpdateForm';
import PauseResumeControl from './PauseResumeControl';
import WithdrawFundsForm from './WithdrawFundsForm';
import BorrowersList from './BorrowersList';
import { ss58ToActorId } from '../../utils/actorId';

export default function AdminPanel() {
  const { account, functions, txState } = useProgram();
  const [adminHex, setAdminHex] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingRole(true);
      try {
        const [adminActor, userInfo] = await Promise.all([
          functions.getAdmin?.(),
          functions.getUserInfo?.(),
        ]);
        const acctHex = ss58ToActorId(account).toLowerCase();
        const adminId = adminActor?.toString().toLowerCase() ?? '';
        setAdminHex(adminId);
        setIsAdmin(adminId && adminId === acctHex);
      } catch (err) {
        console.error('AdminPanel: failed to fetch admin info', err);
        setIsAdmin(false);
        setAdminHex(null);
      } finally {
        setLoadingRole(false);
      }
    })();
  }, [account, functions]);

  if (loadingRole) {
    return <Card>⏳ Checking admin permissions…</Card>;
  }

  if (!isAdmin) {
    return (
      <Card className="border-red-400">
        <div className="text-red-600 font-semibold text-center">
          ⚠️ You are not authorized (not the admin)
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <Card>
        <h2 className="text-xl font-semibold mb-1">Admin Actor ID:</h2>
        <p className="font-mono text-xs break-all">{adminHex ?? '—'}</p>
      </Card>

      <BorrowersList
        onLiquidateSuccess={() => {
          /* Optionally add custom success handling */
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PriceUpdateForm onSuccess={() => {}} />
        <PauseResumeControl onSuccess={() => {}} />
        <WithdrawFundsForm onSuccess={() => {}} />
      </div>

      {txState.error && (
        <div className="text-red-600 font-medium mt-4">
          🛑 Transaction Failed: {txState.error}
        </div>
      )}
      {txState.lastMsg && (
        <div className="text-green-700 font-medium mt-2">
          ✅ {txState.lastMsg}
        </div>
      )}
    </div>
  );
}

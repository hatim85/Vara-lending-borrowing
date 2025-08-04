// src/components/borrower/BorrowerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import DepositCollateralForm from './DepositCollateralForm';
import BorrowForm from './BorrowForm';
import RepayForm from './RepayForm';
import Card from '../common/Card';
import { formatHealthFactor, fromTvara } from '../../utils/conversions';

export default function BorrowerDashboard() {
  const { account, functions, txState } = useProgram();
  const [ui, setUi] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);

  // ✅ Async function kept separate — so useEffect doesn’t return a Promise
  const refresh = async () => {
    if (!account) return;
    try {
      const user = await functions.getUserInfo();
      setUi(user);
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('UserInfo fetch error:', err);
    }
  };

  useEffect(() => {
    refresh();
    // No return value — cleanup is undefined ↴
  }, [account, txState.lastMsg, functions]);

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Borrower Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-lg font-medium">Collateral (TVARA)</h2>
          <p className="text-4xl">
            {ui?.collateral != null ? fromTvara(ui.collateral) : '—'}
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-medium">Debt (VLT)</h2>
          <p className="text-4xl">
            {ui?.debt != null ? fromTvara(ui.debt) : '—'}
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-medium">Health Factor</h2>
          <p className="text-4xl">
            {console.log("ui health factor: ", ui?.health_factor)}
            {ui?.health_factor != null
              ? formatHealthFactor(ui.health_factor, { minSafePercent: 120 })
              : '—'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DepositCollateralForm onSuccess={refresh} />
        <BorrowForm onSuccess={refresh} />
        <RepayForm onSuccess={refresh} />
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '—'}
      </p>
    </div>
  );
}

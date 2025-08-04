import React, { useState, useEffect } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import ProvideLiquidityForm from './ProvideLiquidityForm';
import WithdrawLiquidityForm from './WithdrawLiquidityForm';
import ClaimInterestForm from './ClaimInterestForm';
import Card from '../common/Card';
import { formatUtilization, fromTvara } from '../../utils/conversions';
import BorrowersTable from './BorrowersTable';

export default function LenderDashboard() {
  const { account, functions, txState } = useProgram();
  const [userInfo, setUserInfo] = useState(null);
  const [borrowers, setBorrowers] = useState({});
  const [util, setUtil] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);

  const refreshData = async () => {
    if (!account) return;
    try {
      const ui = await functions.getUserInfo();
      const br = await functions.getAllBorrowersInfo?.();
      const ur =
        (await functions.get_utilization_rate?.()) ??
        (await functions.getUtilizationRate?.());
      if (ui) setUserInfo(ui);
      if (br) setBorrowers(br);
      if (ur) setUtil(ur);
      setLastUpdate(Date.now());
    } catch (e) {
      console.error('Failed to load lender data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [account, txState.lastMsg]);

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Lender Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h2 className="text-lg font-medium">Your Liquidity</h2>
          <p className="text-5xl font-bold">{fromTvara(userInfo?.lender_balance) ?? '—'}</p>
        </Card>

        {/* <Card>
          <h2 className="text-lg font-medium">Earned Interest</h2>
          <p className="text-5xl font-bold">{fromTvara(userInfo?.lender_interest_earned) ?? '—'}</p>
        </Card> */}

        <Card>
          <h2 className="text-lg font-medium">Utilization Rate</h2>
          <p className="text-xl">{formatUtilization(util?.toString?.()) ?? '—'}</p>
        </Card>
      </div>

      <div className="space-y-6 md:grid md:grid-cols-3 md:gap-6">
        <ProvideLiquidityForm onSuccess={refreshData} />
        <WithdrawLiquidityForm onSuccess={refreshData} />
      </div>

      <Card>
        <h2 className="text-lg font-medium mb-2">All Borrowers Info</h2>
        <BorrowersTable borrowers={borrowers} />
      </Card>

      <p className="text-sm text-gray-500">
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </p>
    </div>
  );
}

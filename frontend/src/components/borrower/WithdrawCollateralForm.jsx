import React, { useState } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import { toTvara } from '../../utils/conversions';
import Button from '../common/Button';
import TxStatusAlert from '../common/TxStatusAlert';

export default function WithdrawCollateralForm({ onSuccess }) {
  const { functions, txState } = useProgram();
  const [amtInput, setAmtInput] = useState('');
  const [localErr, setLocalErr] = useState(null);

  const handle = async () => {
    setLocalErr(null);
    const n = parseFloat(amtInput);
    if (isNaN(n) || n <= 0) return setLocalErr('Enter a positive number');
    try {
      await functions.withdraw_collateral(toTvara(n));
      setAmtInput('');
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setLocalErr(err.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-2">
      <h3 className="text-lg font-semibold">Withdraw Collateral</h3>
      <input
        type="number"
        step="0.01"
        className="w-full px-3 py-2 border rounded focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
        placeholder="TVARA amount"
        value={amtInput}
        onChange={(e) => setAmtInput(e.target.value)}
      />
      {localErr && <p className="text-red-500 text-sm">{localErr}</p>}
      <Button onClick={handle} variant="secondary" loading={txState.busy} disabled={!functions.withdraw_collateral}>
        Withdraw
      </Button>
      <TxStatusAlert
        status={txState.lastMsg ? 'success' : txState.error ? 'error' : null}
        message={txState.lastMsg || txState.error}
      />
    </div>
  );
}

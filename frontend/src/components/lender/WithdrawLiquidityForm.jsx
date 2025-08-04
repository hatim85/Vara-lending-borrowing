// src/components/lender/WithdrawLiquidityForm.jsx
import React, { useState } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import { toTvara } from '../../utils/conversions';
import Button from '../common/Button';
import TxStatusAlert from '../common/TxStatusAlert';

export default function WithdrawLiquidityForm({ onSuccess }) {
  const { functions, txState } = useProgram();
  const [amountInput, setAmountInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleWithdraw = async () => {
    setErrorMsg('');
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Enter positive amount');
      return;
    }
    try {
      const bigintAmt = toTvara(amt);
      await functions.withdraw(bigintAmt);
      setAmountInput('');
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-md space-y-2">
      <h3 className="font-semibold text-lg">Withdraw Liquidity (Principal)</h3>
      <input
        type="number"
        className="w-full p-2 border rounded focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
        placeholder="Amount (e.g. 0.5 TVARA)"
        value={amountInput}
        onChange={(e) => setAmountInput(e.currentTarget.value)}
      />
      <Button
        onClick={handleWithdraw}
        variant="secondary"
        loading={txState.busy}
        disabled={!functions.withdraw}
      >
        Withdraw
      </Button>
      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
      <TxStatusAlert
        status={txState.lastMsg ? 'success' : txState.error ? 'error' : null}
        message={txState.lastMsg || txState.error}
      />
    </div>
  );
}

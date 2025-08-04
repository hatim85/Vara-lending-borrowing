// src/components/lender/ProvideLiquidityForm.jsx
import React, { useState } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import { toTvara } from '../../utils/conversions';
import Button from '../common/Button';
import TxStatusAlert from '../common/TxStatusAlert';

export default function ProvideLiquidityForm({ onSuccess }) {
  const { functions, txState } = useProgram();
  const [amountInput, setAmountInput] = useState('');
  const [localError, setLocalError] = useState('');

  const handleDeposit = async () => {
    setLocalError('');
    const amt = parseFloat(amountInput);
    console.log("amt", amt);
    if (isNaN(amt) || amt <= 0) {
      setLocalError('Enter a positive number');
      return;
    }
    try {
      const bigintAmt = toTvara(amt);
        console.log("bigintAmt", bigintAmt);
      await functions.lend(undefined, bigintAmt); // pass amount as value, not argument
      setAmountInput('');
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-md space-y-2">
      <h3 className="font-semibold text-lg">Provide Liquidity (Lender)</h3>
      <input
        type="number"
        className="w-full p-2 border rounded focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
        placeholder="Amount (e.g. 1.5 TVARA)"
        value={amountInput}
        onChange={(e) => setAmountInput(e.currentTarget.value)}
      />
      <Button
        onClick={handleDeposit}
        loading={txState.busy}
        disabled={!functions.lend}
      >
        Deposit Liquidity
      </Button>
      {localError && <p className="text-red-500 text-sm">{localError}</p>}
      <TxStatusAlert
        status={txState.lastMsg ? 'success' : txState.error ? 'error' : null}
        message={txState.lastMsg || txState.error}
      />
    </div>
  );
}

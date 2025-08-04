import React, { useState } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import { toTvara } from '../../utils/conversions';
import Button from '../common/Button';
import TxStatusAlert from '../common/TxStatusAlert';

export default function WithdrawFundsForm({ onSuccess }) {
  const { functions, txState } = useProgram();
  const [amountInput, setAmountInput] = useState('');
  const [target, setTarget] = useState(''); // 'liquidity' or 'treasury'
  const [localErr, setLocalErr] = useState('');

  const handleWithdraw = async () => {
    setLocalErr('');
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      setLocalErr('Enter positive amount');
      return;
    }
    if (!target) {
      setLocalErr('Select source');
      return;
    }
    try {
      const bigintAmt = toTvara(amt);
      if (target === 'liquidity') {
        await functions.adminWithdrawFunds(bigintAmt);
      } else {
        await functions.adminWithdrawTreasury(bigintAmt);
      }
      setAmountInput('');
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setLocalErr(err.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-3">
      <h3 className="text-lg font-semibold">Admin Withdraw</h3>
      <div className="flex items-center space-x-2">
        <label>
          <input
            type="radio"
            name="source"
            value="liquidity"
            onChange={() => setTarget('liquidity')}
            className="mr-1"
          />
          Liquidity
        </label>
        <label>
          <input
            type="radio"
            name="source"
            value="treasury"
            onChange={() => setTarget('treasury')}
            className="mr-1"
          />
          Treasury
        </label>
      </div>
      <input
        type="number"
        step="0.01"
        className="w-full p-2 border rounded focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
        placeholder="TVARA amount"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
      />
      {localErr && <p className="text-red-500 text-sm">{localErr}</p>}
      <Button
        variant="danger"
        onClick={handleWithdraw}
        loading={txState.busy}
        disabled={!target || !functions.adminWithdrawFunds}
      >
        Withdraw
      </Button>
      <TxStatusAlert
        status={txState.lastMsg ? 'success' : txState.error ? 'error' : null}
        message={txState.lastMsg || txState.error}
      />
    </div>
  );
}

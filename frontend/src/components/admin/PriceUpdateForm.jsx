import React, { useState } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import { WAD } from '../../utils/conversions';
import Button from '../common/Button';
import TxStatusAlert from '../common/TxStatusAlert';

export default function PriceUpdateForm({ onSuccess }) {
  const { functions, txState } = useProgram();
  const [priceInput, setPriceInput] = useState('');
  const [localErr, setLocalErr] = useState('');

  const handleUpdate = async () => {
    setLocalErr('');
    const n = parseFloat(priceInput);
    if (isNaN(n) || n <= 0) {
      setLocalErr('Enter a valid positive price');
      return;
    }
    try {
      const priceBig = BigInt(Math.floor(n * Number(WAD)));
      await functions.updateTvaraPrice(priceBig);
      setPriceInput('');
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-3">
      <h3 className="text-lg font-semibold">Update TVARA Price</h3>
      <input
        type="number"
        step="0.01"
        className="w-full p-2 border rounded focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
        placeholder="Price (e.g. 11.00 USD)"
        value={priceInput}
        onChange={(e) => setPriceInput(e.target.value)}
      />
      {localErr && <p className="text-red-500 text-sm">{localErr}</p>}
      <Button onClick={handleUpdate} loading={txState.busy} disabled={!functions.updateTvaraPrice}>
        Set Price
      </Button>
      <TxStatusAlert
        status={txState.lastMsg ? 'success' : txState.error ? 'error' : null}
        message={txState.lastMsg || txState.error}
      />
    </div>
  );
}

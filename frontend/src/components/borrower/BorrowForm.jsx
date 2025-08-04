import React, { useState } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import Button from '../common/Button';
import TxStatusAlert from '../common/TxStatusAlert';

export default function BorrowForm({ onSuccess }) {
  const { functions, txState } = useProgram();
  const [localErr, setLocalErr] = useState(null);

  const handle = async () => {
    setLocalErr(null);
    try {
      await functions.borrow();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setLocalErr(err.message || 'Borrow failed');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-2">
      <h3 className="text-lg font-semibold">Borrow (~66% LTV)</h3>
      {localErr && <p className="text-red-500 text-sm">{localErr}</p>}
      <Button onClick={handle} variant="primary" loading={txState.busy} disabled={!functions.borrow}>
        Borrow
      </Button>
      <TxStatusAlert
        status={txState.lastMsg ? 'success' : txState.error ? 'error' : null}
        message={txState.lastMsg || txState.error}
      />
    </div>
  );
}

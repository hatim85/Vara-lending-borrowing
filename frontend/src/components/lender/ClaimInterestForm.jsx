// src/components/lender/ClaimInterestForm.jsx
import React from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import Button from '../common/Button';
import TxStatusAlert from '../common/TxStatusAlert';

export default function ClaimInterestForm({ onSuccess }) {
  const { functions, txState } = useProgram();

  const handleClaim = async () => {
    try {
      await functions.claimInterest();
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-md space-y-2">
      <h3 className="font-semibold text-lg">Claim Earned Interest</h3>
      <Button
        onClick={handleClaim}
        variant="primary"
        loading={txState.busy}
        disabled={!functions.claim_interest}
      >
        Claim Interest
      </Button>
      <TxStatusAlert
        status={txState.lastMsg ? 'success' : txState.error ? 'error' : null}
        message={txState.lastMsg || txState.error}
      />
    </div>
  );
}

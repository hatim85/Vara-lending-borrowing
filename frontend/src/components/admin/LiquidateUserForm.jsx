// src/components/admin/LiquidateUserForm.jsx
import React, { useState } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import { ss58ToActorId } from '../../utils/actorId';
import Card from '../common/Card';
import Button from '../common/Button';

export default function LiquidateUserForm({ onSuccess }) {
  const { functions, txState } = useProgram();
  const [addrInput, setAddrInput] = useState('');
  const [localErr, setLocalErr] = useState('');

  const handleLiquidate = async () => {
    setLocalErr('');
    if (!addrInput.trim()) {
      return setLocalErr('Enter a valid SS58 address.');
    }
    let targetHex;
    try {
      targetHex = ss58ToActorId(addrInput.trim());
    } catch {
      return setLocalErr('Invalid SS58 format.');
    }
    try {
      await functions.liquidate(targetHex);
      onSuccess?.();
    } catch (err) {
      setLocalErr(err?.message || String(err));
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-2">Liquidate Borrower</h2>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Borrower SS58 address"
          className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
          value={addrInput}
          onChange={e => setAddrInput(e.target.value)}
        />
        {localErr && (
          <div className="text-red-600 text-sm">{localErr}</div>
        )}
        <Button
          onClick={handleLiquidate}
          loading={txState.busy}
          variant="danger"
        >
          Liquidate Position
        </Button>
      </div>
    </Card>
  );
}

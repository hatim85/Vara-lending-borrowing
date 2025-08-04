import React, { useState } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import Button from '../common/Button';
import TxStatusAlert from '../common/TxStatusAlert';

export default function PauseResumeControl({ onSuccess }) {
  const { functions, txState } = useProgram();
  const [action, setAction] = useState(null); // 'pause' or 'resume'
  const [localErr, setLocalErr] = useState('');

  const handle = async (fn) => {
    setLocalErr('');
    try {
      await functions[fn]();
      setAction(fn);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setLocalErr(err.message || `${fn} failed`);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-3">
      <h3 className="text-lg font-semibold">Pause / Resume Protocol</h3>
      {localErr && <p className="text-red-500 text-sm">{localErr}</p>}
      <div className="flex space-x-3">
        <Button
          variant="danger"
          onClick={() => handle('pause')}
          loading={txState.busy && action === 'pause'}
          disabled={!functions.pause}
        >
          Pause
        </Button>
        <Button
          variant="primary"
          onClick={() => handle('resume')}
          loading={txState.busy && action === 'resume'}
          disabled={!functions.resume}
        >
          Resume
        </Button>
      </div>
      <TxStatusAlert
        status={txState.lastMsg ? 'success' : txState.error ? 'error' : null}
        message={txState.lastMsg || txState.error}
      />
    </div>
  );
}

// 🧾 src/components/admin/BorrowersList.jsx
import React, { useEffect, useState } from 'react';
import { useProgram } from '../../contexts/ProgramContext';
import { formatHealthFactor, fromTvara } from '../../utils/conversions';
import Button from '../common/Button';
import Card from '../common/Card';

// WAD = 1e18, same as your contract
const WAD = 10n ** 18n;
const HF_MAX = (1n << 128n) - 1n;

export default function BorrowersList({ onLiquidateSuccess }) {
  const { functions, txState } = useProgram();
  const [borrowers, setBorrowers] = useState([]);
  const [liquidating, setLiquidating] = useState({});
  const [error, setError] = useState(null);

  // Fetch current borrowers whenever the call state updates
  useEffect(() => {
    async function fetchData() {
      try {
        const map = await functions.getAllBorrowersInfo?.();
        const entries = map
          ? Object.entries(map).map(([actorHex, ui]) => ({
            actorHex,
            ui,
          }))
          : [];
        setBorrowers(entries);
        setError(null);
      } catch (e) {
        console.error('Failed fetching borrowers:', e);
        setError('Error loading borrowers: ' + (e?.message || e));
      }
    }
    fetchData();
  }, [functions, txState.lastMsg]);

  async function handleLiquidate(actorHex) {
    if (!window.confirm(`Liquidate borrower ${actorHex}?`)) return;
    setLiquidating((prev) => ({ ...prev, [actorHex]: true }));
    try {
      await functions.liquidate(actorHex);
      onLiquidateSuccess?.();
    } catch (e) {
      alert('Liquidate failed: ' + (e?.message || e));
      console.error(e);
    } finally {
      setLiquidating((prev) => ({ ...prev, [actorHex]: false }));
    }
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">Borrowers</h2>
      {error && <p className="text-red-600">{error}</p>}
      <div className="overflow-auto">
        {borrowers.length === 0 ? (
          <p className="text-gray-500">No borrowers found.</p>
        ) :
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-1 text-left font-medium">Actor ID</th>
                <th className="px-3 py-1 text-right font-medium">Collateral</th>
                <th className="px-3 py-1 text-right font-medium">Debt</th>
                <th className="px-3 py-1 text-right font-medium">Health</th>
                <th className="px-3 py-1 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {borrowers.map(({ actorHex, ui }) => {
                let hfRaw;
                try {
                  hfRaw =
                    typeof ui.health_factor === 'bigint'
                      ? ui.health_factor
                      : BigInt(ui.health_factor ?? 0);
                } catch {
                  hfRaw = 0n;
                }
                const safe = hfRaw === HF_MAX || hfRaw >= 120n * WAD;

                return (
                  <tr
                    key={actorHex}
                    className={!safe ? 'bg-yellow-500' : ''}
                  >
                    <td className="px-3 py-1 font-mono break-all">{actorHex}</td>
                    <td className="px-3 py-1 text-right">
                      {fromTvara(ui?.collateral ?? 0n, 4)}
                    </td>
                    <td className="px-3 py-1 text-right">
                      {fromTvara(ui?.debt ?? 0n, 4)}
                    </td>
                    <td className="px-3 py-1 text-right">
                      {formatHealthFactor(ui?.health_factor, { minSafePercent: 120 })}
                    </td>
                    <td className="px-3 py-1 text-center">
                      {!safe ? (
                        <Button
                          loading={liquidating[actorHex] || txState.busy}
                          variant="danger"
                          size="sm"
                          onClick={() => handleLiquidate(actorHex)}
                        >
                          Liquidate
                        </Button>
                      ) : (
                        <span className="text-gray-500">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }
      </div>
    </Card>
  );
}

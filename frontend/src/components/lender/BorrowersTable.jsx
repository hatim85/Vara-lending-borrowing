// src/components/lender/BorrowersTable.jsx
import React from 'react';
import { formatHealthFactor, fromTvara } from '../../utils/conversions';
import Card from '../common/Card';

const WAD = 10n ** 18n;
const HF_INF  = (1n << 128n) - 1n;

export default function BorrowersTable({ borrowers = {} }) {
  const rows = Object.entries(borrowers).map(([actorHex, ui]) => {
    const hfRaw = typeof ui.health_factor === 'bigint'
      ? ui.health_factor
      : BigInt(ui.health_factor ?? 0);
    const hfLabel = hfRaw === 0n
      ? '—'
      : formatHealthFactor(hfRaw, 2, { minSafePercent: 120 });
    return { actorHex, collateral: ui.collateral, debt: ui.debt, hfLabel };
  });

  if (!rows.length) return <Card className='text-black'>No borrowers found.</Card>;

  return (
    <Card className="overflow-auto text-black">
      <h2 className="text-xl font-semibold mb-4">All Borrowers</h2>
      <table className="min-w-full table-fixed border-collapse divide-y">
        <thead className="bg-gray-100 text-black">
          <tr>
            <th className="px-3 py-2 text-left">Actor ID</th>
            <th className="px-3 py-2 text-right">Collateral</th>
            <th className="px-3 py-2 text-right">Principal Debt</th>
            <th className="px-3 py-2 text-right">Health Factor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ actorHex, collateral, debt, hfLabel }) => (
            <tr key={actorHex} className="border-b dark:border-gray-800">
              <td className="px-3 py-1 font-mono break-all">{actorHex}</td>
              <td className="px-3 py-1 text-right">{fromTvara(collateral)}</td>
              <td className="px-3 py-1 text-right">{fromTvara(debt)}</td>
              <td className="px-3 py-1 text-right">{hfLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

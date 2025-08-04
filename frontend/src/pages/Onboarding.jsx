// src/pages/Onboarding.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardButton from '../components/common/CardButton';

export default function OnboardingScreen({ isAdmin }) {
  const nav = useNavigate();

  return (
    <div className="w-full max-w-lg mx-auto text-center py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Choose Your Path</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <CardButton
          title="Provide Liquidity (Lend)"
          description="Deposit TVARA to earn interest."
          onClick={() => nav('/lend')}
        />
        <CardButton
          title="Borrow VLT"
          description="Deposit collateral and borrow."
          onClick={() => nav('/borrow')}
        />
        {isAdmin && (
          <CardButton
            title="Admin Panel"
            description="Admin controls."
            onClick={() => nav('/admin')}
          />
        )}
      </div>
    </div>
  );
}

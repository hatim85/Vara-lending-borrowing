// App.jsx

import React, { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { u8aToHex } from '@polkadot/util'
import { decodeAddress } from '@polkadot/util-crypto'
import { useGear, GearProvider } from './GearContext'
import { web3Accounts } from '@polkadot/extension-dapp'

const WalletUI = () => {
  const { apiReady,setSelectedAccount, connectWallet, selectedAccount, disconnectWallet, accounts } = useGear();
  if (!apiReady) return <span>Connecting to Gear node…</span>;
  return selectedAccount ? (
    <div>
      <span>⌲ Address: {selectedAccount.address}</span>
      <select
        onChange={(e) => {
          const newAccount = accounts.find(a => a.address === e.target.value);
          setSelectedAccount(newAccount);
        }}
        value={selectedAccount.address}
      >
        {accounts.map(acc => (
          <option key={acc.address} value={acc.address}>
            {acc.meta.name || acc.address}
          </option>
        ))}
      </select>
      <button onClick={disconnectWallet}>Disconnect</button>
    </div>
  ) : (
    <button onClick={() => connectWallet('vara-lending-app')}>
      🚀 Connect SubWallet
    </button>
  );
};

function LendingForm() {
  const { callService, selectedAccount } = useGear()
  const queryClient = useQueryClient()

  // The mutationFn transforms the SS58 address into a hex public key (actor ID).
  const lendMutation = useMutation({
    mutationFn: async (amountDecimal) => {
      const amount = BigInt(Math.floor(amountDecimal * 1e12))
      const actorId = u8aToHex(decodeAddress(selectedAccount.address))
      return await callService('lend', actorId, [], amount)
    },
    onSuccess: () => {
      alert('✅ Lend queued')
      queryClient.invalidateQueries({ queryKey: ['userInfo', 'borrowersInfo'] })
    },
    onError: (err) => {
      alert('❌ Lend failed: ' + (err?.message || err))
    }
  })

  const [input, setInput] = React.useState('')

  return (
    <div style={{ margin: '1em 0' }}>
      <input
        type="number"
        step="0.01"
        placeholder="CVR to lend"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          if (!lendMutation.isLoading) lendMutation.reset()
        }}
        onBlur={() => input && lendMutation.mutate(parseFloat(input))}
      />
      {lendMutation.isLoading && <span>Sending lend tx…</span>}
      {lendMutation.isError && <div style={{ color: 'red' }}>{lendMutation.error?.message}</div>}
      {lendMutation.isSuccess && <div style={{ color: 'green' }}>Tx successfully sent!</div>}
    </div>
  )
}

function InfoDisplay() {
  const { program, selectedAccount } = useGear()
  const address = selectedAccount?.address
  const actorId = address ? u8aToHex(decodeAddress(address)) : null

  const userInfo = useQuery({
    queryKey: ['userInfo', actorId],
    queryFn: () => program.lendingService.getUserInfo(actorId),
    enabled: !!program && !!actorId
  })

  const borrowersInfo = useQuery({
    queryKey: ['borrowersInfo'],
    queryFn: () => program.lendingService.getAllBorrowersInfo(actorId),
    enabled: !!program && !!actorId
  })

  if (userInfo.isLoading || borrowersInfo.isLoading) {
    return <div>Loading data…</div>
  }

  if (userInfo.isError || borrowersInfo.isError) {
    return <div>Error: {(userInfo.error || borrowersInfo.error)?.message}</div>
  }

  return (
    <div style={{ whiteSpace: 'pre-wrap', marginTop: '1em' }}>
      <h3>Your Lending Info:</h3>
      <code>{JSON.stringify(userInfo.data, null, 2)}</code>

      <h3>All Borrowers Info:</h3>
      <code>{JSON.stringify(borrowersInfo.data, null, 2)}</code>
    </div>
  )
}

export default function App() {
  return (
    <GearProvider>
      <div style={{ padding: '2em', maxWidth: '600px', margin: 'auto' }}>
        <h1>📡 Vara Lending Interface</h1>
        <WalletUI />
        <LendingForm />
        <InfoDisplay />
      </div>
    </GearProvider>
  )
}

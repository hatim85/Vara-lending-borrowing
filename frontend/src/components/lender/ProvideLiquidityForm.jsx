import { useState } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { toTvara } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function ProvideLiquidityForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [amountInput, setAmountInput] = useState("")
  const isThisActionLoading = txState.busy && txState.action === "lend"

  const handleDeposit = async () => {
    const amt = Number.parseFloat(amountInput)
    if (isNaN(amt) || amt <= 0) return

    try {
      const bigintAmt = toTvara(amt)
      await functions.lend(undefined, bigintAmt)
      setAmountInput("")
      onSuccess?.()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Providing liquidity..." />}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (TVARA)</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-500"
            placeholder="e.g. 1.5 TVARA"
            value={amountInput}
            onChange={(e) => setAmountInput(e.currentTarget.value)}
            disabled={isThisActionLoading}
          />
        </div>

        <Button
          onClick={handleDeposit}
          loading={isThisActionLoading}
          disabled={!functions.lend || isThisActionLoading}
          className="w-full"
        >
          Deposit Liquidity
        </Button>
      </div>
    </>
  )
}

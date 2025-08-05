import { useState } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { toTvara } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function WithdrawLiquidityForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [amountInput, setAmountInput] = useState("")
  const isThisActionLoading = txState.busy && txState.action === "withdraw"

  const handleWithdraw = async () => {
    const amt = Number.parseFloat(amountInput)
    if (isNaN(amt) || amt <= 0) return // Just return, don't set local error

    try {
      const bigintAmt = toTvara(amt)
      await functions.withdraw(bigintAmt)
      setAmountInput("")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      // Error is now handled by the modal through ProgramContext
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Withdrawing liquidity..." />}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (TVARA)</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            placeholder="e.g. 0.5 TVARA"
            value={amountInput}
            onChange={(e) => setAmountInput(e.currentTarget.value)}
            disabled={isThisActionLoading}
          />
        </div>

        <Button
          onClick={handleWithdraw}
          variant="primary"
          loading={isThisActionLoading}
          disabled={!functions.withdraw || isThisActionLoading}
          className="w-full"
        >
          Withdraw Liquidity
        </Button>
      </div>
    </>
  )
}

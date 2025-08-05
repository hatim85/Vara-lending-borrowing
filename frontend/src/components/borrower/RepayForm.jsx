import { useState } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { toTvara } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function RepayForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [amtInput, setAmtInput] = useState("")
  const isThisActionLoading = txState.busy && txState.action === "repay"

  const handle = async () => {
    const n = Number.parseFloat(amtInput)
    if (isNaN(n) || n <= 0) return // Just return, don't set local error

    try {
      await functions.repay(toTvara(n))
      setAmtInput("")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      // Error is now handled by the modal through ProgramContext
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Processing repayment..." />}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Repay Amount (VLT)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-500"
            placeholder="Enter VLT amount"
            value={amtInput}
            onChange={(e) => setAmtInput(e.target.value)}
            disabled={isThisActionLoading}
          />
        </div>

        <Button
          onClick={handle}
          variant="primary"
          loading={isThisActionLoading}
          disabled={!functions.repay || isThisActionLoading}
          className="w-full"
        >
          Repay Debt
        </Button>
      </div>
    </>
  )
}

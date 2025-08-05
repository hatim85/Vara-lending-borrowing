import { useState } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { toTvara } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function DepositCollateralForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [amtInput, setAmtInput] = useState("")
  const isThisActionLoading = txState.busy && txState.action === "depositCollateral"

  const handle = async () => {
    console.log("handle deposit collateral")

    const n = Number.parseFloat(amtInput)
    if (isNaN(n) || n <= 0) return // Just return, don't set local error

    try {
      await functions.depositCollateral(toTvara(n))
      setAmtInput("")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      // Error is now handled by the modal through ProgramContext
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Depositing collateral..." />}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (TVARA)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            placeholder="Enter TVARA amount"
            value={amtInput}
            onChange={(e) => setAmtInput(e.target.value)}
            disabled={isThisActionLoading}
          />
        </div>

        <Button
          onClick={handle}
          loading={isThisActionLoading}
          disabled={!functions.depositCollateral || isThisActionLoading}
          className="w-full"
        >
          Deposit Collateral
        </Button>
      </div>
    </>
  )
}

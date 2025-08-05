import { useState } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { WAD } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function PriceUpdateForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [priceInput, setPriceInput] = useState("")
  const isThisActionLoading = txState.busy && txState.action === "updateTvaraPrice"

  const handleUpdate = async () => {
    const n = Number.parseFloat(priceInput)
    if (isNaN(n) || n <= 0) return // Just return, don't set local error

    try {
      const priceBig = BigInt(Math.floor(n * Number(WAD)))
      await functions.updateTvaraPrice(priceBig)
      setPriceInput("")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      // Error is now handled by the modal through ProgramContext
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Updating TVARA price..." />}

      <div className="space-y-4 text-black">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Price (USD)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="e.g. 11.00"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            disabled={isThisActionLoading}
          />
        </div>

        <Button
          onClick={handleUpdate}
          loading={isThisActionLoading}
          disabled={!functions.updateTvaraPrice || isThisActionLoading}
          className="w-full"
        >
          Update Price
        </Button>
      </div>
    </>
  )
}

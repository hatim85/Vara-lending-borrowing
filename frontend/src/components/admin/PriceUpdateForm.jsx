"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { WAD } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function PriceUpdateForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [priceInput, setPriceInput] = useState("")
  const [localErr, setLocalErr] = useState("")
  const [localSuccess, setLocalSuccess] = useState("")

  const isThisActionLoading = txState.busy && txState.action === "updateTvaraPrice"

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (localSuccess) {
      const timer = setTimeout(() => {
        setLocalSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [localSuccess])

  const handleUpdate = async () => {
    setLocalErr("")
    setLocalSuccess("")

    const n = Number.parseFloat(priceInput)
    if (isNaN(n) || n <= 0) {
      setLocalErr("Enter a valid positive price")
      return
    }

    try {
      const priceBig = BigInt(Math.floor(n * Number(WAD)))
      await functions.updateTvaraPrice(priceBig)
      setPriceInput("")
      setLocalSuccess(`TVARA price updated successfully to $${n.toFixed(2)}! New price is now active.`)
      onSuccess?.()
    } catch (err) {
      console.error(err)
      let friendlyError = err?.message || "Price update failed"
      if (friendlyError.includes("Unauthorized")) {
        friendlyError = "You are not authorized to update the price."
      } else if (friendlyError.includes("Paused")) {
        friendlyError = "Protocol is currently paused. Please try again later."
      }
      setLocalErr(friendlyError)
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Updating TVARA price..." />}

      <div className="space-y-4">
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

        {localErr && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700 font-medium">Transaction Failed</p>
            </div>
            <p className="text-sm text-red-600 mt-1">{localErr}</p>
          </div>
        )}

        {localSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-700 font-medium">Success!</p>
            </div>
            <p className="text-sm text-green-600 mt-1">{localSuccess}</p>
          </div>
        )}

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

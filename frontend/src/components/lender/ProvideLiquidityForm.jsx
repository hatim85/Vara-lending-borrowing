"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { toTvara } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function ProvideLiquidityForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [amountInput, setAmountInput] = useState("")
  const [localError, setLocalError] = useState("")
  const [localSuccess, setLocalSuccess] = useState("")

  const isThisActionLoading = txState.busy && txState.action === "lend"

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (localSuccess) {
      const timer = setTimeout(() => {
        setLocalSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [localSuccess])

  const handleDeposit = async () => {
    setLocalError("")
    setLocalSuccess("")

    const amt = Number.parseFloat(amountInput)
    console.log("amt", amt)
    if (isNaN(amt) || amt <= 0) {
      setLocalError("Enter a positive number")
      return
    }

    try {
      const bigintAmt = toTvara(amt)
      console.log("bigintAmt", bigintAmt)
      await functions.lend(undefined, bigintAmt) // pass amount as value, not argument
      setAmountInput("")
      setLocalSuccess("Liquidity provided successfully! Your funds are now earning interest.")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      let friendlyError = err?.message || "Transaction failed"
      if (friendlyError.includes("InsufficientBalance")) {
        friendlyError = "Insufficient balance to complete this transaction."
      } else if (friendlyError.includes("Paused")) {
        friendlyError = "Protocol is currently paused. Please try again later."
      }
      setLocalError(friendlyError)
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

        {localError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700 font-medium">Transaction Failed</p>
            </div>
            <p className="text-sm text-red-600 mt-1">{localError}</p>
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

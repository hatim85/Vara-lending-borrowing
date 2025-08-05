"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { toTvara } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function WithdrawLiquidityForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [amountInput, setAmountInput] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const isThisActionLoading = txState.busy && txState.action === "withdraw"

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  const handleWithdraw = async () => {
    setErrorMsg("")
    setSuccessMsg("")

    const amt = Number.parseFloat(amountInput)
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg("Enter positive amount")
      return
    }

    try {
      const bigintAmt = toTvara(amt)
      await functions.withdraw(bigintAmt)
      setAmountInput("")
      setSuccessMsg("Liquidity withdrawn successfully! Funds have been returned to your wallet.")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      let friendlyError = err?.message || "Withdrawal failed"
      if (friendlyError.includes("InsufficientBalance")) {
        friendlyError = "Insufficient liquidity balance to withdraw this amount."
      } else if (friendlyError.includes("Paused")) {
        friendlyError = "Protocol is currently paused. Please try again later."
      }
      setErrorMsg(friendlyError)
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

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700 font-medium">Transaction Failed</p>
            </div>
            <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-700 font-medium">Success!</p>
            </div>
            <p className="text-sm text-green-600 mt-1">{successMsg}</p>
          </div>
        )}

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

"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { toTvara } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function WithdrawFundsForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [amountInput, setAmountInput] = useState("")
  const [target, setTarget] = useState("") // 'liquidity' or 'treasury'
  const [localErr, setLocalErr] = useState("")
  const [localSuccess, setLocalSuccess] = useState("")

  const isThisActionLoading =
    txState.busy && (txState.action === "adminWithdrawFunds" || txState.action === "adminWithdrawTreasury")

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (localSuccess) {
      const timer = setTimeout(() => {
        setLocalSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [localSuccess])

  const handleWithdraw = async () => {
    setLocalErr("")
    setLocalSuccess("")

    const amt = Number.parseFloat(amountInput)
    if (isNaN(amt) || amt <= 0) {
      setLocalErr("Enter positive amount")
      return
    }
    if (!target) {
      setLocalErr("Select source")
      return
    }

    try {
      const bigintAmt = toTvara(amt)
      if (target === "liquidity") {
        await functions.adminWithdrawFunds(bigintAmt)
        setLocalSuccess(`Successfully withdrew ${amt} TVARA from liquidity pool! Funds transferred to admin wallet.`)
      } else {
        await functions.adminWithdrawTreasury(bigintAmt)
        setLocalSuccess(`Successfully withdrew ${amt} TVARA from treasury! Funds transferred to admin wallet.`)
      }
      setAmountInput("")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      let friendlyError = err?.message || "Withdrawal failed"
      if (friendlyError.includes("Unauthorized")) {
        friendlyError = "You are not authorized to withdraw funds."
      } else if (friendlyError.includes("InsufficientBalance")) {
        friendlyError = "Insufficient funds in the selected source."
      } else if (friendlyError.includes("Paused")) {
        friendlyError = "Protocol is currently paused. Please try again later."
      }
      setLocalErr(friendlyError)
    }
  }

  return (
    <>
      {isThisActionLoading && (
        <LoadingOverlay
          message={target === "liquidity" ? "Withdrawing from liquidity pool..." : "Withdrawing from treasury..."}
        />
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Withdrawal Source</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="source"
                value="liquidity"
                onChange={() => setTarget("liquidity")}
                className="mr-2 text-blue-600"
                disabled={isThisActionLoading}
              />
              <span className="text-sm font-medium">Liquidity Pool</span>
            </label>
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="source"
                value="treasury"
                onChange={() => setTarget("treasury")}
                className="mr-2 text-blue-600"
                disabled={isThisActionLoading}
              />
              <span className="text-sm font-medium">Treasury</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (TVARA)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            placeholder="Enter amount"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
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
          variant="danger"
          onClick={handleWithdraw}
          loading={isThisActionLoading}
          disabled={!target || !functions.adminWithdrawFunds || isThisActionLoading}
          className="w-full"
        >
          Withdraw Funds
        </Button>
      </div>
    </>
  )
}

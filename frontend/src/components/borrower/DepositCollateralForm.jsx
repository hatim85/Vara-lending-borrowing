"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { toTvara } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function DepositCollateralForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [amtInput, setAmtInput] = useState("")
  const [localErr, setLocalErr] = useState(null)
  const [localSuccess, setLocalSuccess] = useState(null)

  const isThisActionLoading = txState.busy && txState.action === "depositCollateral"

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (localSuccess) {
      const timer = setTimeout(() => {
        setLocalSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [localSuccess])

  const handle = async () => {
    console.log("handle deposit collateral")
    setLocalErr(null)
    setLocalSuccess(null)

    const n = Number.parseFloat(amtInput)
    if (isNaN(n) || n <= 0) return setLocalErr("Enter a positive number")

    try {
      await functions.depositCollateral(toTvara(n))
      setAmtInput("")
      setLocalSuccess("Collateral deposited successfully! You can now borrow against this collateral.")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      let friendlyError = err?.message || "Transaction failed"
      if (friendlyError.includes("InsufficientBalance")) {
        friendlyError = "Insufficient balance to complete this transaction."
      } else if (friendlyError.includes("Paused")) {
        friendlyError = "Protocol is currently paused. Please try again later."
      }
      setLocalErr(friendlyError)
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

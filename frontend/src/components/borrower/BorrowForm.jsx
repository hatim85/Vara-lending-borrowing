"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function BorrowForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [localErr, setLocalErr] = useState(null)
  const [localSuccess, setLocalSuccess] = useState(null)

  const isThisActionLoading = txState.busy && txState.action === "borrow"

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
    setLocalErr(null)
    setLocalSuccess(null)

    try {
      await functions.borrow()
      setLocalSuccess("VLT borrowed successfully! Monitor your health factor to avoid liquidation.")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      let friendlyError = err?.message || "Borrow failed"
      if (friendlyError.includes("InsufficientCollateral")) {
        friendlyError = "Insufficient collateral for this operation."
      } else if (friendlyError.includes("HealthFactorTooLow")) {
        friendlyError = "Health factor too low. Add more collateral first."
      } else if (friendlyError.includes("Paused")) {
        friendlyError = "Protocol is currently paused. Please try again later."
      }
      setLocalErr(friendlyError)
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Processing borrow request..." />}

      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Borrow VLT tokens against your collateral at up to 66% loan-to-value ratio.
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
          variant="primary"
          loading={isThisActionLoading}
          disabled={!functions.borrow || isThisActionLoading}
          className="w-full"
        >
          Borrow VLT
        </Button>
      </div>
    </>
  )
}

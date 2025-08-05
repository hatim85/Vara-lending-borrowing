"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function ClaimInterestForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [localError, setLocalError] = useState("")
  const [localSuccess, setLocalSuccess] = useState("")

  const isThisActionLoading = txState.busy && txState.action === "claimInterest"

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (localSuccess) {
      const timer = setTimeout(() => {
        setLocalSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [localSuccess])

  const handleClaim = async () => {
    setLocalError("")
    setLocalSuccess("")

    try {
      await functions.claimInterest()
      setLocalSuccess("Interest claimed successfully! Earnings have been transferred to your wallet.")
      onSuccess?.()
    } catch (err) {
      console.error(err)
      let friendlyError = err?.message || "Claim failed"
      if (friendlyError.includes("NoInterest")) {
        friendlyError = "No interest available to claim."
      } else if (friendlyError.includes("Paused")) {
        friendlyError = "Protocol is currently paused. Please try again later."
      }
      setLocalError(friendlyError)
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Claiming interest..." />}

      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Claim your earned interest from providing liquidity to the protocol.
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
          onClick={handleClaim}
          variant="primary"
          loading={isThisActionLoading}
          disabled={!functions.claimInterest || isThisActionLoading}
          className="w-full"
        >
          Claim Interest
        </Button>
      </div>
    </>
  )
}

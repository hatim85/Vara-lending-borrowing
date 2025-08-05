"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function PauseResumeControl({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [action, setAction] = useState(null) // 'pause' or 'resume'
  const [localErr, setLocalErr] = useState("")
  const [localSuccess, setLocalSuccess] = useState("")

  const isThisActionLoading = txState.busy && (txState.action === "pause" || txState.action === "resume")

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (localSuccess) {
      const timer = setTimeout(() => {
        setLocalSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [localSuccess])

  const handle = async (fn) => {
    setLocalErr("")
    setLocalSuccess("")
    setAction(fn)

    try {
      await functions[fn]()
      const successMessage =
        fn === "pause"
          ? "Protocol paused successfully! All operations are now suspended."
          : "Protocol resumed successfully! All operations are now active."
      setLocalSuccess(successMessage)
      onSuccess?.()
    } catch (err) {
      console.error(err)
      let friendlyError = err?.message || `${fn} failed`
      if (friendlyError.includes("Unauthorized")) {
        friendlyError = "You are not authorized to perform this action."
      }
      setLocalErr(friendlyError)
    }
  }

  return (
    <>
      {isThisActionLoading && (
        <LoadingOverlay message={txState.action === "pause" ? "Pausing protocol..." : "Resuming protocol..."} />
      )}

      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Control protocol operations for maintenance or emergency situations.
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

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="danger"
            onClick={() => handle("pause")}
            loading={isThisActionLoading && txState.action === "pause"}
            disabled={!functions.pause || isThisActionLoading}
            size="sm"
          >
            Pause
          </Button>
          <Button
            variant="primary"
            onClick={() => handle("resume")}
            loading={isThisActionLoading && txState.action === "resume"}
            disabled={!functions.resume || isThisActionLoading}
            size="sm"
          >
            Resume
          </Button>
        </div>
      </div>
    </>
  )
}

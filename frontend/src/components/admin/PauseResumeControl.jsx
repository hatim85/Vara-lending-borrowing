import { useState } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function PauseResumeControl({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [action, setAction] = useState(null) // 'pause' or 'resume'
  const isThisActionLoading = txState.busy && (txState.action === "pause" || txState.action === "resume")

  const handle = async (fn) => {
    setAction(fn)

    try {
      await functions[fn]()
      onSuccess?.()
    } catch (err) {
      console.error(err)
      // Error is now handled by the modal through ProgramContext
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

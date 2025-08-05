import { useProgram } from "../../contexts/ProgramContext"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function ClaimInterestForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const isThisActionLoading = txState.busy && txState.action === "claimInterest"

  const handleClaim = async () => {
    try {
      await functions.claimInterest()
      onSuccess?.()
    } catch (err) {
      console.error(err)
      // Error is now handled by the modal through ProgramContext
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Claiming interest..." />}

      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Claim your earned interest from providing liquidity to the protocol.
        </div>

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

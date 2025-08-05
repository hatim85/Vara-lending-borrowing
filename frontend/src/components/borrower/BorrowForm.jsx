import { useProgram } from "../../contexts/ProgramContext"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function BorrowForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const isThisActionLoading = txState.busy && txState.action === "borrow"

  const handle = async () => {
    try {
      await functions.borrow()
      onSuccess?.()
    } catch (err) {
      console.error(err)
      // Error is now handled by the modal through ProgramContext
    }
  }

  return (
    <>
      {isThisActionLoading && <LoadingOverlay message="Processing borrow request..." />}

      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Borrow VLT tokens against your collateral at up to 66% loan-to-value ratio.
        </div>

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

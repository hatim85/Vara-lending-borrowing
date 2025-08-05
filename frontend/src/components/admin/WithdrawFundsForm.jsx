import { useEffect, useState } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { toTvara, fromTvara } from "../../utils/conversions"
import Button from "../common/Button"
import LoadingOverlay from "../common/LoadingOverlay"

export default function WithdrawFundsForm({ onSuccess }) {
  const { functions, txState } = useProgram()
  const [amountInput, setAmountInput] = useState("")
  const [target, setTarget] = useState("") // 'liquidity' or 'treasury'
  const [liquidityBalance, setLiquidityBalance] = useState(null)
  const [treasuryBalance, setTreasuryBalance] = useState(null)

  const isThisActionLoading =
    txState.busy && (txState.action === "adminWithdrawFunds" || txState.action === "adminWithdrawTreasury")

  const getTreasuryBalance = async () => {
    try {
      const balance = await functions.getTreasuryBalance()
      const formattedBalance = fromTvara(balance || 0n)
      setTreasuryBalance(formattedBalance.toFixed(2))
      return balance
    } catch (err) {
      console.error("Error fetching treasury balance:", err)
      setTreasuryBalance("0.0000")
      return 0n
    }
  }

  const getTotalLiquidity = async () => {
    try {
      const liquidity = await functions.getTotalLiquidity()
      const formattedLiquidity = fromTvara(liquidity || 0n)
      setLiquidityBalance(formattedLiquidity.toFixed(2))
      return liquidity
    } catch (err) {
      console.error("Error fetching total liquidity:", err)
      setLiquidityBalance("0.0000")
      return 0n
    }
  }

  useEffect(() => {
    const fetchBalances = async () => {
      if (target === "liquidity") {
        const liquidity = await getTotalLiquidity()
        const formattedAmount = fromTvara(liquidity || 0n)
        setAmountInput(formattedAmount > 0 ? formattedAmount.toFixed(2) : "")
      } else if (target === "treasury") {
        const treasury = await getTreasuryBalance()
        const formattedAmount = fromTvara(treasury || 0n)
        setAmountInput(formattedAmount > 0 ? formattedAmount.toFixed(2) : "")
      }
    }

    if (target) {
      fetchBalances()
    }
  }, [target])

  const handleWithdraw = async () => {
    const amt = Number.parseFloat(amountInput)
    if (isNaN(amt) || amt <= 0) return
    if (!target) return

    try {
      const bigintAmt = toTvara(amt)
      if (target === "liquidity") {
        await functions.adminWithdrawFunds(bigintAmt)
      } else {
        await functions.adminWithdrawTreasury(bigintAmt)
      }
      setAmountInput("")
      onSuccess?.()
      // Optionally refetch balances after withdrawal
      if (target === "liquidity") await getTotalLiquidity()
      if (target === "treasury") await getTreasuryBalance()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      {isThisActionLoading && (
        <LoadingOverlay
          message={target === "liquidity" ? "Withdrawing from liquidity pool..." : "Withdrawing from treasury..."}
        />
      )}

      <div className="space-y-4 text-black">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Withdrawal Source</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="source"
                  value="liquidity"
                  onChange={() => setTarget("liquidity")}
                  className="mr-2 text-blue-600"
                  disabled={isThisActionLoading}
                />
                <span className="text-sm font-medium">Liquidity Pool</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {liquidityBalance !== null ? `${liquidityBalance} TVARA` : "Tap to view Balance"}
              </span>
            </label>

            <label className="flex flex-col items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="source"
                  value="treasury"
                  onChange={() => setTarget("treasury")}
                  className="mr-2 text-blue-600"
                  disabled={isThisActionLoading}
                />
                <span className="text-sm font-medium">Treasury</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {treasuryBalance !== null ? `${treasuryBalance} TVARA` : "Tap to view Balance"}
              </span>
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

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { useNavigate } from "react-router-dom"
import PriceUpdateForm from "./PriceUpdateForm"
import PauseResumeControl from "./PauseResumeControl"
import WithdrawFundsForm from "./WithdrawFundsForm"
import BorrowersList from "./BorrowersList"
import { ss58ToActorId } from "../../utils/actorId"
import { Shield, Settings, Users, AlertTriangle, DollarSign, Activity, LogOut } from "lucide-react"
import LoadingOverlay from "../common/LoadingOverlay"
import Button from "../common/Button"
import TransactionModal from "../common/TransactionModal"

export default function AdminPanel() {
  const {
    account,
    publicKey,
    functions,
    txState,
    disconnectWallet,
    setDisconnectCallback,
    transactionResult,
    clearTransactionResult,
    isWalletLoading,
  } = useProgram()
  const [adminHex, setAdminHex] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loadingRole, setLoadingRole] = useState(true)
  const [protocolStats, setProtocolStats] = useState({})
  const navigate = useNavigate()

  // Set up disconnect callback to redirect to dashboard
  useEffect(() => {
    setDisconnectCallback(() => {
      navigate("/dashboard")
    })
  }, [navigate, setDisconnectCallback])

  // Only redirect if wallet loading is complete and no account
  useEffect(() => {
    if (!isWalletLoading && !account) {
      navigate("/dashboard")
    }
  }, [account, navigate, isWalletLoading])

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!account || !functions.getAdmin || isWalletLoading) {
        setIsAdmin(false)
        setAdminHex(null)
        setLoadingRole(false)
        return
      }

      setLoadingRole(true)
      try {
        // Wait a bit for the connection to stabilize
        await new Promise((resolve) => setTimeout(resolve, 500))

        const [adminActor, userInfo] = await Promise.all([
          functions.getAdmin(),
          functions.getUserInfo?.().catch(() => null),
        ])

        console.log("Account:", account)
        const acctHex = ss58ToActorId(account).toLowerCase()
        console.log("AdminPanel: fetched admin actor", adminActor, "for account", acctHex)

        const adminId = adminActor?.toString().toLowerCase() ?? ""
        setAdminHex(adminId)
        const isAdminUser = adminId && adminId === acctHex
        setIsAdmin(isAdminUser)

        console.log("Admin check result:", { adminId, acctHex, isAdminUser })

        // Only fetch protocol stats if user is admin
        if (isAdminUser) {
          const [utilization, tvaraPrice, borrowers] = await Promise.all([
            functions.getUtilizationRate?.().catch(() => null),
            functions.getTvaraPrice?.().catch(() => null),
            functions.getAllBorrowersInfo?.().catch(() => {}),
          ])

          setProtocolStats({
            utilization,
            tvaraPrice,
            borrowerCount: Object.keys(borrowers || {}).length,
          })
        }
      } catch(err) {
        console.error("AdminPanel: failed to fetch admin info", err)
        setIsAdmin(false)
        setAdminHex(null)
      } finally {
        setLoadingRole(false)
      }
    }

    // Only check admin status if wallet is not loading
    if (!isWalletLoading) {
      const timer = setTimeout(checkAdminStatus, 100)
      return () => clearTimeout(timer)
    }
  }, [account, functions, publicKey, isWalletLoading])

  // Format public key for display (0x + first 4 + ... + last 4)
  const formatPublicKey = (pubKey) => {
    if (!pubKey) return ""
    return `${pubKey.slice(0, 6)}...${pubKey.slice(-4)}`
  }

  // Show loading while wallet is being restored or admin check is in progress
  if (isWalletLoading || loadingRole) {
    return <LoadingOverlay message="Verifying admin permissions..." />
  }

  // Don't render anything if no account and wallet loading is complete
  // The useEffect will handle navigation
  if (!account) {
    return null
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen min-w-screen bg-gradient-to-br from-purple-50 via-white to-red-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You are not authorized to access the admin panel.</p>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-700">Only the protocol administrator can access these controls.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-purple-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Connected: {formatPublicKey(publicKey)}</div>
              <Button variant="secondary" size="sm" onClick={disconnectWallet} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </Button>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Administrator Access</h2>
              <p className="text-sm text-gray-600 font-mono break-all">{adminHex ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Protocol Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Utilization Rate</h3>
                <p className="text-xs text-gray-500">Pool Usage</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {protocolStats.utilization ? `${((Number(protocolStats.utilization) / 1e18) * 100).toFixed(1)}%` : "—"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">TVARA Price</h3>
                <p className="text-xs text-gray-500">Current Oracle</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${protocolStats.tvaraPrice ? (Number(protocolStats.tvaraPrice) / 1e18).toFixed(2) : "—"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Active Borrowers</h3>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{protocolStats.borrowerCount || 0}</p>
          </div>
        </div>

        {/* Borrowers Management */}
        <div className="mb-8 text-black">
          <BorrowersList
            onLiquidateSuccess={() => {
              /* Optionally add custom success handling */
            }}
          />
        </div>

        {/* Admin Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Price Oracle</h3>
                  <p className="text-blue-100 text-sm">Update TVARA price</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <PriceUpdateForm onSuccess={() => {}} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Protocol Control</h3>
                  <p className="text-yellow-100 text-sm">Pause/Resume system</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <PauseResumeControl onSuccess={() => {}} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Treasury</h3>
                  <p className="text-red-100 text-sm">Withdraw funds</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <WithdrawFundsForm onSuccess={() => {}} />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {txState.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Transaction Failed</h3>
                <p className="text-sm text-red-700">{txState.error}</p>
              </div>
            </div>
          </div>
        )}

        {txState.lastMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium text-green-800">Transaction Successful</h3>
                <p className="text-sm text-green-700">{txState.lastMsg}</p>
              </div>
            </div>
          </div>
        )}
        {/* Transaction Modal */}
        <TransactionModal
          isOpen={!!transactionResult}
          onClose={clearTransactionResult}
          transaction={transactionResult}
        />
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useProgram } from "../contexts/ProgramContext"
import LoadingOverlay from "../components/common/LoadingOverlay"
import OnboardingScreen from "./Onboarding"
import Button from "../components/common/Button"
import { Wallet, Shield, AlertCircle, CheckCircle } from "lucide-react"

// Add localStorage key for admin status
const ADMIN_STATUS_KEY = "trustlend_admin_status"

export default function Dashboard() {
  const { account, publicKey, connectWallet, functions, txState, isInitialized, isWalletLoading } = useProgram()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loadingAdmin, setLoadingAdmin] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const navigate = useNavigate()

  // Load admin status from localStorage on component mount
  useEffect(() => {
    if (account && publicKey) {
      try {
        const storedAdminStatus = localStorage.getItem(ADMIN_STATUS_KEY)
        if (storedAdminStatus) {
          const { account: storedAccount, isAdmin: storedIsAdmin, timestamp } = JSON.parse(storedAdminStatus)
          // Check if the stored status is for the current account and not too old (5 minutes)
          if (storedAccount === account && Date.now() - timestamp < 5 * 60 * 1000) {
            setIsAdmin(storedIsAdmin)
            setAdminCheckComplete(true)
            console.log("Admin status restored from localStorage:", storedIsAdmin)
            return
          }
        }
      } catch (error) {
        console.error("Failed to load admin status from localStorage:", error)
      }
    }
  }, [account, publicKey])

  // Check admin status only once when account changes and not already loaded from storage
  useEffect(() => {
    if (!account || !isInitialized || !functions.getAdmin || isWalletLoading || adminCheckComplete) {
      if (!account) {
        setIsAdmin(false)
        setAdminCheckComplete(true)
      }
      return
    }

    const checkAdmin = async () => {
      setLoadingAdmin(true)
      try {
        // Add a small delay to ensure the connection is stable
        await new Promise((resolve) => setTimeout(resolve, 300))

        const adminId = await functions.getAdmin()
        if (adminId) {
          const fromHex = adminId.toString().toLowerCase()
          const walletHex = publicKey?.toLowerCase()
          const isAdminUser = walletHex && walletHex === fromHex
          setIsAdmin(isAdminUser)

          // Save admin status to localStorage
          try {
            const adminStatusData = {
              account,
              isAdmin: isAdminUser,
              timestamp: Date.now(),
            }
            localStorage.setItem(ADMIN_STATUS_KEY, JSON.stringify(adminStatusData))
          } catch (error) {
            console.error("Failed to save admin status to localStorage:", error)
          }

          console.log("Dashboard admin check:", { fromHex, walletHex, isAdminUser })
        } else {
          setIsAdmin(false)
        }
      } catch (err) {
        console.error("Failed admin fetch", err)
        setConnectionError("Failed to verify admin status")
        setIsAdmin(false)
      } finally {
        setLoadingAdmin(false)
        setAdminCheckComplete(true)
      }
    }

    checkAdmin()
  }, [account, publicKey, functions, isInitialized, isWalletLoading, adminCheckComplete])

  // Clear admin status when account changes
  useEffect(() => {
    setAdminCheckComplete(false)
    setIsAdmin(false)
    // Clear stored admin status when account changes
    try {
      localStorage.removeItem(ADMIN_STATUS_KEY)
    } catch (error) {
      console.error("Failed to clear admin status from localStorage:", error)
    }
  }, [account])

  const handleConnect = async () => {
    setConnectionError(null)
    try {
      await connectWallet()
    } catch (error) {
      setConnectionError("Failed to connect wallet. Please make sure Polkadot.js extension is installed.")
    }
  }

  // Show loading while initializing or wallet is loading
  if (!isInitialized || isWalletLoading) {
    return <LoadingOverlay message="Initializing application..." />
  }

  // Show loading while checking admin (only if we have an account)
  if (account && loadingAdmin && !adminCheckComplete) {
    return <LoadingOverlay message="Verifying account permissions..." />
  }

  // 1. Show connect prompt if wallet not connected
  if (!account) {
    return (
      <div className="min-h-screen min-w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <Link to="/" className="text-gray-900 hover:text-blue-600 transition-colors">
                  <span className="text-xl font-bold text-gray-900">TrustLend</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={() => navigate("/")} className="text-white transition-colors">
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Wallet className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Connect your Polkadot.js wallet to access the TrustLend dashboard and start lending or borrowing.
              </p>

              {/* Connection Error */}
              {connectionError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{connectionError}</p>
                  </div>
                </div>
              )}

              {/* Connect Button */}
              <Button onClick={handleConnect} size="lg" className="w-full mb-6">
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </Button>

              {/* Requirements */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Requirements:</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Subwallet browser extension</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>TVARA testnet account</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Sufficient balance for transactions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Secure</h3>
                <p className="text-xs text-gray-600 mt-1">Non-custodial protocol</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Tested</h3>
                <p className="text-xs text-gray-600 mt-1">Vara testnet ready</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Wallet className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Easy</h3>
                <p className="text-xs text-gray-600 mt-1">One-click connect</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. After user connects and admin check is complete, show onboarding choices
  if (adminCheckComplete) {
    return <OnboardingScreen isAdmin={isAdmin} />
  }

  // Fallback loading state
  return <LoadingOverlay message="Loading..." />
}

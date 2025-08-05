"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { useNavigate } from "react-router-dom"
import DepositCollateralForm from "./DepositCollateralForm"
import BorrowForm from "./BorrowForm"
import RepayForm from "./RepayForm"
import { formatHealthFactor, fromTvara } from "../../utils/conversions"
import { ArrowUpRight, TrendingUp, Shield, AlertTriangle, LogOut } from "lucide-react"
import LoadingOverlay from "../common/LoadingOverlay"
import Button from "../common/Button"

export default function BorrowerDashboard() {
  const { account, publicKey, functions, txState, disconnectWallet, setDisconnectCallback } = useProgram()
  const [ui, setUi] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Set up disconnect callback to redirect to dashboard
  useEffect(() => {
    setDisconnectCallback(() => {
      navigate("/dashboard")
    })
  }, [navigate, setDisconnectCallback])

  // Redirect to dashboard if wallet is disconnected
  useEffect(() => {
    if (!account) {
      navigate("/dashboard")
    }
  }, [account, navigate])

  const refresh = async () => {
    if (!account) return
    setLoading(true)
    try {
      const user = await functions.getUserInfo()
      setUi(user)
      setLastUpdate(Date.now())
    } catch (err) {
      console.error("UserInfo fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [account, txState.lastMsg, functions])

  const getHealthFactorStatus = (hf, debt) => {
    // If there's no debt, the position is safe regardless of health factor
    const debtValue = debt != null ? fromTvara(debt) : 0
    if (debtValue === 0) {
      return { status: "safe", color: "green", icon: Shield }
    }

    if (!hf) return { status: "unknown", color: "gray", icon: Shield }

    const formatted = formatHealthFactor(hf, { minSafePercent: 120 })

    // Handle infinity case
    if (formatted === "∞") {
      return { status: "safe", color: "green", icon: Shield }
    }

    const numericValue = Number.parseFloat(formatted.replace("%", "").replace(" ⚠️", ""))

    if (numericValue >= 150) return { status: "safe", color: "green", icon: Shield }
    if (numericValue >= 120) return { status: "warning", color: "yellow", icon: AlertTriangle }
    return { status: "danger", color: "red", icon: AlertTriangle }
  }

  const healthStatus = getHealthFactorStatus(ui?.health_factor, ui?.debt)
  const collateralValue = ui?.collateral != null ? fromTvara(ui.collateral) : 0
  const debtValue = ui?.debt != null ? fromTvara(ui.debt) : 0

  // Format public key for display (0x + first 4 + ... + last 4)
  const formatPublicKey = (pubKey) => {
    if (!pubKey) return ""
    return `${pubKey.slice(0, 6)}...${pubKey.slice(-4)}`
  }

  if (loading) {
    return <LoadingOverlay message="Loading borrower dashboard..." />
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">Borrower Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Connected: {formatPublicKey(publicKey)}</div>
              <Button variant="secondary" size="sm" onClick={disconnectWallet} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </Button>
              <div
                className={`w-3 h-3 rounded-full ${healthStatus.color === "green" ? "bg-green-500" : healthStatus.color === "yellow" ? "bg-yellow-500" : "bg-red-500"} animate-pulse`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Collateral Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Collateral</h3>
                  <p className="text-xs text-gray-500">TVARA Deposited</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">{collateralValue.toFixed(2)}</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">TVARA</span>
              </div>
            </div>
          </div>

          {/* Debt Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Outstanding Debt</h3>
                  <p className="text-xs text-gray-500">VLT Borrowed</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">{debtValue.toFixed(2)}</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">VLT</span>
              </div>
            </div>
          </div>

          {/* Health Factor Card */}
          <div
            className={`bg-white rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-shadow ${
              healthStatus.color === "green"
                ? "border-green-200"
                : healthStatus.color === "yellow"
                  ? "border-yellow-200"
                  : "border-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    healthStatus.color === "green"
                      ? "bg-green-100"
                      : healthStatus.color === "yellow"
                        ? "bg-yellow-100"
                        : "bg-red-100"
                  }`}
                >
                  <healthStatus.icon
                    className={`w-6 h-6 ${
                      healthStatus.color === "green"
                        ? "text-green-600"
                        : healthStatus.color === "yellow"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Health Factor</h3>
                  <p className="text-xs text-gray-500">Liquidation Risk</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                {ui?.health_factor != null ? formatHealthFactor(ui.health_factor, { minSafePercent: 120 }) : "—"}
              </p>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    healthStatus.color === "green"
                      ? "bg-green-500"
                      : healthStatus.color === "yellow"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    healthStatus.color === "green"
                      ? "text-green-600"
                      : healthStatus.color === "yellow"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {healthStatus.status === "safe" ? "Safe" : healthStatus.status === "warning" ? "At Risk" : "Danger"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Factor Alert - Only show if there's actual debt and risk */}
        {healthStatus.status !== "safe" && debtValue > 0 && (
          <div
            className={`mb-8 p-4 rounded-xl border-l-4 ${
              healthStatus.color === "yellow" ? "bg-yellow-50 border-yellow-400" : "bg-red-50 border-red-400"
            }`}
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle
                className={`w-5 h-5 ${healthStatus.color === "yellow" ? "text-yellow-600" : "text-red-600"}`}
              />
              <div>
                <h3 className={`font-medium ${healthStatus.color === "yellow" ? "text-yellow-800" : "text-red-800"}`}>
                  {healthStatus.status === "warning" ? "Position at Risk" : "Liquidation Risk"}
                </h3>
                <p className={`text-sm ${healthStatus.color === "yellow" ? "text-yellow-700" : "text-red-700"}`}>
                  {healthStatus.status === "warning"
                    ? "Your health factor is below 150%. Consider adding more collateral or repaying debt."
                    : "Your position may be liquidated. Take immediate action to improve your health factor."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome message for new users */}
        {debtValue === 0 && collateralValue === 0 && (
          <div className="mb-8 p-6 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800">Welcome to TrustLend</h3>
                <p className="text-sm text-blue-700">
                  Start by depositing TVARA as collateral, then you can borrow VLT tokens up to 66% of your collateral
                  value.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
              <h3 className="text-lg font-semibold text-white">Deposit Collateral</h3>
              <p className="text-blue-100 text-sm">Secure your position</p>
            </div>
            <div className="p-6">
              <DepositCollateralForm onSuccess={refresh} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
              <h3 className="text-lg font-semibold text-white">Borrow VLT</h3>
              <p className="text-purple-100 text-sm">Up to 66% LTV</p>
            </div>
            <div className="p-6">
              <BorrowForm onSuccess={refresh} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
              <h3 className="text-lg font-semibold text-white">Repay Debt</h3>
              <p className="text-green-100 text-sm">Reduce your risk</p>
            </div>
            <div className="p-6">
              <RepayForm onSuccess={refresh} />
            </div>
          </div>
        </div>

        {/* Position Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Position Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Loan-to-Value Ratio</span>
                <span className="text-sm font-bold text-gray-900">
                  {collateralValue > 0 ? ((debtValue / collateralValue) * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Available to Borrow</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.max(0, collateralValue * 0.66 - debtValue).toFixed(2)} VLT
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Liquidation Price</span>
                <span className="text-sm font-bold text-gray-900">
                  {debtValue > 0 ? `$${((debtValue * 1.2) / collateralValue).toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-600">
                  {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

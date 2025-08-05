"use client"

import { useState, useEffect } from "react"
import { useProgram } from "../../contexts/ProgramContext"
import { useNavigate } from "react-router-dom"
import ProvideLiquidityForm from "./ProvideLiquidityForm"
import WithdrawLiquidityForm from "./WithdrawLiquidityForm"
import ClaimInterestForm from "./ClaimInterestForm"
import { formatUtilization, fromTvara } from "../../utils/conversions"
import BorrowersTable from "./BorrowersTable"
import { DollarSign, TrendingUp, Users, BarChart3, ArrowUpRight, LogOut } from "lucide-react"
import LoadingOverlay from "../common/LoadingOverlay"
import Button from "../common/Button"

export default function LenderDashboard() {
  const { account, publicKey, functions, txState, disconnectWallet, setDisconnectCallback } = useProgram()
  const [userInfo, setUserInfo] = useState(null)
  const [borrowers, setBorrowers] = useState({})
  const [util, setUtil] = useState(null)
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

  const refreshData = async () => {
    if (!account) return
    setLoading(true)
    try {
      const ui = await functions.getUserInfo()
      const br = await functions.getAllBorrowersInfo?.()
      const ur = (await functions.get_utilization_rate?.()) ?? (await functions.getUtilizationRate?.())
      if (ui) setUserInfo(ui)
      if (br) setBorrowers(br)
      if (ur) setUtil(ur)
      setLastUpdate(Date.now())
    } catch (e) {
      console.error("Failed to load lender data:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [account, txState.lastMsg])

  const liquidityValue = userInfo?.lender_balance ? fromTvara(userInfo.lender_balance) : 0
  const interestEarned = userInfo?.lender_interest_earned ? fromTvara(userInfo.lender_interest_earned) : 0
  const borrowerCount = Object.keys(borrowers).length
  const utilizationRate = util ? formatUtilization(util?.toString?.()) : "—"

  // Format public key for display (0x + first 4 + ... + last 4)
  const formatPublicKey = (pubKey) => {
    if (!pubKey) return ""
    return `${pubKey.slice(0, 6)}...${pubKey.slice(-4)}`
  }

  if (loading) {
    return <LoadingOverlay message="Loading lender dashboard..." />
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">Lender Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Connected: {formatPublicKey(publicKey)}</div>
              <Button variant="secondary" size="sm" onClick={disconnectWallet} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </Button>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Your Liquidity */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Your Liquidity</h3>
                  <p className="text-xs text-gray-500">TVARA Deposited</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">{liquidityValue.toFixed(2)}</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">TVARA</span>
              </div>
            </div>
          </div>

          {/* Interest Earned */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Interest Earned</h3>
                  <p className="text-xs text-gray-500">Total Returns</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">{interestEarned.toFixed(2)}</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">TVARA</span>
              </div>
            </div>
          </div>

          {/* Utilization Rate */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Utilization</h3>
                  <p className="text-xs text-gray-500">Pool Usage</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">{utilizationRate}</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
            </div>
          </div>

          {/* Active Borrowers */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Borrowers</h3>
                  <p className="text-xs text-gray-500">Active Users</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">{borrowerCount}</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
              <h3 className="text-lg font-semibold text-white">Provide Liquidity</h3>
              <p className="text-green-100 text-sm">Earn interest on deposits</p>
            </div>
            <div className="p-6">
              <ProvideLiquidityForm onSuccess={refreshData} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
              <h3 className="text-lg font-semibold text-white">Withdraw Liquidity</h3>
              <p className="text-blue-100 text-sm">Remove your deposits</p>
            </div>
            <div className="p-6">
              <WithdrawLiquidityForm onSuccess={refreshData} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
              <h3 className="text-lg font-semibold text-white">Claim Interest</h3>
              <p className="text-purple-100 text-sm">Collect your earnings</p>
            </div>
            <div className="p-6">
              <ClaimInterestForm onSuccess={refreshData} />
            </div>
          </div>
        </div>

        {/* Borrowers Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Active Borrowers</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Data</span>
            </div>
          </div>
          <BorrowersTable borrowers={borrowers} />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useNavigate } from "react-router-dom"
import { useProgram } from "../contexts/ProgramContext"
import { useEffect } from "react"
import { DollarSign, TrendingUp, Settings, ArrowRight, LogOut } from "lucide-react"
import Button from "../components/common/Button"

export default function OnboardingScreen({ isAdmin }) {
  const nav = useNavigate()
  const { account, publicKey, disconnectWallet, setDisconnectCallback } = useProgram()

  // Set up disconnect callback to redirect to dashboard
  useEffect(() => {
    setDisconnectCallback(() => {
      nav("/dashboard")
    })
  }, [nav, setDisconnectCallback])

  // Format public key for display (0x + first 4 + ... + last 4)
  const formatPublicKey = (pubKey) => {
    if (!pubKey) return ""
    return `${pubKey.slice(0, 6)}...${pubKey.slice(-4)}`
  }

  const roles = [
    {
      id: "lend",
      title: "Lender",
      subtitle: "Provide Liquidity",
      description:
        "Deposit TVARA tokens to earn interest from borrowers. Monitor utilization rates and track your earnings.",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      features: ["Earn Interest", "Low Risk", "Flexible Withdrawals"],
      action: () => nav("/lend"),
    },
    {
      id: "borrow",
      title: "Borrower",
      subtitle: "Access Liquidity",
      description:
        "Deposit TVARA as collateral and borrow VLT tokens. Monitor your health factor to avoid liquidation.",
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      features: ["66% LTV", "Flexible Repayment", "Health Monitoring"],
      action: () => nav("/borrow"),
    },
  ]

  // Only add admin role if user is admin
  if (isAdmin) {
    roles.push({
      id: "admin",
      title: "Administrator",
      subtitle: "Protocol Control",
      description:
        "Manage protocol settings, update price feeds, handle liquidations, and monitor all system activities.",
      icon: Settings,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      features: ["Price Updates", "Liquidations", "System Control"],
      action: () => nav("/admin"),
    })
  }

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
              <span className="text-xl font-bold text-gray-900">TrustLend</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Connected: {formatPublicKey(publicKey)}</div>
              <Button variant="secondary" size="sm" onClick={disconnectWallet} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Choose Your Role</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select how you'd like to interact with the TrustLend Protocol. Each role offers unique opportunities and
            benefits.
          </p>
        </div>

        {/* Role Cards */}
        <div className={`grid gap-8 ${isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-2 max-w-4xl mx-auto"}`}>
          {roles.map((role) => {
            const IconComponent = role.icon
            return (
              <div
                key={role.id}
                className={`bg-gradient-to-br ${role.bgColor} rounded-2xl border-2 ${role.borderColor} p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group`}
                onClick={role.action}
              >
                <div className="space-y-6">
                  {/* Icon and Title */}
                  <div className="space-y-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{role.title}</h3>
                      <p className="text-lg text-gray-600">{role.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed">{role.description}</p>

                  {/* Features */}
                  <div className="space-y-3">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${role.color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <div
                      className={`bg-gradient-to-r ${role.color} text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-between group-hover:shadow-lg transition-shadow`}
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Testnet Environment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Secure Transactions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>24/7 Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useProgram } from "../contexts/ProgramContext"
import Button from "../components/common/Button"
import { LogOut } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()
  const { account, publicKey, connectWallet, disconnectWallet, setDisconnectCallback } = useProgram()
  const [activeSection, setActiveSection] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)

  // Set up disconnect callback to stay on landing page
  useEffect(() => {
    setDisconnectCallback(() => {
      // Stay on landing page after disconnect
    })
  }, [setDisconnectCallback])

  const handleGetStarted = () => {
    if (account) {
      navigate("/dashboard")
    } else {
      connectWallet()
    }
  }

  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  // Track scroll position and active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)

      // Determine active section based on scroll position
      const sections = ["features", "how-it-works", "dashboards"]
      const sectionElements = sections.map((id) => ({
        id,
        element: document.getElementById(id),
        offset: document.getElementById(id)?.offsetTop || 0,
      }))

      const currentSection = sectionElements.find((section, index) => {
        const nextSection = sectionElements[index + 1]
        const sectionTop = section.offset - 100 // Offset for header height
        const sectionBottom = nextSection ? nextSection.offset - 100 : document.body.scrollHeight

        return scrollPosition >= sectionTop && scrollPosition < sectionBottom
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      } else if (scrollPosition < 300) {
        setActiveSection("")
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Format public key for display (0x + first 4 + ... + last 4)
  const formatPublicKey = (pubKey) => {
    if (!pubKey) return ""
    return `${pubKey.slice(0, 6)}...${pubKey.slice(-4)}`
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
            : "bg-white/80 backdrop-blur-md border-b border-gray-200"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <Link to="/" className="text-gray-900 hover:text-blue-600 transition-colors">
                <span className="text-xl font-bold text-gray-900">TrustLend</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {account && (
                <>
                  <div className="text-sm text-gray-500 hidden sm:block">Connected: {formatPublicKey(publicKey)}</div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={disconnectWallet}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Disconnect</span>
                  </Button>
                </>
              )}
              <div className="hidden md:block">
                <Button onClick={handleGetStarted} size="sm" className="shadow-lg hover:shadow-xl">
                  {account ? "Go to App" : "Connect Wallet"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Add padding to account for fixed header */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    🚀 Built on Vara Testnet
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">Borrow ↔ Lend ↔ Grow</h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    A First‑Class Defi Platform Built on Vara
                  </p>
                  <p className="text-lg text-gray-500">
                    No gate‑keepers. Trust‑minimized DeFi for borrowers and lenders with built‑in risk metrics like
                    Health Factor and dynamic interest. Web3 made simple.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-4 shadow-lg hover:shadow-xl">
                    {account ? "Launch App" : "Connect Wallet"}
                  </Button>
                  <Button variant="secondary" size="lg" className="text-lg px-8 py-4 shadow-lg hover:shadow-xl">
                    Try Demo
                  </Button>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live on Testnet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>66% Utilization Rate</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Protocol Stats</h3>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">$2.4M</div>
                        <div className="text-sm text-gray-600">Total Liquidity</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">156%</div>
                        <div className="text-sm text-gray-600">Avg Health Factor</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">6.2%</div>
                        <div className="text-sm text-gray-600">Current APY</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-600">342</div>
                        <div className="text-sm text-gray-600">Active Users</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Personas Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Choose Your Path</h2>
              <p className="text-xl text-gray-600">Three distinct roles, one powerful protocol</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Borrower */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 hover:shadow-lg transition-shadow">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">💰</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Borrower</h3>
                    <p className="text-gray-600 mb-4">Deposit TVARA → Borrow VLT → Track HF → Repay + Withdraw</p>
                    <div className="space-y-2 text-gray-600 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Collateral Management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Health Factor Monitoring</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Liquidation Protection</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => navigate("/borrow")}>
                    Start Borrowing
                  </Button>
                </div>
              </div>

              {/* Lender */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 hover:shadow-lg transition-shadow">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📈</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Lender</h3>
                    <p className="text-gray-600 mb-4">Provide Liquidity → Receive VFT → Claim Interest or Withdraw</p>
                    <div className="space-y-2 text-gray-600 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Earn Interest</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Utilization Tracking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Borrower Insights</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => navigate("/lend")}>
                    Start Lending
                  </Button>
                </div>
              </div>

              {/* Admin */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200 hover:shadow-lg transition-shadow">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">⚙️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Admin</h3>
                    <p className="text-gray-600 mb-4">Update Price → Pause → Liquidate → Monitor All Borrowers</p>
                    <div className="space-y-2 text-gray-600 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Price Feed Control</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Protocol Management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Liquidation Tools</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => navigate("/admin")}>
                    Admin Panel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-white bg-white scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Key Features</h2>
              <p className="text-xl text-gray-600">Built for security, designed for simplicity</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📌</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Borrow with Confidence</h3>
                <p className="text-gray-600">
                  Lock TVARA as collateral, borrow VLT at safe LTV (≈66%), repay at any time
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Earn Interest</h3>
                <p className="text-gray-600">
                  Provide liquidity to earn real interest and claim via VFT or withdrawal flows
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Risk Metrics</h3>
                <p className="text-gray-600">
                  Health Factor updates with your debt and collateral balance, dynamically
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🛠</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Panel</h3>
                <p className="text-gray-600">
                  Pause protocol, update price, withdraw funds, and liquidate risky positions
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety-first Architecture</h3>
                <p className="text-gray-600">Full secure logic, no middleware trust, clear liquidation thresholds</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dynamic Interest</h3>
                <p className="text-gray-600">
                  Interest rates adjust based on utilization, ensuring optimal capital efficiency
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white dark:bg-white scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">How It Works</h2>
              <p className="text-xl text-gray-600">Simple steps to start borrowing or lending</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Deposit TVARA Collateral</h3>
                    <p className="text-gray-600">
                      Connect your wallet and deposit TVARA tokens as collateral to secure your loan
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Borrow VLT (up to 66% LTV)</h3>
                    <p className="text-gray-600">
                      Borrow VLT tokens against your collateral with a safe loan-to-value ratio
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitor Health Factor</h3>
                    <p className="text-gray-600">Keep track of your position's health. Stay above 150% for safety</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Repay & Withdraw</h3>
                    <p className="text-gray-600">Repay your loan anytime and withdraw your collateral safely</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 text-center">Safety Metrics</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">✅</span>
                        <div>
                          <div className="font-semibold text-green-800">Safe Buffer</div>
                          <div className="text-sm text-green-600">HF ≥ 150%</div>
                        </div>
                      </div>
                      <div className="text-green-800 font-bold">SAFE</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-100 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <div className="font-semibold text-yellow-800">Warning Zone</div>
                          <div className="text-sm text-yellow-600">120-150% HF</div>
                        </div>
                      </div>
                      <div className="text-yellow-800 font-bold">AT RISK</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-100 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🚨</span>
                        <div>
                          <div className="font-semibold text-red-800">Liquidation Zone</div>
                          <div className="text-sm text-red-600">HF &lt; 120%</div>
                        </div>
                      </div>
                      <div className="text-red-800 font-bold">LIQUIDATABLE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboards Preview */}
        <section id="dashboards" className="py-20 bg-gray-50 bg-white dark:bg-white scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Dashboard Previews</h2>
              <p className="text-xl text-gray-600">Intuitive interfaces for every user type</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Borrower Dashboard Preview */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Borrower Dashboard</h3>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">12.5</div>
                      <div className="text-sm text-gray-600">Collateral (TVARA)</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">8.2</div>
                      <div className="text-sm text-gray-600">Debt (VLT)</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">152%</div>
                      <div className="text-sm text-gray-600">Health Factor</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Deposit</button>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Borrow
                    </button>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Repay</button>
                  </div>
                </div>
              </div>

              {/* Lender Dashboard Preview */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Lender Dashboard</h3>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">25.8</div>
                      <div className="text-sm text-gray-600">Your Liquidity</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">66%</div>
                      <div className="text-sm text-gray-600">Utilization Rate</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Active Borrowers</span>
                      <span className="text-sm text-gray-600">24</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Lend</button>
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Everything you need to know about TrustLend Protocol</p>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How do I show real-time data like health factor?
                </h3>
                <p className="text-gray-600">
                  The protocol fetches live data from your deployed program via the ProgramContext API—using
                  getUserInfo, getUtilizationRate, and utility functions bound to React state.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I customize branding & flows?</h3>
                <p className="text-gray-600">
                  Yes—you can edit React/JSX directly. Customize color palette, replace icons with your preferred
                  branding, and modify user flows as needed.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What if users change chain or wallet?</h3>
                <p className="text-gray-600">
                  The ProgramContext handles disconnection/reconnection seamlessly. The interface remains responsive
                  even if users change pages or wallet status.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What are the liquidation rules?</h3>
                <p className="text-gray-600">
                  Positions with Health Factor below 120% can be liquidated by admins. We recommend maintaining HF ≥
                  150% for safety against market volatility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-white">Ready to Get Started?</h2>
                <p className="text-xl text-blue-100">Join the future of decentralized lending on Vara</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg hover:shadow-xl"
                >
                  {account ? "Launch App" : "Connect Wallet"}
                </Button>
              </div>

              <div className="flex justify-center items-center space-x-8 text-blue-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Testnet Live</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Open Source</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-bold">TrustLend</span>
                </div>
                <p className="text-gray-400">Decentralized lending made simple on Vara Network</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live on Testnet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Open Source</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Protocol Features</h3>
                <div className="space-y-2 text-gray-400">
                  <div>Collateralized Lending</div>
                  <div>Dynamic Interest Rates</div>
                  <div>Health Factor Monitoring</div>
                  <div>Automated Liquidations</div>
                  <div>Real-time Risk Metrics</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Getting Started</h3>
                <div className="space-y-2 text-gray-400">
                  <div>Connect SubWallet</div>
                  <div>Get TVARA Testnet Tokens</div>
                  <div>Choose Your Role</div>
                  <div>Start Lending or Borrowing</div>
                  <div>Monitor Your Position</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 TrustLend. Built on Vara Network.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

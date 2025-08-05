import { useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import Button from "./Button"

export default function TransactionModal({ isOpen, onClose, transaction }) {
  // Auto-close modal after 10 seconds for success, keep open for errors
  useEffect(() => {
    if (isOpen && transaction?.status === "success") {
      const timer = setTimeout(() => {
        onClose()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, transaction?.status, onClose])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !transaction) return null

  const getStatusConfig = () => {
    switch (transaction.status) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Transaction Successful",
          titleColor: "text-green-800"
        }
      case "error":
        return {
          icon: XCircle,
          iconColor: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Transaction Failed",
          titleColor: "text-red-800"
        }
      default:
        return {
          icon: AlertCircle,
          iconColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          title: "Transaction Status",
          titleColor: "text-yellow-800"
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md mx-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <h3 className={`text-lg font-semibold ${config.titleColor}`}>{config.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Transaction Action */}
          {transaction.action && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Action</h4>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 font-mono">
                {transaction.action}
              </p>
            </div>
          )}

          {/* Message */}
          {transaction.message && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Details</h4>
              <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
                <p className={`text-sm ${config.titleColor}`}>{transaction.message}</p>
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          {transaction.hash && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Transaction Hash</h4>
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 font-mono break-all">
                {transaction.hash}
              </p>
            </div>
          )}

          {/* Timestamp */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Time</h4>
            <p className="text-sm text-gray-600">
              {new Date(transaction.timestamp || Date.now()).toLocaleString()}
            </p>
          </div>

          {/* Additional Info for specific actions */}
          {transaction.additionalInfo && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Additional Information</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                {Object.entries(transaction.additionalInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-1">
                    <span className="text-sm font-medium text-blue-800 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-sm text-blue-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="primary">
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
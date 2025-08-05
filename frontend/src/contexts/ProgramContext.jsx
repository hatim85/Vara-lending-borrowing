import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { GearApi } from "@gear-js/api"
import { SailsProgram } from "../contracts/lib"
import { web3Enable, web3Accounts, web3FromSource } from "@polkadot/extension-dapp"
import { decodeAddress } from "@polkadot/util-crypto"
import { u8aToHex } from "@polkadot/util"

const NODE_ENDPOINT = "wss://testnet.vara.network"
const PROGRAM_ID = "0x5ca0101c2c1ff66129fa89eb9ceb04138ab49979a70f8149bc4836e2616553d6"

// LocalStorage keys
const WALLET_STORAGE_KEY = "trustlend_wallet_connection"

const ProgramContext = createContext()
export const useProgram = () => useContext(ProgramContext)

export function ProgramProvider({ children }) {
  // Store both SS58 address and public key format
  const [account, setAccount] = useState(null) // SS58 format
  const [publicKey, setPublicKey] = useState(null) // Hex format (0x...)
  const [source, setSource] = useState(null)
  const [gear, setGear] = useState({ api: null, program: null })
  const [txState, setTxState] = useState({
    busy: false,
    action: null, // Track which action is being performed
  })
  const [transactionResult, setTransactionResult] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isWalletLoading, setIsWalletLoading] = useState(true) // New state to track wallet loading
  const [onDisconnectCallback, setOnDisconnectCallback] = useState(null)

  // Initialize on-chain API once
  useEffect(() => {
    ;(async () => {
      try {
        const api = await GearApi.create({ providerAddress: NODE_ENDPOINT })
        const program = new SailsProgram(api, PROGRAM_ID)
        setGear({ api, program })
      } catch (err) {
        console.error("🚨 Failed to initialize Gear API:", err)
      }
    })()
  }, [])

  // Load wallet connection from localStorage on app start
  useEffect(() => {
    const loadStoredConnection = async () => {
      setIsWalletLoading(true)
      try {
        const storedConnection = localStorage.getItem(WALLET_STORAGE_KEY)
        if (storedConnection) {
          const {
            account: storedAccount,
            publicKey: storedPublicKey,
            source: storedSource,
          } = JSON.parse(storedConnection)

          // Always restore the stored connection first
          setAccount(storedAccount)
          setPublicKey(storedPublicKey)
          setSource(storedSource)
          console.log("✅ Wallet connection restored from storage", { storedAccount, storedPublicKey })

          // Then verify the extension is still available (optional verification)
          try {
            const extensions = await web3Enable("trustlend-dapp")
            if (extensions && extensions.length > 0) {
              const accounts = await web3Accounts()
              const accountExists = accounts.find((acc) => acc.address === storedAccount)

              if (!accountExists) {
                console.log("⚠️ Stored account no longer exists in extension")
                // Don't clear storage immediately, user might reconnect
              }
            }
          } catch (error) {
            console.log("⚠️ Extension verification failed, but keeping stored connection")
          }
        }
      } catch (error) {
        console.error("Failed to load stored wallet connection:", error)
        localStorage.removeItem(WALLET_STORAGE_KEY)
      } finally {
        setIsWalletLoading(false)
        setIsInitialized(true)
      }
    }

    loadStoredConnection()
  }, [])

  // Save wallet connection to localStorage
  const saveConnectionToStorage = useCallback((account, publicKey, source) => {
    try {
      const connectionData = {
        account,
        publicKey,
        source,
        timestamp: Date.now(),
      }
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(connectionData))
      console.log("💾 Wallet connection saved to storage")
    } catch (error) {
      console.error("Failed to save wallet connection:", error)
    }
  }, [])

  // Clear wallet connection from localStorage
  const clearConnectionFromStorage = useCallback(() => {
    try {
      localStorage.removeItem(WALLET_STORAGE_KEY)
      console.log("🗑️ Wallet connection cleared from storage")
    } catch (error) {
      console.error("Failed to clear wallet connection:", error)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      const extensions = await web3Enable("trustlend-dapp")
      if (!extensions || extensions.length === 0) {
        alert("⚠️ No wallet extension found (e.g. Polkadot.js). Install one and refresh.")
        return
      }

      const all = await web3Accounts()
      if (!all.length) {
        alert("⚠️ Your extension has no accounts. Please create one.")
        return
      }

      const a = all[0] // pick first
      const ss58Address = a.address

      // Convert SS58 to public key hex format
      const publicKeyU8a = decodeAddress(ss58Address)
      const publicKeyHex = u8aToHex(publicKeyU8a).toLowerCase()

      const sourceValue = a.meta.source || "polkadot-js"

      // Update state
      setAccount(ss58Address)
      setPublicKey(publicKeyHex)
      setSource(sourceValue)

      // Save to localStorage
      saveConnectionToStorage(ss58Address, publicKeyHex, sourceValue)

      console.log("✅ Wallet connected successfully")
    } catch (err) {
      console.error("🚨 web3Enable error:", err)
      alert("Failed to connect: " + (err.message ?? err))
    }
  }, [saveConnectionToStorage])

  const disconnectWallet = useCallback(() => {
    // Clear state
    setAccount(null)
    setPublicKey(null)
    setSource(null)
    setTxState({
      busy: false,
      action: null,
    })

    // Clear localStorage
    clearConnectionFromStorage()

    console.log("🔌 Wallet disconnected")

    // Call the disconnect callback if set (for navigation)
    if (onDisconnectCallback) {
      onDisconnectCallback()
    }
  }, [clearConnectionFromStorage, onDisconnectCallback])

  // Function to set disconnect callback
  const setDisconnectCallback = useCallback((callback) => {
    setOnDisconnectCallback(() => callback)
  }, [])

  const callTx = useCallback(
    async (fnName, args = [], value = 0n) => {
      if (!gear.program) throw new Error("❌ Gear API not ready")
      if (!account || !source) throw new Error("❌ Wallet not connected")

      setTxState({ busy: true, action: fnName })
      setTransactionResult(null)

      try {
        const injector = await web3FromSource(source)
        const msg = gear.program.lendingService[fnName](...args).withAccount(account, { signer: injector.signer })

        if (value > 0n) msg.withValue(value)

        await msg.calculateGas(true, 10)

        const { msgId, response, isFinalized } = await msg.signAndSend()

        await isFinalized
        await response()

        // Create user-friendly success message
        const actionMessages = {
          lend: "Liquidity provided successfully! Your funds are now earning interest.",
          withdraw: "Liquidity withdrawn successfully! Funds have been returned to your wallet.",
          claimInterest: "Interest claimed successfully! Earnings have been transferred to your wallet.",
          depositCollateral: "Collateral deposited successfully! You can now borrow against this collateral.",
          borrow: "VLT borrowed successfully! Monitor your health factor to avoid liquidation.",
          repay: "Debt repaid successfully! Your health factor has improved.",
          withdrawCollateral: "Collateral withdrawn successfully! Funds have been returned to your wallet.",
          pause: "Protocol paused successfully! All operations are now suspended.",
          resume: "Protocol resumed successfully! All operations are now active.",
          liquidate: "Position liquidated successfully! Collateral has been seized.",
          updateTvaraPrice: "TVARA price updated successfully! New price is now active.",
          adminWithdrawFunds: "Funds withdrawn successfully! Amount transferred to admin wallet.",
          adminWithdrawTreasury: "Treasury funds withdrawn successfully! Amount transferred to admin wallet.",
        }

        const successMessage = actionMessages[fnName] || `Transaction completed successfully!`

        setTransactionResult({
          status: "success",
          action: fnName,
          message: successMessage,
          hash: msgId,
          timestamp: Date.now(),
        })

        setTxState({
          busy: false,
          action: null,
        })

        return msgId
      } catch (err) {
        const errorMsg = err?.message ?? String(err)

        // Create user-friendly error messages
        let friendlyError = errorMsg
        const additionalInfo = {}

        if (errorMsg.includes("InsufficientBalance")) {
          friendlyError = "Insufficient balance to complete this transaction."
          additionalInfo.suggestion = "Check your wallet balance and try again."
        } else if (errorMsg.includes("Unauthorized")) {
          friendlyError = "You are not authorized to perform this action."
          additionalInfo.suggestion = "Make sure you're using the correct admin account."
        } else if (errorMsg.includes("Paused")) {
          friendlyError = "Protocol is currently paused. Please try again later."
          additionalInfo.suggestion = "Wait for the protocol to be resumed by the administrator."
        } else if (errorMsg.includes("HealthFactorTooLow")) {
          friendlyError = "Health factor too low. Add more collateral or repay debt first."
          additionalInfo.suggestion = "Maintain a health factor above 150% for safety."
        } else if (errorMsg.includes("InsufficientCollateral")) {
          friendlyError = "Insufficient collateral for this operation."
          additionalInfo.suggestion = "Deposit more collateral before borrowing."
        } else if (errorMsg.includes("NoDebt")) {
          friendlyError = "No debt to repay."
          additionalInfo.suggestion = "You don't have any outstanding debt."
        } else if (errorMsg.includes("NoCollateral")) {
          friendlyError = "No collateral available to withdraw."
          additionalInfo.suggestion = "Deposit collateral first before attempting to withdraw."
        } else if (errorMsg.includes("NoInterest")) {
          friendlyError = "No interest available to claim."
          additionalInfo.suggestion = "Interest accrues over time from lending activities."
        }

        setTransactionResult({
          status: "error",
          action: fnName,
          message: friendlyError,
          timestamp: Date.now(),
          additionalInfo: Object.keys(additionalInfo).length > 0 ? additionalInfo : null,
        })

        setTxState({
          busy: false,
          action: null,
        })
        throw err
      }
    },
    [account, source, gear],
  )

  const actorHex = publicKey // Use the stored public key

  const functions = {
    // Lender
    lend: (_, amount = 0n) => callTx("lend", [], BigInt(amount)),
    withdraw: (amount) => callTx("withdraw", [BigInt(amount)]),
    claimInterest: () => callTx("claimInterest"),
    // Borrower
    depositCollateral: (amount) => callTx("depositCollateral", [], BigInt(amount)),
    borrow: () => callTx("borrow"),
    repay: (amount) => callTx("repay", [actorHex, BigInt(amount)]),
    withdrawCollateral: (amount) => callTx("withdrawCollateral", [actorHex, BigInt(amount)]),
    // Admin
    pause: () => callTx("pause"),
    resume: () => callTx("resume"),
    liquidate: (hexTarget) => callTx("liquidate", [hexTarget]),
    updateTvaraPrice: (price) => callTx("updateTvaraPrice", [BigInt(price)]),
    adminWithdrawFunds: (amt) => callTx("adminWithdrawFunds", [BigInt(amt)]),
    adminWithdrawTreasury: (amt) => callTx("adminWithdrawTreasury", [BigInt(amt)]),
    // Views
    getAdmin: async () => {
      try {
        return await gear.program?.lendingService.getAdmin()
      } catch (error) {
        console.error("Failed to get admin:", error)
        // Retry once after a short delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        try {
          return await gear.program?.lendingService.getAdmin()
        } catch (retryError) {
          console.error("Admin check retry failed:", retryError)
          throw retryError
        }
      }
    },
    getUserInfo: () => gear.program?.lendingService.getUserInfo(actorHex),
    getAllBorrowersInfo: () => gear.program?.lendingService.getAllBorrowersInfo(),
    getUtilizationRate: () => gear.program?.lendingService.getUtilizationRate(),
    getTvaraPrice: () => gear.program?.lendingService.getTvaraPrice(),
    getHealthFactor: () => gear.program?.lendingService.getHealthFactor(actorHex),
    getTotalLiquidity: () => gear.program?.lendingService.getLiquidity(),
    getTreasuryBalance: () => gear.program?.lendingService.getTreasuryBalance(),
  }

  const clearTransactionResult = useCallback(() => {
    setTransactionResult(null)
  }, [])

  return (
    <ProgramContext.Provider
      value={{
        account,
        publicKey,
        gear,
        connectWallet,
        disconnectWallet,
        setDisconnectCallback,
        txState,
        functions,
        isInitialized,
        isWalletLoading, // Expose wallet loading state
        transactionResult,
        clearTransactionResult,
      }}
    >
      {children}
    </ProgramContext.Provider>
  )
}

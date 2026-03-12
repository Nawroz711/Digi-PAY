import { LogOut, ScanLine, Search, Wallet, X } from 'lucide-react'
import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import QRCode from 'react-qr-code'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function AuthHeader() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [qrMode, setQrMode] = useState('qr')
  const [scannedAccount, setScannedAccount] = useState('')
  const avatarChar = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()
  const accountNumber = user?.accountNumber || ''

  const handleLogout = () => {
    logout()
    navigate('/signin', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#121317]/75 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link to="/dashboard" className="logo shrink-0 text-2xl sm:text-[30px]">
            DigiPay
          </Link>

          <div className="relative w-36 sm:w-48 md:w-64 lg:w-72">
            <Search
              size={16}
              strokeWidth={1.25}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full rounded-lg border border-slate-700 bg-secondary py-2 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/wallet"
            title="Wallet"
            className="cursor-pointer rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-primary hover:text-primary"
          >
            <Wallet size={16} strokeWidth={1.25} />
          </Link>
          <button
            type="button"
            title="Scan"
            onClick={() => {
              setQrMode('qr')
              setScannedAccount('')
              setShowQrDialog(true)
            }}
            className="cursor-pointer rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-primary hover:text-primary"
          >
            <ScanLine size={16} strokeWidth={1.25} />
          </button>
          <Link to="/profile">
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-sm font-semibold text-dark">
              {avatarChar}
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="cursor-pointer rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-primary hover:text-primary"
          >
            <LogOut size={16} strokeWidth={1.25} />
          </button>
        </div>
      </div>

      {showQrDialog && (
        <div
          className="fixed inset-0 z-[9999] grid place-items-center bg-black/70 p-4"
          onClick={() => setShowQrDialog(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-700 bg-secondary p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Scan Account QR</h2>
              <button
                type="button"
                onClick={() => setShowQrDialog(false)}
                className="rounded-full p-1 text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {accountNumber ? (
              <>
                <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-[#1c1d22] p-1">
                  <button
                    type="button"
                    onClick={() => setQrMode('qr')}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                      qrMode === 'qr' ? 'bg-primary text-dark' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Show QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrMode('scan')}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                      qrMode === 'scan' ? 'bg-primary text-dark' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Scan
                  </button>
                </div>

                {qrMode === 'qr' ? (
                  <>
                    <div className="mx-auto w-fit rounded-lg bg-white p-3">
                      <QRCode value={accountNumber} size={190} />
                    </div>
                    <p className="mt-4 text-center text-sm text-slate-300">Scan to get account number</p>
                  </>
                ) : (
                  <div className="rounded-lg border border-slate-700 bg-[#1c1d22] p-4">
                    <p className="text-sm text-slate-300">Scan another user QR code:</p>
                    <div className="mt-3 overflow-hidden rounded-lg border border-slate-700 bg-[#111216]">
                      <Scanner
                        onScan={(detectedCodes) => {
                          const codeValue = detectedCodes?.[0]?.rawValue || ''
                          if (codeValue) {
                            setScannedAccount(codeValue)
                          }
                        }}
                        onError={() => {}}
                        constraints={{ facingMode: 'environment' }}
                        styles={{
                          container: { width: '100%' },
                          video: { width: '100%', height: '220px', objectFit: 'cover' },
                        }}
                      />
                    </div>

                    <div className="mt-3 rounded-md border border-slate-700 bg-[#111216] px-3 py-2.5">
                      <p className="text-xs text-slate-400">Scanned account number</p>
                      <p className="mt-1 break-all text-sm font-medium text-primary">
                        {scannedAccount || 'No QR scanned yet'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-300">No account number available.</p>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

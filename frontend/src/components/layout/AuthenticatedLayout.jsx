import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthHeader from './AuthHeader'
import { 
  Download, 
  Upload, 
  ScanLine, 
  Settings, 
  Smartphone, 
  Wallet,
  X ,
  ToolCase
} from 'lucide-react'
import { Scanner } from '@yudiel/react-qr-scanner'
import QRCode from 'react-qr-code'
import { useAuthStore } from '../../store/authStore'

const dockMenus = [
  { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
  { id: 'send', label: 'Send', icon: Upload, path: '/send' },
  { id: 'receive', label: 'Receive', icon: Download, path: '/receive' },
  { id: 'scan', label: 'Scan', icon: ScanLine, type: 'action' },
  { id: 'topup', label: 'Top Up', icon: Smartphone, path: '/topup' },
  { id: 'tools', label: 'Tools', icon: ToolCase, path: '/tools' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

export default function AuthenticatedLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [activeMenu, setActiveMenu] = useState('wallet')
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [qrMode, setQrMode] = useState('qr')
  const [scannedAccount, setScannedAccount] = useState('')

  const handleMenuClick = (menu) => {
    if (menu.type === 'action') {
      // Open QR dialog for scan
      setQrMode('qr')
      setScannedAccount('')
      setShowQrDialog(true)
    } else {
      setActiveMenu(menu.id)
      if (menu.path) {
        navigate(menu.path)
      }
    }
  }

  const handleScanResult = (account) => {
    setScannedAccount(account)
    // Navigate to send page with scanned account
    navigate(`/send?to=${account}`)
    setShowQrDialog(false)
  }

  const accountNumber = user?.accountNumber || ''

  return (
    <>
      <AuthHeader />
      <Outlet />
      
      {/* Dock Menu - Visible on all pages */}
      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-white/10 bg-[#1e1f24]/85 px-3 py-1.5 shadow-2xl backdrop-blur-sm sm:bottom-6">
        <ul className="flex items-center justify-center gap-1 overflow-x-auto no-scrollbar">
          {dockMenus.map((menu) => {
            const Icon = menu.icon
            const isActive = activeMenu === menu.id

            return (
              <li key={menu.id} className="min-w-[55px] sm:min-w-[65px]">
                <button
                  type="button"
                  onClick={() => handleMenuClick(menu)}
                  className={`cursor-pointer relative flex w-full flex-col items-center rounded-xl px-2 py-1.5 transition duration-200 ease-out ${isActive ? 'bg-primary text-dark shadow-md shadow-primary/30' : 'text-slate-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white'}`}
                >
                  <Icon size={22} strokeWidth={1.3} />
                  <span className="mt-0.5 text-[10px] font-medium sm:text-[11px]">{menu.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* QR Dialog */}
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
                        onScan={(result) => {
                          if (result && result[0]?.rawValue) {
                            handleScanResult(result[0].rawValue)
                          }
                        }}
                        onError={(error) => {
                          console.log('Scanner error:', error)
                        }}
                        allowMultiple={true}
                        scanDelay={1000}
                        constraints={{
                          facingMode: 'environment',
                          width: { min: 320, ideal: 640, max: 1920 },
                          height: { min: 240, ideal: 480, max: 1080 }
                        }}
                        styles={{
                          container: { width: '100%' },
                          video: { width: '100%', borderRadius: '8px' }
                        }}
                      />
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
    </>
  )
}

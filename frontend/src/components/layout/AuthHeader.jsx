import { LogOut, Search, Wallet, X, Bell, Check, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import QRCode from 'react-qr-code'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotification'

export default function AuthHeader() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [qrMode, setQrMode] = useState('qr')
  const [scannedAccount, setScannedAccount] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  
  const notificationRef = useRef(null)
  
  // Notification hooks
  const { data: notificationData, isLoading: notificationsLoading } = useNotifications({ limit: 10 })
  const { data: unreadData } = useUnreadCount()
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const deleteNotificationMutation = useDeleteNotification()
  
  const notifications = notificationData?.data || []
  const unreadCount = unreadData?.count || 0
  
  const avatarChar = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()
  const accountNumber = user?.accountNumber || ''

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/signin', { replace: true })
  }

  const handleMarkAsRead = async (id) => {
    await markAsReadMutation.mutateAsync(id)
  }

  const handleMarkAllRead = async () => {
    await markAllAsReadMutation.mutateAsync()
  }

  const handleDeleteNotification = async (id) => {
    await deleteNotificationMutation.mutateAsync(id)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#121317]/75 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link to="/wallet" className="logo shrink-0 text-2xl sm:text-[30px]">
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
          {/* Notifications Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              className="cursor-pointer relative rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-primary hover:text-primary"
            >
              <Bell size={16} strokeWidth={1.25} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 rounded-xl border border-slate-700 bg-secondary shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-700 p-3">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-slate-400">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`flex items-start gap-3 border-b border-slate-700/50 p-3 transition hover:bg-white/5 ${
                          !notification.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-white' : 'text-slate-300'}`}>
                            {notification.title}
                          </p>
                          <p className="truncate text-xs text-slate-400">{notification.message}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(notification.createdAt)}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-primary"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/wallet"
            title="Wallet"
            className="cursor-pointer rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-primary hover:text-primary"
          >
            <Wallet size={16} strokeWidth={1.25} />
          </Link>
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

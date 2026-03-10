import { useProfile } from '../../hooks/useProfile'

export default function Profile() {
  const {
    user,
    formData,
    confirmName,
    isLoading,
    isSaving,
    isVerifying,
    isDeleting,
    handleChange,
    handleSubmit,
    setConfirmName,
    handleVerifyPhone,
    handleDeleteAccount,
    showOtpModal,
    otp,
    setOtp,
    handleVerifyOTP,
    handleCloseOtpModal,
  } = useProfile()

  return (
    <main className="min-h-screen bg-dark px-4 pb-16 pt-6 sm:px-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-700 bg-secondary p-5 shadow-xl sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">My Profile</h1>
            <p className="mt-1 text-sm text-slate-300">Manage your profile information.</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${user?.verified
                ? 'bg-primary/20 text-primary'
                : 'bg-red-500/15 text-red-300'
              }`}
          >
            {user?.verified ? 'Verified' : 'Not verified'}
          </span>
        </div>

        {!isLoading && !user?.verified && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Account not verified. Please verify your phone number.
          </div>
        )}

        {isLoading ? (
          <p className="mt-6 text-sm text-slate-400">Loading profile...</p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-700 bg-[#121212] px-3 py-2.5 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-md border border-slate-700 bg-[#1b1b1b] px-3 py-2.5 text-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={user?.verified}
                className="w-full rounded-md border border-slate-700 bg-[#121212] px-3 py-2.5 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={user?.verified ? formData.phone : 'Enter phone number'}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="mt-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-dark transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>

              {!user?.verified && (
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  disabled={isVerifying}
                  className="mt-2 rounded-md border border-primary/60 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isVerifying ? 'Verifying...' : 'Verify phone'}
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-secondary p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white">Verify Phone Number</h2>
            <p className="mt-2 text-sm text-slate-300">
              Enter the 6-digit code sent to your phone number: {formData.phone}
            </p>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="otp">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-md border border-slate-700 bg-[#121212] px-3 py-2.5 text-center text-2xl font-bold tracking-widest text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCloseOtpModal}
                className="flex-1 rounded-md border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={isVerifying || otp.length !== 6}
                className="flex-1 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-dark transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && (
        <section className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-red-500/30 bg-[#2a1313] p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-red-300">Danger Zone</h2>
          <p className="mt-2 text-sm text-red-200/90">
            Delete your account permanently. Type your full name exactly to confirm.
          </p>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-red-200" htmlFor="confirmName">
              Type your name
            </label>
            <input
              id="confirmName"
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              className="w-full rounded-md border border-red-500/30 bg-[#1d0f0f] px-3 py-2.5 text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
              placeholder={user?.name || 'Your full name'}
            />
          </div>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="mt-4 rounded-md bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? 'Deleting...' : 'Delete account'}
          </button>
        </section>
      )}
    </main>
  )
}

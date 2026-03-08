import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function SignUp() {
  const { formData, error, isSubmitting, handleChange, handleSubmit } = useAuth('signup')

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark px-6 py-12">
      <section className="w-full max-w-md rounded-2xl bg-secondary p-8 shadow ring-1 ring-slate-800">
        <div className="logo text-center">DigiPay</div>
        <h1 className="mt-4 text-center text-3xl font-bold tracking-tight text-white">Create account</h1>
        <p className="mt-2 text-center text-sm text-slate-300">Start using Digi-PAY in seconds.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-200">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-[#0f0f0f] px-3.5 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-[#0f0f0f] px-3.5 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-[#0f0f0f] px-3.5 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-200">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-[#0f0f0f] px-3.5 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Re-enter password"
            />
          </div>

          {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-dark shadow-lg shadow-primary/25 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-primary underline decoration-2 underline-offset-2">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}

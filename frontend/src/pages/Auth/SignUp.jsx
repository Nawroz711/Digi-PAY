import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function SignUp() {
  const { formData, error, isSubmitting, handleChange, handleSubmit } = useAuth('signup')

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark px-6 py-12">
      <section className="w-full max-w-sm">
        <p className="logo">DigiPay!</p>
        <p className="mt-2 center text-sm text-slate-300">Create your account</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-thin text-gray-400">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-sm bg-secondary px-3.5 py-2.5 text-white outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-thin text-gray-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-sm bg-secondary px-3.5 py-2.5 text-white outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-thin text-gray-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-sm bg-secondary px-3.5 py-2.5 text-white outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Minimum 6 characters"
            />  
          </div>

          {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-dark  disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-primary underline decoration-2 underline-offset-2">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}

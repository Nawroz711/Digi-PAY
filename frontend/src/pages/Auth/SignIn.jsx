import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function SignIn() {
    const { formData, error, isSubmitting, handleChange, handleSubmit } = useAuth('signin')

    return (
        <main className="flex min-h-screen items-center justify-center px-6 py-12 bg-dark">
            <section className="w-full max-w-sm rounded-2xl">
                <p className="logo">DigiPay!</p>
                <p className="mt-2 text-sm text-slate-300">Sign in to continue to DigiPay.</p>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
                            className="w-full rounded-sm  bg-secondary px-3.5 py-2.5 text-white outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/30"
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
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 w-full rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-dark cursor-pointer transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-sm bg-none border border-secondary text-gray-400 px-4 py-2.5 text-sm font-semibold text-dark cursor-pointer transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Continue with Google
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-300">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="font-medium text-primary underline decoration-2 underline-offset-2">
                        Create one
                    </Link>
                </p>
            </section>
        </main>
    )
}

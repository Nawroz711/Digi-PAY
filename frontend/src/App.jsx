function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Tailwind is configured</h1>
        <p className="mt-3 text-slate-600">
          You can now use utility classes across your components.
        </p>
        <p className="mt-6 rounded-lg bg-slate-900 px-4 py-3 text-sm text-slate-100">
          Axios client: <code>src/lib/axiosClient.js</code>
        </p>
      </div>
    </main>
  )
}

export default App

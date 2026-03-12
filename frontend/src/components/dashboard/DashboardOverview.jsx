export default function DashboardOverview({ wallet }) {
  const weeklyData = [
    { day: 'Mon', value: 38, amount: '$420' },
    { day: 'Tue', value: 55, amount: '$680' },
    { day: 'Wed', value: 44, amount: '$510' },
    { day: 'Thu', value: 72, amount: '$930' },
    { day: 'Fri', value: 60, amount: '$770' },
    { day: 'Sat', value: 66, amount: '$820' },
    { day: 'Sun', value: 49, amount: '$590' },
  ]

  const balance = wallet?.balance ?? 0

  return (
    <section className="mx-auto mt-6 grid w-full max-w-6xl gap-4 sm:gap-5 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-700 bg-secondary p-4 sm:p-5 lg:col-span-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Account</p>
        <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">${balance.toFixed(2)}</h2>
        <p className="mt-1 text-sm text-slate-300">Available balance</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#1f1f23] p-3">
            <p className="text-xs text-slate-400">Income</p>
            <p className="mt-1 text-lg font-semibold text-primary">+$2,140</p>
          </div>
          <div className="rounded-xl bg-[#1f1f23] p-3">
            <p className="text-xs text-slate-400">Expenses</p>
            <p className="mt-1 text-lg font-semibold text-white">-$1,340</p>
          </div>
          <div className="rounded-xl bg-[#1f1f23] p-3">
            <p className="text-xs text-slate-400">Savings</p>
            <p className="mt-1 text-lg font-semibold text-white">$800</p>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-700 bg-secondary p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Card</p>
        <div className="mt-3 rounded-2xl bg-gradient-to-r from-[#222327] to-[#15161a] p-4 ring-1 ring-slate-700">
          <p className="text-xs text-slate-300">DigiPay Virtual</p>
          <p className="mt-6 text-base tracking-[0.25em] text-white">**** **** **** 2480</p>
          <p className="mt-4 text-xs text-slate-400">VALID THRU 06/29</p>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-700 bg-secondary p-4 sm:p-5 lg:col-span-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Weekly Activity</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-slate-300">Last 7 days incoming trend</p>
          <p className="text-xs font-medium text-primary">+14.8%</p>
        </div>
        <div className="mt-5 flex h-44 items-end justify-between gap-2">
          {weeklyData.map((item) => (
            <div key={item.day} className="flex w-full flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-primary/85 transition duration-300 hover:bg-primary"
                style={{ height: `${item.value}%` }}
              />
              <span className="text-[10px] text-slate-400">{item.day}</span>
              <span className="text-[9px] text-slate-500">{item.amount}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-700 bg-secondary p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recent</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center justify-between text-slate-300">
            <span>Top up</span>
            <span className="text-primary">+$200</span>
          </li>
          <li className="flex items-center justify-between text-slate-300">
            <span>Electric bill</span>
            <span>-$84</span>
          </li>
          <li className="flex items-center justify-between text-slate-300">
            <span>Salary</span>
            <span className="text-primary">+$1,450</span>
          </li>
        </ul>
      </article>
    </section>
  )
}

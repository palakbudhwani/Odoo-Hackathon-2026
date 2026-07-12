import Link from 'next/link'

export default function Home() {
  return (
    <div className="container py-14">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-200">Smart Fleet Operations</div>
          <h1 className="text-5xl font-semibold leading-tight text-white">TransitOps helps logistics teams run safer, smarter, and more efficient fleets.</h1>
          <p className="max-w-2xl text-slate-300">Centralized dispatch, driver compliance, maintenance tracking, fuel analytics, and reporting—all in one polished operations platform.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="btn bg-gradient-to-r from-cyan-500 to-blue-600">Get started</Link>
            <Link href="/login" className="btn border border-white/10 bg-white/5 text-white hover:bg-white/10">Sign in</Link>
          </div>
        </section>
        <div className="card bg-slate-950/90 border border-white/10 shadow-xl backdrop-blur-xl p-8">
          <div className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-4">Quick stats</div>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-slate-900/70 p-5">
              <div className="text-sm text-slate-400">Vehicles under management</div>
              <div className="text-3xl font-semibold text-white mt-3">240+</div>
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-5">
              <div className="text-sm text-slate-400">Avg. on-time trip rate</div>
              <div className="text-3xl font-semibold text-white mt-3">96%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import Nav from './Nav'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.10),_transparent_20%),linear-gradient(180deg,_#020617,_#0f172a)] text-slate-100">
      <Nav />
      <main className="flex-1 p-6 md:pl-0">
        <div className="container">{children}</div>
      </main>
    </div>
  )
}

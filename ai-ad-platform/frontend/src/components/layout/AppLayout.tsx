import Sidebar from "./Sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}

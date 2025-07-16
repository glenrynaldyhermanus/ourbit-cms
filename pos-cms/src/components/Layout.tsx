import Navbar from './Navbar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
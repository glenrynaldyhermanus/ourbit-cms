'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  Receipt
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'POS', href: '/pos', icon: Store },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: Receipt },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Store className="w-8 h-8" />
          POS CMS
        </h1>
      </div>
      
      <ul className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
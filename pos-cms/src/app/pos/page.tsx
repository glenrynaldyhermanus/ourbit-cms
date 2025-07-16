'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { CartItem, Product } from '@/types'
import { Plus, Minus, Trash2, CreditCard, DollarSign } from 'lucide-react'

// Mock products data - in real app this would come from Supabase
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coffee',
    price: 4.50,
    category: 'Beverages',
    stock_quantity: 50,
    sku: 'BEV001',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Sandwich',
    price: 8.99,
    category: 'Food',
    stock_quantity: 25,
    sku: 'FOOD001',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'Tea',
    price: 3.50,
    category: 'Beverages',
    stock_quantity: 30,
    sku: 'BEV002',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '4',
    name: 'Pastry',
    price: 5.99,
    category: 'Food',
    stock_quantity: 15,
    sku: 'FOOD002',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
]

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(mockProducts.map(p => p.category)))]

  const filteredProducts = selectedCategory === 'All' 
    ? mockProducts 
    : mockProducts.filter(p => p.category === selectedCategory)

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  const clearCart = () => setCart([])

  const processPayment = (method: 'cash' | 'card') => {
    // In real app, this would process payment and create order in Supabase
    alert(`Payment of $${total.toFixed(2)} processed via ${method}`)
    clearCart()
  }

  return (
    <Layout>
      <div className="h-full flex gap-6">
        {/* Products Section */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Point of Sale</h1>
            
            {/* Category Filter */}
            <div className="flex gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Order</h2>
          
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Cart is empty</p>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">${item.product.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => processPayment('cash')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Pay with Cash
                </button>
                <button
                  onClick={() => processPayment('card')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Pay with Card
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
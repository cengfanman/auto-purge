'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-2xl font-bold text-blue-600">AutoPurge</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link href="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600">
              Home
            </Link>
            <Link href="/about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600">
              About
            </Link>
            <Link href="/blog" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600">
              Blog
            </Link>
            <Link href="/pricing" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600">
              Pricing
            </Link>
            <Link href="/contact" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600">
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
              Home
            </Link>
            <Link href="/about" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
              About
            </Link>
            <Link href="/blog" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
              Blog
            </Link>
            <Link href="/pricing" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
              Pricing
            </Link>
            <Link href="/contact" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

import React from 'react'

export default function CommonLayout({
    children,
    }: {
    children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
        {/* Header with a logo and a rounded button at the end */}
        {/* Name(Code0)                        PlaceholderButton(Code1) */}
        
        <header className="flex justify-between items-center h-16 px-6 bg-white border-b border-gray-200">
            <div className="flex items-center">
                <button className="rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 lg:hidden">
                    <span className="sr-only">Open sidebar</span>
                    {/* Heroicon name: outline/menu-alt-2 */}
                    <svg className="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M4 6h16M4 12h16M4 18h7"/>
                    </svg>
                </button>
                <div className="flex items-center ml-4 md:ml-6">
                    <h1 className="text-xl font-bold text-gray-800 md:text-2xl">Code0</h1>
                </div>
            </div>
            <div className="flex items-center">
                <button className="rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    {/* gray div with a user icon */}
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                        MP
                    </div>
                        
                </button>
            </div>
        </header>
        {children}
    </div>
  )
}

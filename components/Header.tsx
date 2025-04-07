"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"

interface ResourceHeaderProps {
  // You can add any props you might need here
  user?: string
  onLogout?: () => void
}

const Header: React.FC<ResourceHeaderProps> = ({ user, onLogout }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <header className="w-full">
      {/* Top section with logo and banner */}
      <div className="flex flex-col md:flex-row">
        {/* Logo section */}
        <div className="bg-white p-4 flex items-center">
          <Image src="/images/plaza-logo.png" alt="" width={150} height={60} className="h-auto" />
        </div>

        {/* Resource Center banner */}
        <div className="bg-[#1a4a3d] flex-grow p-4 flex items-center">
          <h1 className="text-white text-3xl md:text-4xl font-medium">Plaza Resource Center</h1>
        </div>


      {/* Navigation bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className="flex items-center px-4 py-2 bg-[#1a4a3d] text-white">
          {user}
        </div>
        <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-[#1a4a3d] text-white">
          Logout
        </button>
      </div>
      </div>
    </header>
  )
}

export default Header


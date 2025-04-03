"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"

interface ResourceHeaderProps {
  // You can add any props you might need here
  onLogout?: () => void
}

const Header: React.FC<ResourceHeaderProps> = ({ onLogout }) => {
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
      </div>

      {/* Navigation bar */}
      {/* <div className="flex justify-between border-b border-gray-300"> */}

        {/* Right side admin and logout */}
        {/* <div className="flex items-center">
          <Link href="/admin" className="px-4 py-2 hover:bg-gray-100">
            Admin
          </Link>
          <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 ml-2 mr-2">
            Logout
          </button>
        </div> */}
      {/* </div> */}
    </header>
  )
}

export default Header


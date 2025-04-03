import type React from "react"
import Head from "next/head"

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

const Layout: React.FC<LayoutProps> = ({ children, title = "SharePoint Explorer" }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="SharePoint document library explorer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  )
}

export default Layout


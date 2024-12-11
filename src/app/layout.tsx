import React from "react"
import "./global.css"

const RootLayout = ({ children }:{ children: React.ReactNode }) => {
  return (
    <html lang="en">
    <body className="bg-gray-200">
        {children}
    </body>
    </html>
  )
}

export default RootLayout
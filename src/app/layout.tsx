import React from "react"
import "./global.css"

const RootLayout = ({ children }:{ children: React.ReactNode }) => {
  return (
    <html lang="en" data-theme="dark">
    <body>
        {children}
    </body>
    </html>
  )
}

export default RootLayout
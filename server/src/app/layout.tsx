import React from 'react'

export const metadata = {
  title: 'Tianrui Admin',
  description: 'Tianrui Textile Payload CMS Admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

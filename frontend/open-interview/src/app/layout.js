export const metadata = {
  title: 'OpenInterview',
}

import '../css/globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

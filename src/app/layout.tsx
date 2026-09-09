import type { Metadata } from 'next';
import './globals.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'BickerBape - Indian Equity Mutual Fund Screener & Suggester',
  description: 'Zero-bias institutional quantitative scoring model (SmartScore™) and portfolio backtesting for Indian Equity Direct-Growth Mutual Funds.',
  icons: {
    icon: `${basePath}/assets/favicon.png`,
    apple: `${basePath}/assets/favicon.png`
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="icon" type="image/png" href={`${basePath}/assets/favicon.png`} />
        <link rel="apple-touch-icon" href={`${basePath}/assets/favicon.png`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body-md antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

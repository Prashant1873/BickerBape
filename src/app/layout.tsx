import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BickerBape - Indian Equity Mutual Fund Screener & Suggester',
  description: 'Zero-bias institutional quantitative scoring model (SmartScore™) and portfolio backtesting for Indian Equity Direct-Growth Mutual Funds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body-md antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

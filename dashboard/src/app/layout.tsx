import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Olivia\'s Health Dashboard',
  description: 'Personal health data from Garmin Connect',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f1117] text-slate-200 antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}

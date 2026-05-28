'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',            label: 'Daily' },
  { href: '/weight',      label: 'Weight' },
  { href: '/activities',  label: 'Activities' },
  { href: '/cycle',       label: 'Cycle' },
];

export default function NavBar() {
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-[#2a2d3a] bg-[#0f1117] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-bold tracking-tight text-slate-200">
          Olivia's Health Dashboard
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                pathname === href
                  ? 'bg-[#2a2d3a] text-slate-200 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1d27]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-slate-400 hover:text-slate-200"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {open ? (
              <path fillRule="evenodd" clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            ) : (
              <path fillRule="evenodd" clipRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-[#2a2d3a] bg-[#0f1117] px-4 pb-3">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-sm border-b border-[#1a1d27] last:border-0 transition-colors ${
                pathname === href
                  ? 'text-slate-200 font-medium'
                  : 'text-slate-400'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

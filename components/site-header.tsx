'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BarChart3, FlaskConical, Map, Database, BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: BarChart3 },
  { href: '/testbed', label: 'Testbed Countries', icon: FlaskConical },
  { href: '/regional', label: 'Regional View', icon: Map },
  { href: '/allocations', label: 'Allocations', icon: Database },
  { href: '/methodology', label: 'Methodology', icon: BookOpen },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#157A3C]/95 backdrop-blur supports-[backdrop-filter]:bg-[#157A3C]/90">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
            <Image src="/atu-logo.png" alt="African Telecommunications Union logo" width={32} height={32} className="h-8 w-8 object-contain" priority />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display font-bold text-base tracking-tight">ATU</span>
            <span className="hidden sm:inline text-[11px] text-white/80 -mt-0.5">Africa IPv6 Monitor</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item: any) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith?.(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-white/20 bg-[#157A3C] px-4 pb-3">
          {NAV_ITEMS.map((item: any) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

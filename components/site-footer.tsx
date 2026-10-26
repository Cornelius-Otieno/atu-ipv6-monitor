import Image from 'next/image';

export function SiteFooter() {
  return (
    <footer className="border-t bg-[#0E3B1E] text-white/80">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
              <Image src="/atu-logo.png" alt="African Telecommunications Union logo" width={32} height={32} className="h-8 w-8 object-contain" />
            </span>
            <span className="font-display font-bold text-white">ATU Africa IPv6 Monitor</span>
          </div>
          <div className="text-xs text-white/60 text-center sm:text-right">
            <p>Data sources: APNIC Labs · AFRINIC · Cloudflare Radar</p>
            <p className="mt-1">© African Telecommunications Union. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

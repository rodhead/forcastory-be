// src/features/layout/components/FooterBar.tsx
// Slim bottom bar — policy links, app version, copyright.
// Backend can return these via GET /api/shell/footer.
import { FOOTER_LINKS } from '../config/nav.config'
import { ENV } from '@/config/env'

export function FooterBar() {
  return (
    <footer className="h-[30px] flex-shrink-0 flex items-center justify-between px-5 bg-[var(--s1)] border-t border-[var(--s4)]">
      {/* left — policy links */}
      <nav className="flex items-center gap-4">
        {FOOTER_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="text-[10px] text-[var(--t4)] hover:text-[var(--t2)] transition-colors font-medium whitespace-nowrap"
            target="_blank"
            rel="noopener noreferrer"
          >
            {l.label}
          </a>
        ))}
      </nav>

      {/* right — version + copyright */}
      <div className="flex items-center gap-3 text-[10px] text-[var(--t4)] font-medium">
        <span>© {new Date().getFullYear()} HKS Inc.</span>
        <span className="font-mono bg-[var(--s2)] border border-[var(--s4)] rounded px-1.5 py-px text-[9.5px]">
          v{ENV.appVersion}
        </span>
      </div>
    </footer>
  )
}

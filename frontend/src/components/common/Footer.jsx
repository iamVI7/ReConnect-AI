export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-signal" />
            <span className="font-display text-base">ReConnect AI</span>
          </div>
          <p className="text-ink-faint">Connecting missing lives with their families.</p>
        </div>

        <div>
          <p className="text-ink-faint mb-3 font-mono text-xs uppercase tracking-wide">Platform</p>
          <ul className="space-y-2 text-ink-soft">
            <li><a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a></li>
            <li><a href="#roles" className="hover:text-ink transition-colors">Who it serves</a></li>
            <li><a href="#trust" className="hover:text-ink transition-colors">Trust &amp; safety</a></li>
          </ul>
        </div>

        <div>
          <p className="text-ink-faint mb-3 font-mono text-xs uppercase tracking-wide">Organizations</p>
          <ul className="space-y-2 text-ink-soft">
            <li>Police departments</li>
            <li>Hospitals</li>
            <li>NGOs &amp; shelters</li>
          </ul>
        </div>

        <div>
          <p className="text-ink-faint mb-3 font-mono text-xs uppercase tracking-wide">Legal</p>
          <ul className="space-y-2 text-ink-soft">
            <li>Privacy &amp; consent policy</li>
            <li>Data retention</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="max-w-6xl mx-auto px-6 py-4 text-xs text-ink-faint">
          © {new Date().getFullYear()} ReConnect AI. Built for reunification, not surveillance.
        </p>
      </div>
    </footer>
  );
}

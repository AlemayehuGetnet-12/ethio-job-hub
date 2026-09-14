"use client";

import { useLanguage } from '../context/LanguageProvider';

export default function Footer({ companyName = 'EthioJobs', className = '' }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <footer className={`mt-12 border-t border-gold-dark bg-gold py-8 ${className}`}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-gold">
              EJ
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">{companyName}</div>
              <div className="text-sm text-slate-800/80">{t('footer.description')}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <nav className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <a href="/" className="text-sm font-medium text-slate-900 hover:text-slate-700">{t('nav.home')}</a>
              <a href="/about" className="text-sm font-medium text-slate-900 hover:text-slate-700">{t('nav.about')}</a>
              <a href="/companies" className="text-sm font-medium text-slate-900 hover:text-slate-700">{t('nav.companies')}</a>
              <a href="/contact" className="text-sm font-medium text-slate-900 hover:text-slate-700">{t('nav.contact')}</a>
              <a href="/dashboard" className="text-sm font-medium text-slate-900 hover:text-slate-700">{t('nav.dashboard')}</a>
              <a href="/login" className="text-sm font-medium text-slate-900 hover:text-slate-700">{t('nav.login')}</a>
            </nav>

            <div className="flex items-center gap-3">
              <label htmlFor="lang" className="sr-only">Language</label>
              <select
                id="lang"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="rounded-md border border-slate-900/20 bg-gold-light px-3 py-2 text-sm text-slate-900 outline-none"
              >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
                <option value="om">Afaan Oromoo</option>
              </select>

              <div className="flex items-center gap-3">
                <a href="#" aria-label="Twitter" className="text-slate-900 hover:text-slate-700">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 19c7.5 0 11.6-6.2 11.6-11.6 0-.2 0-.4 0-.6A8.3 8.3 0 0 0 22 4.1a8.1 8.1 0 0 1-2.3.6 4.1 4.1 0 0 0 1.8-2.3 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.7A11.7 11.7 0 0 1 3 3.9a4.1 4.1 0 0 0 1.3 5.4A4 4 0 0 1 2.8 8v.1a4.1 4.1 0 0 0 3.3 4 4 4 0 0 1-1.1.1c-.3 0-.6 0-.9-.1a4.1 4.1 0 0 0 3.8 2.8A8.3 8.3 0 0 1 2 17.6 11.7 11.7 0 0 0 8 19"/></svg>
                </a>
                <a href="#" aria-label="Facebook" className="text-slate-900 hover:text-slate-700">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.2V12h2.2V9.8c0-2.2 1.3-3.4 3.3-3.4.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 2.9h-1.9v7A10 10 0 0 0 22 12"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gold-dark/60 pt-6 text-sm text-slate-800/80">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div>© {new Date().getFullYear()} {companyName}. All rights reserved.</div>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-slate-900">{t('footer.privacy')}</a>
              <a href="/terms" className="hover:text-slate-900">{t('footer.terms')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

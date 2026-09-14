"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "../context/LanguageProvider";

const links = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/companies", key: "nav.companies" },
  { href: "/contact", key: "nav.contact" },
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/login", key: "nav.login" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href) =>
    `rounded-full px-3 py-2 text-sm font-medium transition ${
      isActive(href)
        ? "bg-slate-900 text-gold"
        : "text-slate-900 hover:bg-gold-dark hover:text-white"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold-dark bg-gold shadow-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-bold text-slate-900 sm:text-xl">
          EthioJobs
        </Link>

        {/* Top nav links — desktop */}
        <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClass(link.href)}>
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Top nav links — tablet */}
        <ul className="hidden flex-1 items-center justify-end gap-1 overflow-x-auto md:flex lg:hidden">
          {links.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link href={link.href} className={linkClass(link.href)}>
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-900/30 text-slate-900 md:hidden"
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown from top */}
      {open && (
        <div className="border-t border-gold-dark bg-gold px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive(link.href)
                      ? "bg-slate-900 text-gold"
                      : "text-slate-900 hover:bg-gold-dark hover:text-white"
                  }`}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

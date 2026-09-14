import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/companies", label: "Companies" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/login", label: "Login" },
];

export default function Header({ user }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gold-dark bg-gold px-6 py-4 shadow-md">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-slate-900">
          EthioJobs
        </Link>
        <nav className="hidden gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-gold-dark hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="rounded-full border border-slate-900/40 px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-gold-dark hover:text-white"
        >
          Login
        </Link>
        <div className="hidden flex-col text-right sm:flex">
          <span className="text-sm font-medium text-slate-900">{user?.name || "Guest"}</span>
          <small className="text-xs text-slate-800/70">{user?.role || "Guest"}</small>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-gold">
          {(user?.name || "G").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

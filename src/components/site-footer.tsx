import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-secondary/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-sm font-bold">
            EthioJobs<span className="text-accent"> Connect</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Connecting Ethiopian talent with employers who are hiring now.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/jobs" className="hover:text-foreground">
            Browse Jobs
          </Link>
          <Link to="/companies" className="hover:text-foreground">
            Companies
          </Link>
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto w-full max-w-6xl px-5 py-4 text-xs text-muted-foreground">
          © 2026 EthioJobs Connect. Addis Ababa, Ethiopia.
        </p>
      </div>
    </footer>
  );
}

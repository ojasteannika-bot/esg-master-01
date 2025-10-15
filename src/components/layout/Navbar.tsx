import Link from "next/link";

export default function Navbar(){
  return (
    <div className="navbar bg-white/60">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          <span className="brand-dot" />
          <span>ESGlite</span>
        </Link>

        <nav className="navlinks">
          <Link href="/#what-we-do">What we do</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/reports" className="hidden sm:inline">Reports</Link>
        </nav>

        <div className="cta">
          <Link href="/get-report" className="btn btn-primary">Get your free ESG report</Link>
        </div>
      </div>
    </div>
  );
}

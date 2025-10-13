import Link from "next/link";

export default function Home(){
  return (
    <section className="hero">
      <div className="hero-shell p-8 md:p-12">
        <div className="badge">≫ ESG SOFTWARE FOR SMES. ≪</div>
        <h1 className="hero-h1">See your ESG performance in minutes, without lifting a finger</h1>
        <p className="hero-sub">
          Real-time insights. Audit-ready answers. No spreadsheets, no friction, no credit card.
        </p>
        <div className="hero-row">
          <Link href="/get-report" className="btn btn-primary">Get your free ESG report  ≫</Link>
          <Link href="/questionnaires" className="btn btn-ghost">Take ESG readiness quiz  ≫</Link>
        </div>
      </div>
    </section>
  );
}

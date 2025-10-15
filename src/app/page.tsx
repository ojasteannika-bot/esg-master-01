import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export default async function Page() {
  return (
    <main className="rx-page">
      <Container>
        <PageHeader title="See your ESG performance in minutes" subtitle="Real-time insights. Audit-ready answers. No spreadsheets." right={<Button href="/questionnaires" variant="primary">Open disclosures</Button>} />
        <div className="rx-grid rx-grid-3">
          <div className="rx-card"><h3>Disclosures</h3><p className="rx-sub">Answer once. Reuse everywhere.</p><Button href="/questionnaires">Open</Button></div>
          <div className="rx-card"><h3>Wizard</h3><p className="rx-sub">Quick VSMe onboarding.</p><Button href="/wizard">Start</Button></div>
          <div className="rx-card"><h3>Report</h3><p className="rx-sub">Preview your ResultX-style PDF.</p><Button href="/get-report">Preview</Button></div>
        </div>
      </Container>
    </main>
  );
}

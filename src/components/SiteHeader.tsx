import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function SiteHeader() {
  return (
    <div className="sticky top-0 z-30 w-full border-b border-[--color-border] bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 shadow-[0_2px_16px_rgba(2,6,23,.05)]">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          ESG<span className="text-brand-600">lite</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-[--color-text-muted] sm:flex">
          <Link className="hover:text-[--color-text]" href="/questionnaires">Questionnaires</Link>
          <Link className="hover:text-[--color-text]" href="/audit">Audit</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button href="/questionnaires" size="sm">Open app</Button>
        </div>
      </Container>
    </div>
  );
}

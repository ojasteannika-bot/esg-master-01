// src/app/questionnaires/vsme/[code]/page.tsx
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ project?: string }>;
};

type Q = { code: string; title: string; };

async function loadItems(sectionCode: string): Promise<Q[]> {
  // MVP demo – hiljem kasutame sinu enumerateQuestions()
  if (sectionCode.toUpperCase() === "B1") {
    return [
      { code: "B1-1", title: "Which VSME modules are included?" },
      { code: "B1-2", title: "Individual or consolidated?" },
      { code: "B1-3", title: "Reporting perimeter notes" },
    ];
  }
  return [];
}

export default async function VsmeSectionPage(p: Props) {
  const { code } = await p.params;
  const sp = await p.searchParams;
  const project = sp.project ?? "client-test1";

  const items = await loadItems(code);

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">VSME section: {code.toUpperCase()}</h1>
          <div className="mt-1 text-sm text-gray-500">Project: {project}</div>
        </div>

        {/* Badge’i koht – kui ProgressBadge on valmis, lisa siia */}
        <div className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600">
          Progress: 0%
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          No questions found for section {code}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((q) => (
            <Card key={q.code}>
              <CardHeader title={`Code: ${q.code}`} />
              <CardBody>
                <div className="mb-3 text-sm font-medium text-gray-900">{q.title}</div>
                <div className="flex justify-end">
                  <Link
                    href={{ pathname: `/questionnaires/vsme/item/${q.code}`, query: { project } }}
                    className="inline-flex h-8 items-center rounded-md bg-gray-900 px-3 text-xs font-medium text-white hover:bg-black"
                  >
                    Open
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/questionnaires" className="text-sm text-gray-600 hover:text-gray-900">
          ← All sections
        </Link>
      </div>
    </Container>
  );
}

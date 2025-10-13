import Link from "next/link";
import AuditTable from "@/components/audit/AuditTable";

type Props = {
  searchParams: Promise<Record<string, string>>;
};

export default async function AuditPage(props: Props) {
  const sp = await props.searchParams;
  const project = sp.project ?? "client-test1";
  const limit = Number(sp.limit ?? "50");
  const from = sp.from;
  const to = sp.to;

  const csvHref = `/api/cdm/audit.csv?project=${encodeURIComponent(project)}&limit=${limit}` +
    (from ? `&from=${encodeURIComponent(from)}` : "") +
    (to ? `&to=${encodeURIComponent(to)}` : "");

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Audit</h1>

      <form method="get" action="/audit" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input type="hidden" name="project" value={project} />
        <label>From <input type="date" name="from" defaultValue={from} /></label>
        <label>To <input type="date" name="to" defaultValue={to} /></label>
        <label>Limit <input type="number" min={1} max={2000} name="limit" defaultValue={String(limit)} style={{ width: 100 }} /></label>
        <button type="submit">Apply</button>
        <a href={csvHref} style={{ marginLeft: 8 }}>Open CSV</a>
        <a href={`/api/cdm/audit?project=${encodeURIComponent(project)}&limit=${limit}`}>Open JSON</a>
      </form>

      <AuditTable project={project} limit={limit} from={from} to={to} />
    </main>
  );
}

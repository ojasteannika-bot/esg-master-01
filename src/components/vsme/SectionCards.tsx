// src/components/vsme/SectionCards.tsx
import Link from "next/link";

type Props = {
  project: string;
  sectionCode: string;
  items: { code: string; title: string }[];
};

export default function SectionCards({ project, items }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((it) => (
        <div key={it.code} className="border rounded p-4">
          <div className="text-sm opacity-60 mb-2">Code: {it.code}</div>
          <div className="font-medium mb-4">{it.title}</div>
          <div className="flex items-center gap-3">
            <Link
              href={`/questionnaires/vsme/item/${encodeURIComponent(it.code)}?project=${encodeURIComponent(project)}`}
              className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
            >
              Open
            </Link>
            <span className="text-sm opacity-50">generic view WIP</span>
          </div>
        </div>
      ))}
    </div>
  );
}

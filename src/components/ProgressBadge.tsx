export default function ProgressBadge({ done=0, total=0 }: { done?:number; total?:number }) {
  const pct = total > 0 ? Math.round((done/total)*100) : 0;
  return <span className="badge">{pct}% completed</span>;
}

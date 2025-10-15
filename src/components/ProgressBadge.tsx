export default function ProgressBadge({done,total}:{done:number;total:number}) {
  const pct = total ? Math.round((done/total)*100) : 0;
  return <span className="badge">{pct}% completed</span>;
}

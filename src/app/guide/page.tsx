import Link from 'next/link';
export default function GuideIndex() {
  return (
    <div>
      <p>Start here:</p>
      <Link className="btn" href="/guide/welcome">Open guide →</Link>
    </div>
  );
}

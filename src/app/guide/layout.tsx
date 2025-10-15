export const metadata = { title: 'Guide' };

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container" style={{maxWidth:960, margin:'40px auto', padding:'0 16px'}}>
      <h1 className="h2" style={{marginBottom:16}}>Your VSME report guide</h1>
      <nav style={{display:'flex', gap:12, marginBottom:24}}>
        <a href="/guide/welcome">Welcome</a>
        <a href="/guide/upload">Upload documents</a>
        <a href="/guide/generate">Generate answers</a>
        <a href="/guide/download">Download & share</a>
        <a href="/guide/get-started">Get started</a>
      </nav>
      {children}
    </main>
  );
}

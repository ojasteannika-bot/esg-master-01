type SP = { project?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const params = await searchParams;
  const project = params?.project ?? 'client-XYZ';

  return (
    <div className="section">
      <h1 className="h2" style={{marginBottom:12}}>Preview / PDF — placeholder</h1>
      <p><b>Project:</b> {project}</p>
      <div style={{display:'flex', gap:8, marginTop:12}}>
        <form method="post" action="/api/pdf">
          <input type="hidden" name="project" value={project}/>
          <button className="btn">Test PDF API (empty)</button>
        </form>
        <form method="post" action="/api/pdf">
          <input type="hidden" name="project" value={project}/>
          <input type="hidden" name="mode" value="full"/>
          <button className="btn btn-secondary">Send full payload (A+B)</button>
        </form>
      </div>
    </div>
  );
}

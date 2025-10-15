export async function track(type:string, data:any={}, project?:string){
  try{
    await fetch('/api/audit', { method:'POST', body: JSON.stringify({ type, project, data }) });
  }catch{}
}

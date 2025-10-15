'use client';
export default function GuideVideo({ src, title }: { src: string; title?: string }) {
  return (
    <div style={{position:'relative', paddingTop:'56.25%', borderRadius:12, overflow:'hidden', background:'#0002'}}>
      <iframe
        src={src}
        title={title ?? 'Guide video'}
        style={{position:'absolute', inset:0, width:'100%', height:'100%', border:0}}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

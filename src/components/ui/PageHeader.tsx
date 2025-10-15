import Container from "./Container";
export default function PageHeader(props:{title:string;subtitle?:string;right?:React.ReactNode}) {
  return (
    <div className="rx-hero" style={{marginBottom:20}}>
      <Container>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div>
            <div className="rx-title">{props.title}</div>
            {props.subtitle && <div className="rx-sub">{props.subtitle}</div>}
          </div>
          {props.right}
        </div>
      </Container>
    </div>
  );
}

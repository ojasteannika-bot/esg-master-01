export default function Card(props:{title?:string,subtitle?:string,children?:React.ReactNode,footer?:React.ReactNode}) {
  return (
    <div className="rx-card">
      {props.title && <h3>{props.title}</h3>}
      {props.subtitle && <p className="rx-sub">{props.subtitle}</p>}
      {props.children}
      {props.footer && <div style={{marginTop:12}}>{props.footer}</div>}
    </div>
  );
}

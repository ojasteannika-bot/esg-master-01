export default function Container(props:{children:React.ReactNode,className?:string}){return <div className={`rx-container ${props.className??''}`}>{props.children}</div>}

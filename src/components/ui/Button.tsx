import Link from "next/link";
export function Button(props:{href?:string;children:React.ReactNode;variant?:"primary"|"ghost";type?:"button"|"submit"}) {
  const cls = "rx-btn "+(props.variant==="primary"?"rx-btn-primary":"");
  if (props.href) return <Link className={cls} href={props.href}>{props.children}</Link>;
  return <button type={props.type??"button"} className={cls}>{props.children}</button>;
}

import { redirect } from "next/navigation";

export default function GetReport(){
  // siit saab hiljem lisada wizardi; praegu kiire minek küsimustikesse
  redirect("/questionnaires");
}

import { redirect } from "next/navigation";

export default function Page() {
  redirect("/professeurs?vue=carte");
}

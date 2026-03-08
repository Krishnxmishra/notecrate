import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { Landing } from "./landing";

export default async function Page() {
  const user = await getUser();
  if (user) redirect("/dashboard");
  return <Landing />;
}

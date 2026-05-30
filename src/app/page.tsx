import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session) {
    const role = (session.user as any)?.role;
    redirect(role === "ADMIN" ? "/admin" : "/author");
  }

  redirect("/login");
}

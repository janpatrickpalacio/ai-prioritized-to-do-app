import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/app/actions/tasks";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch initial tasks
  const tasksResult = await getTasks();
  const initialTasks = tasksResult.success ? tasksResult.tasks || [] : [];

  return <DashboardClient user={user} initialTasks={initialTasks} />;
}

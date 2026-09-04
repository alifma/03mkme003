import { auth } from "@/features/auth/config";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Welcome{session?.user.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="text-muted-foreground mt-1">
        Signed in as {session?.user.email}.
      </p>
    </div>
  );
}

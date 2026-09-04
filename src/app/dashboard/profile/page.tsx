import { notFound } from "next/navigation";
import { auth } from "@/features/auth/config";
import { updateProfileAction } from "@/features/profile/actions";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getOwnProfile } from "@/features/profile/queries";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) notFound();

  const profile = await getOwnProfile(session.user.id);
  if (!profile) notFound();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Username</dt>
          <dd className="font-mono">{profile.username}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Roles</dt>
          <dd>{profile.roles.join(", ") || "—"}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <ProfileForm
          action={updateProfileAction}
          defaultName={profile.name ?? ""}
        />
      </div>
    </div>
  );
}

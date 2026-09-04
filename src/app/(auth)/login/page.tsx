import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { LoginHero } from "@/features/auth/components/login-hero";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <LoginHero>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-mono">Sign in</CardTitle>
          <CardDescription>
            Masuk untuk akses notes, pengumuman, dan kas kelas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </LoginHero>
  );
}

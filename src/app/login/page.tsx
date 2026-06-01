import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    registered?: string;
    email?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-6 py-10 md:px-10">
      <LoginForm
        callbackUrl={params.callbackUrl}
        justRegistered={params.registered === "1"}
        defaultEmail={params.email}
      />
      <p className="text-sm text-muted-foreground">
        Pas encore de compte ? <Link className="underline" href="/signup">Inscription</Link>
      </p>
    </main>
  );
}

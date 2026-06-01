import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-6 py-10 md:px-10">
      <SignupForm />
      <p className="text-sm text-muted-foreground">
        Deja un compte ? <Link className="underline" href="/login">Connexion</Link>
      </p>
    </main>
  );
}

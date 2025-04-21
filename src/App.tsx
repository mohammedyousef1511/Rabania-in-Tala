import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { AdminDashboard } from "./AdminDashboard";
import { UserDashboard } from "./UserDashboard";

export default function App() {
  const user = useQuery(api.auth.loggedInUser);
  const isAdmin = user?.email === "admin@example.com";

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">نظام المهام اليومية</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="w-full max-w-4xl mx-auto">
          <Content isAdmin={isAdmin} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content({ isAdmin }: { isAdmin: boolean }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold accent-text mb-4">نظام المهام اليومية</h1>
        <Authenticated>
          <p className="text-xl text-slate-600">
            {isAdmin ? "مرحباً بك في لوحة التحكم" : "مرحباً بك"}
            {", "}
            {loggedInUser?.email}
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600">سجل دخولك للبدء</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </Authenticated>
    </div>
  );
}

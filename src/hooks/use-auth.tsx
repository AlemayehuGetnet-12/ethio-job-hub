import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "job_seeker" | "employer" | "admin";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  emailVerified: boolean;
  hasRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function syncRoleAndProfile(user: User) {
  const desiredRole = (user.user_metadata?.["role"] as AppRole | undefined) ?? "job_seeker";
  if (desiredRole !== "admin") {
    await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: desiredRole })
      .select()
      .maybeSingle();
  }
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!existing) {
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: (user.user_metadata?.["full_name"] as string | undefined) ?? "",
      company_name: (user.user_metadata?.["company_name"] as string | undefined) ?? null,
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setRoles((data ?? []).map((r) => r.role as AppRole));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      const user = nextSession?.user;
      if (!user) {
        setRoles([]);
        return;
      }
      // Defer supabase calls out of the auth callback to avoid deadlocks.
      setTimeout(() => {
        void syncRoleAndProfile(user).then(() => loadRoles(user.id));
      }, 0);
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) void loadRoles(data.session.user.id);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      session,
      user,
      roles,
      loading,
      emailVerified: Boolean(user?.email_confirmed_at),
      hasRole: (role) => roles.includes(role),
      refreshRoles: async () => {
        if (user) await loadRoles(user.id);
      },
    };
  }, [session, roles, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

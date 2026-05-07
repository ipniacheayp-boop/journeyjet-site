import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogOut, User, Mail, Calendar, Shield } from "lucide-react";

const buildProfileFromUser = (currentUser: SupabaseUser) => ({
  id: currentUser.id,
  email: currentUser.email ?? null,
  name:
    (currentUser.user_metadata?.full_name as string | undefined) ||
    (currentUser.user_metadata?.name as string | undefined) ||
    currentUser.email?.split("@")[0] ||
    null,
  profile_image:
    (currentUser.user_metadata?.avatar_url as string | undefined) ||
    (currentUser.user_metadata?.picture as string | undefined) ||
    null,
  login_method: currentUser.app_metadata?.provider || "email",
  created_at: currentUser.created_at || null,
  last_login: new Date().toISOString(),
});

const Account = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{
    name: string | null;
    email: string | null;
    profile_image: string | null;
    login_method: string | null;
    created_at: string | null;
    last_login: string | null;
  } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [profileSyncFailed, setProfileSyncFailed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth/signin", { replace: true });
      return;
    }
    if (!user) return;

    // Render the page immediately with session data.
    const fallbackProfile = buildProfileFromUser(user);
    setProfile(fallbackProfile);
    setNewName(fallbackProfile.name || "");
    setProfileSyncFailed(false);

    let cancelled = false;
    const TIMEOUT_MS = 6000;

    const fetchProfile = async () => {
      try {
        const result = (await Promise.race([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("profile-fetch-timeout")), TIMEOUT_MS),
          ),
        ])) as { data: typeof profile; error: any };

        if (cancelled) return;
        if (result.error) throw result.error;
        if (result.data) {
          setProfile(result.data);
          setNewName(result.data.name || "");
          return;
        }

        const upsert = (await Promise.race([
          supabase
            .from("profiles")
            .upsert(buildProfileFromUser(user), { onConflict: "id" })
            .select("*")
            .single(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("profile-upsert-timeout")), TIMEOUT_MS),
          ),
        ])) as { data: typeof profile; error: any };

        if (cancelled) return;
        if (upsert.error) throw upsert.error;
        if (upsert.data) {
          setProfile(upsert.data);
          setNewName(upsert.data.name || "");
        }
      } catch (error) {
        if (cancelled) return;
        console.warn("Profile sync failed, showing session data only.", error);
        setProfileSyncFailed(true);
      }
    };

    void fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: newName.trim() })
        .eq("id", user!.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, name: newName.trim() } : prev);
      setEditingName(false);
      toast.success("Name updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update name. Make sure the profiles table is set up.");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const initials = (profile.name || profile.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.profile_image || undefined} alt={profile.name || "User"} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {profile.name ? `${profile.name} — Tripile account` : "Your Tripile account"}
              </h1>
              <CardDescription>{profile.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileSyncFailed && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                  We couldn't sync your saved profile yet, so we're showing details from your current session. Run the
                  <code className="mx-1 rounded bg-amber-100 px-1 dark:bg-amber-900/40">profiles</code> table migration in Supabase to enable name editing and persistent profile data.
                </div>
              )}
              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    {editingName ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="h-8"
                        />
                        <Button size="sm" onClick={handleUpdateName}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Cancel</Button>
                      </div>
                    ) : (
                      <p className="text-sm cursor-pointer hover:text-primary" onClick={() => setEditingName(true)}>
                        {profile.name || "Click to add name"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Login Method</Label>
                    <p className="text-sm capitalize">{profile.login_method || "email"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Member Since</Label>
                    <p className="text-sm">
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Login</Label>
                    <p className="text-sm">
                      {profile.last_login
                        ? new Date(profile.last_login).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quick Links */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/my-bookings")}
                >
                  My Bookings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/deals")}
                >
                  Browse Deals
                </Button>
              </div>

              <Separator />

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;

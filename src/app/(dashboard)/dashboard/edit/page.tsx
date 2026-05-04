import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EditProfileForm } from "@/components/dashboard/EditProfileForm";
import { LinksManager } from "@/components/dashboard/LinksManager";
import { ThemeCustomizer } from "@/components/dashboard/ThemeCustomizer";
import { AvatarUpload } from "@/components/dashboard/AvatarUpload";
import { CVUpload } from "@/components/dashboard/CVUpload";

export const metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  const userId  = session!.user.id;

  const user = await prisma.user.findUnique({
    where:   { id: userId },
    include: {
      profile: {
        include: {
          socialLinks: { orderBy: { order: "asc" } },
          customLinks: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  const profile = user?.profile;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit profile</h1>
        <p className="text-slate-500 text-sm mt-1">Changes are visible on your public profile instantly</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left column — avatar + theme */}
        <div className="space-y-6">
          <AvatarUpload currentUrl={profile?.avatarUrl ?? null} />
          <ThemeCustomizer
            currentTheme={profile?.theme ?? "default"}
            currentColor={profile?.primaryColor ?? "#3b63f6"}
          />
        </div>

        {/* Right column — info + links */}
        <div className="md:col-span-2 space-y-6">
          <EditProfileForm profile={profile} />
          <CVUpload currentUrl={profile?.cvUrl ?? null} />
          <LinksManager
            socialLinks={profile?.socialLinks ?? []}
            customLinks={profile?.customLinks ?? []}
          />
        </div>
      </div>
    </div>
  );
}

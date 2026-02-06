import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { AuthButtons } from "@/components/forms/AuthButtons";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { SignOutButton } from "@/components/forms/SignOutButton";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="bg-white">
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="Profile"
            title="Manage your account"
            subtitle="Keep your delivery details updated for faster checkout."
          />
          {user ? (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <ProfileForm
                user={{
                  name: user.name ?? "",
                  email: user.email ?? "",
                  phone: user.phone ?? "",
                  provider: user.provider ?? "",
                }}
              />
              <div className="mt-4">
                <SignOutButton />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <AuthButtons />
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">
            Secure delivery profile
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Your information is stored securely. We use it only to improve
            delivery accuracy and keep your orders up to date.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>• Google OAuth for fast sign-in</li>
            <li>• Telegram login for quick access</li>
            <li>• Phone number for driver contact</li>
          </ul>
        </div>
      </Container>
    </div>
  );
}

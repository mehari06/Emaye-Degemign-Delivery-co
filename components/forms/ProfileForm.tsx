"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfileAction } from "@/lib/actions/users";

export type ProfileFormValues = {
  name: string;
  email?: string | null;
  phone?: string | null;
  provider?: string | null;
};

export function ProfileForm({ user }: { user: ProfileFormValues }) {
  const [isPending, startTransition] = React.useTransition();
  const [formData, setFormData] = React.useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result?.ok) {
        toast.success("Profile updated");
      } else {
        toast.error(result?.error ?? "Unable to update profile");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-semibold text-slate-700">Full name</label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          className="mt-2"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Phone number
        </label>
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+251 ..."
          className="mt-2"
        />
        <p className="mt-2 text-xs text-slate-500">
          Telegram users can paste their shared contact number here.
        </p>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700">Email</label>
        <Input
          value={user.email ?? "Not provided"}
          readOnly
          className="mt-2 bg-slate-50 text-slate-500"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Auth provider
        </label>
        <Input
          value={user.provider ?? "Unknown"}
          readOnly
          className="mt-2 bg-slate-50 text-slate-500"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}

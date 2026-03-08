"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { AddressMap } from "@/components/map/AddressMap";
import type { AddressInput } from "@/lib/types";

export function AddressForm({
  value,
  onChange,
}: {
  value: AddressInput;
  onChange: (next: AddressInput) => void;
}) {
  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, address: event.target.value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-slate-700">
            Delivery address
          </label>
          <Input
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="Apartment, street, or building name"
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Condo Block (Optional)
          </label>
          <Input
            value={value.condoBlock || ""}
            onChange={(e) => onChange({ ...value, condoBlock: e.target.value })}
            placeholder="e.g. Block 12"
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Room Number (Optional)
          </label>
          <Input
            value={value.condoRoom || ""}
            onChange={(e) => onChange({ ...value, condoRoom: e.target.value })}
            placeholder="e.g. 304"
            className="mt-2"
          />
        </div>
      </div>
      <AddressMap value={value} onChange={onChange} />
    </div>
  );
}

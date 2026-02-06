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
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Delivery address
        </label>
        <Input
          value={value.address}
          onChange={handleAddressChange}
          placeholder="Apartment, street, or building name"
          className="mt-2"
        />
      </div>
      <AddressMap value={value} onChange={onChange} />
    </div>
  );
}

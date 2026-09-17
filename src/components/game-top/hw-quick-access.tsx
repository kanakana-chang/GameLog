"use client";

import { useState } from "react";
import { HW_QUICK } from "./data";

export function HwQuickAccess() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="border-b border-[#e3e4ea] bg-white">
      <div className="mx-auto max-w-5xl px-4 py-5">
        <p className="mb-3 text-xs font-bold tracking-widest text-[#7a7d8a] uppercase">
          ハードで絞り込む
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {HW_QUICK.map((hardware) => (
            <button
              key={hardware.id}
              type="button"
              onClick={() =>
                setActive(active === hardware.id ? null : hardware.id)
              }
              className="flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all"
              style={{
                borderColor: active === hardware.id ? hardware.color : "#e3e4ea",
                backgroundColor:
                  active === hardware.id ? hardware.bg : "transparent",
              }}
            >
              <span className="text-2xl leading-none">{hardware.icon}</span>
              <span className="text-center text-xs leading-tight font-medium text-[#1a1c22]">
                {hardware.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

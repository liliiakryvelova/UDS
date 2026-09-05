"use client";

import { useId, useState } from "react";

export function PasswordField({
  name,
  required = true,
  minLength,
  autoComplete,
  className = "",
  placeholder,
}: {
  name: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  className?: string;
  placeholder?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();

  return (
    <div className="relative">
      <input
        id={inputId}
        type={showPassword ? "text" : "password"}
        name={name}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${className} w-full rounded-xl border border-sky-200 bg-white px-3 py-2 pr-10`}
      />

      <button
        type="button"
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword((current) => !current)}
        className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-700"
      >
        {showPassword ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
            <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.58 10.58A2 2 0 0013.4 13.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.88 5.08A10.94 10.94 0 0112 5c4.69 0 8.53 3.11 10 7-1.03 2.28-2.79 4.14-5.06 5.24M6.61 6.61A15.22 15.22 0 002 12c1.47 3.89 5.31 7 10 7 1.78 0 3.48-.36 5.02-.99" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

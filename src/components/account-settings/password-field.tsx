type PasswordFieldProps = {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  hint?: string;
};

export function PasswordField({
  label,
  id,
  value,
  onChange,
  show,
  onToggle,
  hint,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-10 font-body text-sm text-heading outline-none transition-all duration-150 placeholder:text-muted/70 focus:border-primary focus:shadow-focus-primary"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted transition-opacity duration-150 hover:opacity-80"
        >
          {show ? "隠す" : "表示"}
        </button>
      </div>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

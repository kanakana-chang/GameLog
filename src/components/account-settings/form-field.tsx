type FormFieldProps = {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
};

export function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-body text-sm text-heading outline-none transition-all duration-150 placeholder:text-muted/70 focus:border-primary focus:shadow-focus-primary"
      />
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

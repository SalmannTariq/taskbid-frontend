export function Brand() {
  return (
    <div className="brand">
      <span className="mark" aria-hidden="true">T</span>
      <span>TaskBid</span>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  min,
  step,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  min?: string;
  step?: string;
  inputMode?: "decimal" | "email" | "text";
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        min={min}
        step={step}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

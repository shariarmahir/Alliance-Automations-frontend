import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  multiline?: boolean
  type?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: "text" | "numeric" | "tel" | "email"
}

/** Label, control and inline error wired together for assistive technology. */
export function TextField({ id, label, value, onChange, error, required, multiline, ...props }: TextFieldProps) {
  const shared = { id, name: id, value, "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : undefined }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-delayed">
            {" "}
            *
          </span>
        )}
      </Label>
      {multiline ? (
        <Textarea {...shared} {...props} rows={4} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input {...shared} {...props} required={required} onChange={(event) => onChange(event.target.value)} />
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-delayed" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

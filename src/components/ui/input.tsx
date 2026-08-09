import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface NeumorphicInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const fieldWrapper = "flex flex-col gap-1.5";
const labelClass = "text-sm font-medium text-[var(--text-secondary)]";
const fieldClass =
  "neu-pressed rounded-[var(--radius-control)] px-4 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-shadow";
const hintClass = "text-xs text-[var(--text-muted)]";
const errorClass = "text-xs text-[var(--danger)]";

export const NeumorphicInput = forwardRef<HTMLInputElement, NeumorphicInputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className={fieldWrapper}>
        {label && (
          <label htmlFor={inputId} className={labelClass}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(fieldClass, error && "text-[var(--danger)]", className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error ? (
          <span id={`${inputId}-error`} className={errorClass} role="alert">
            {error}
          </span>
        ) : hint ? (
          <span id={`${inputId}-hint`} className={hintClass}>
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);
NeumorphicInput.displayName = "NeumorphicInput";

interface NeumorphicTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const NeumorphicTextarea = forwardRef<HTMLTextAreaElement, NeumorphicTextareaProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className={fieldWrapper}>
        {label && (
          <label htmlFor={inputId} className={labelClass}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(fieldClass, "min-h-28 resize-y", error && "text-[var(--danger)]", className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error ? (
          <span id={`${inputId}-error`} className={errorClass} role="alert">
            {error}
          </span>
        ) : hint ? (
          <span id={`${inputId}-hint`} className={hintClass}>
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);
NeumorphicTextarea.displayName = "NeumorphicTextarea";

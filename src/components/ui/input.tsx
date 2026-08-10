import { cn } from "@/lib/utils";
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const fieldWrapper = "flex flex-col gap-2";
const labelClass = "text-sm font-medium text-[var(--text-secondary)] pl-1";
const fieldClass =
  "neu-pressed rounded-[var(--radius-control)] px-5 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-shadow";
const hintClass = "text-xs text-[var(--text-muted)] pl-1";
const errorClass = "text-xs text-[var(--danger-text)] pl-1 font-medium";

function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <span id={`${id}-error`} className={errorClass} role="alert">
        {error}
      </span>
    );
  }
  if (hint) {
    return (
      <span id={`${id}-hint`} className={hintClass}>
        {hint}
      </span>
    );
  }
  return null;
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface NeumorphicInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Rendered inside the recessed well, right-aligned — e.g. a unit or an action icon. */
  trailing?: ReactNode;
}

export const NeumorphicInput = forwardRef<HTMLInputElement, NeumorphicInputProps>(
  ({ label, error, hint, trailing, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className={fieldWrapper}>
        {label && (
          <label htmlFor={inputId} className={labelClass}>
            {label}
          </label>
        )}
        {trailing ? (
          <div className={cn(fieldClass, "flex items-center gap-3 py-0 pr-2")}>
            <input
              ref={ref}
              id={inputId}
              className={cn(
                "flex-1 bg-transparent py-3 outline-none placeholder:text-[var(--text-muted)]",
                className,
              )}
              aria-invalid={!!error}
              aria-describedby={describedBy(inputId, error, hint)}
              {...props}
            />
            <span className="shrink-0 text-[var(--text-muted)]">{trailing}</span>
          </div>
        ) : (
          <input
            ref={ref}
            id={inputId}
            className={cn(fieldClass, error && "text-[var(--danger-text)]", className)}
            aria-invalid={!!error}
            aria-describedby={describedBy(inputId, error, hint)}
            {...props}
          />
        )}
        <FieldMessage id={inputId} error={error} hint={hint} />
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
          className={cn(fieldClass, "min-h-28 resize-y", error && "text-[var(--danger-text)]", className)}
          aria-invalid={!!error}
          aria-describedby={describedBy(inputId, error, hint)}
          {...props}
        />
        <FieldMessage id={inputId} error={error} hint={hint} />
      </div>
    );
  },
);
NeumorphicTextarea.displayName = "NeumorphicTextarea";

interface NeumorphicFileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

/** File picker whose native button is restyled as a raised neumorphic control. */
export const NeumorphicFileInput = forwardRef<HTMLInputElement, NeumorphicFileInputProps>(
  ({ label, hint, id, className, ...props }, ref) => {
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
          type="file"
          aria-describedby={hint ? `${inputId}-hint` : undefined}
          className={cn(
            "text-sm text-[var(--text-secondary)] cursor-pointer",
            "file:mr-4 file:cursor-pointer file:rounded-[var(--radius-control)] file:border-0",
            "file:px-4 file:py-2.5 file:text-sm file:font-medium",
            "file:text-[var(--text-primary)] file:neu-raised-sm file:neu-interactive",
            className,
          )}
          {...props}
        />
        {hint && (
          <span id={`${inputId}-hint`} className={hintClass}>
            {hint}
          </span>
        )}
      </div>
    );
  },
);
NeumorphicFileInput.displayName = "NeumorphicFileInput";

interface NeumorphicSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const NeumorphicSelect = forwardRef<HTMLSelectElement, NeumorphicSelectProps>(
  ({ label, error, hint, id, className, children, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className={fieldWrapper}>
        {label && (
          <label htmlFor={inputId} className={labelClass}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(fieldClass, "appearance-none cursor-pointer pr-10", className)}
          style={{
            // Chevron drawn inline so the control needs no wrapper element.
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235a6780' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
          }}
          aria-invalid={!!error}
          aria-describedby={describedBy(inputId, error, hint)}
          {...props}
        >
          {children}
        </select>
        <FieldMessage id={inputId} error={error} hint={hint} />
      </div>
    );
  },
);
NeumorphicSelect.displayName = "NeumorphicSelect";

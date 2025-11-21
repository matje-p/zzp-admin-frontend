import * as React from "react"
import { Label } from "./label"
import { cn } from "@/lib/utils"

/**
 * Form Field Context
 * Provides form field state to child components
 */
type FormFieldContextValue = {
  id: string
  name: string
  error?: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

export const useFormField = () => {
  const context = React.useContext(FormFieldContext)
  if (!context) {
    throw new Error("useFormField must be used within a FormField")
  }
  return context
}

/**
 * Form Field
 * Container for form inputs with label and error message
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  label?: string
  error?: string
  required?: boolean
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, name, label, error, required, children, ...props }, ref) => {
    const id = `field-${name}`

    return (
      <FormFieldContext.Provider value={{ id, name, error }}>
        <div ref={ref} className={cn("form-group", className)} {...props}>
          {label && (
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          {children}
          {error && (
            <span className="text-sm text-red-500 mt-1 block">{error}</span>
          )}
        </div>
      </FormFieldContext.Provider>
    )
  }
)
FormField.displayName = "FormField"

/**
 * Form Field Input
 * Automatically connected input that reads from FormField context
 */
export interface FormFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const FormFieldInput = React.forwardRef<HTMLInputElement, FormFieldInputProps>(
  ({ className, error, ...props }, ref) => {
    const { id, name, error: fieldError } = useFormField()

    return (
      <input
        ref={ref}
        id={id}
        name={name}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          (error || fieldError) && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
    )
  }
)
FormFieldInput.displayName = "FormFieldInput"

/**
 * Form Field Select
 * Automatically connected select that reads from FormField context
 */
export interface FormFieldSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const FormFieldSelect = React.forwardRef<HTMLSelectElement, FormFieldSelectProps>(
  ({ className, error, children, ...props }, ref) => {
    const { id, name, error: fieldError } = useFormField()

    return (
      <select
        ref={ref}
        id={id}
        name={name}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          (error || fieldError) && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
FormFieldSelect.displayName = "FormFieldSelect"

/**
 * Form Field Textarea
 * Automatically connected textarea that reads from FormField context
 */
export interface FormFieldTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const FormFieldTextarea = React.forwardRef<HTMLTextAreaElement, FormFieldTextareaProps>(
  ({ className, error, ...props }, ref) => {
    const { id, name, error: fieldError } = useFormField()

    return (
      <textarea
        ref={ref}
        id={id}
        name={name}
        className={cn(
          "flex min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          (error || fieldError) && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
    )
  }
)
FormFieldTextarea.displayName = "FormFieldTextarea"

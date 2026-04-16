interface FormFieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
}

export default function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

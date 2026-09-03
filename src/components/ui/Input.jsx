export default function Input({ label, error, className = '', containerClassName = '', required, ...props }) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="label-field">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input className={`input-field ${className}`} {...props} />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

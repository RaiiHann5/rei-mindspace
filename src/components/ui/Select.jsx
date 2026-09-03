export default function Select({ label, error, options = [], className = '', containerClassName = '', required, ...props }) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="label-field">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select className={`input-field ${className}`} {...props}>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export default function ContractPreview({ content, onChange, editable = true }) {
  return (
    <div id="printable-area" className="card p-6 sm:p-10 max-w-3xl mx-auto">
      {editable ? (
        <textarea
          className="w-full min-h-[500px] text-sm text-slate-700 leading-relaxed font-mono focus:outline-none resize-y"
          value={content}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">{content}</pre>
      )}
    </div>
  )
}

import { QRCodeCanvas } from 'qrcode.react'

export default function QRCodeBlock({ publicId, size = 100, showLink = true, label = 'Verify online' }) {
  const url = `${window.location.origin}/invoice/${publicId}`
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-2 bg-white rounded-lg border border-slate-200">
        <QRCodeCanvas value={url} size={size} />
      </div>
      {showLink && (
        <a href={url} target="_blank" rel="noreferrer" className="text-[11px] text-brand-600 hover:underline text-center break-all max-w-[160px]">
          {label}
        </a>
      )}
    </div>
  )
}

import { useMemo, useRef, useState } from 'react'
import { Upload, FileText, Image as ImageIcon, File as FileIcon, Trash2, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { isFirebaseConfigured, storage } from '@/lib/firebase'
import { formatDate } from '@/lib/utils'

const TYPE_ICON = { image: ImageIcon, doc: FileText, pdf: FileText }

function humanSize(bytes) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0, n = bytes
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

export default function FilesPage() {
  const { items, isLoading, createItem, removeItem } = useCollection('files')
  const inputRef = useRef()
  const [folder] = useState('General')

  const grouped = useMemo(() => {
    const g = {}
    items.forEach((f) => { g[f.folder || 'General'] = [...(g[f.folder || 'General'] || []), f] })
    return g
  }, [items])

  const onPick = async (e) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const type = ['png','jpg','jpeg','gif','webp','svg'].includes(ext) ? 'image' : ext === 'pdf' ? 'pdf' : 'doc'
      let url = null
      if (isFirebaseConfigured && storage) {
        try {
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
          const sref = ref(storage, `files/${Date.now()}_${file.name}`)
          await uploadBytes(sref, file)
          url = await getDownloadURL(sref)
        } catch (err) {
          toast.error('Upload failed, saving metadata only')
        }
      }
      await createItem({ name: file.name, type, size: file.size, folder, url })
    }
    toast.success(`${files.length} file${files.length > 1 ? 's' : ''} added`)
    e.target.value = ''
  }

  const del = async (f) => { if (confirm(`Delete "${f.name}"?`)) { await removeItem(f.id); toast.success('File removed') } }

  return (
    <div>
      <PageHeader
        title="Files"
        description={isFirebaseConfigured ? 'Uploaded to Firebase Storage.' : 'Local mode — metadata only, connect Firebase Storage to upload real files.'}
        actions={<>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={onPick} />
          <Button onClick={() => inputRef.current?.click()}><Upload size={16} /> Upload</Button>
        </>}
      />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No files yet" description="Upload documents and images to keep them organized." actionLabel="Upload" onAction={() => inputRef.current?.click()} />
      ) : (
        Object.entries(grouped).map(([folderName, files]) => (
          <div key={folderName} className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark mb-2">{folderName}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map((f) => {
                const Icon = TYPE_ICON[f.type] || FileIcon
                return (
                  <Card key={f.id} hover className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0"><Icon size={17} className="text-primary-500" /></div>
                    <div className="flex-1 min-w-0">
                      {f.url ? <a href={f.url} target="_blank" rel="noreferrer" className="text-sm font-medium truncate block hover:text-primary-500">{f.name}</a> : <p className="text-sm font-medium truncate">{f.name}</p>}
                      <p className="text-xs text-muted-light dark:text-muted-dark">{humanSize(f.size)} · {formatDate(f.createdAt)}</p>
                    </div>
                    <button onClick={() => del(f)} className="opacity-0 group-hover:opacity-100 hover:text-rose-500 shrink-0"><Trash2 size={14} /></button>
                  </Card>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

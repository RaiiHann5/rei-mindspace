export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
      <div>
        <h1 className="font-display text-[26px] md:text-[30px] font-semibold tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1.5 max-w-[62ch]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

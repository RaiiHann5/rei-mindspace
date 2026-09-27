// Page header. `tools` renders a second, contextual control row under the
// title row (the calendar's month navigator and event search live there), which
// is the two-bar pattern from the reference shells. Keeping the second row as a
// prop means a page opts in rather than every page carrying an empty bar.
export default function PageHeader({ title, description, actions, tools }) {
  return (
    <header className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[24px] md:text-[27px] font-semibold tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[13px] text-muted-light dark:text-muted-dark mt-1 max-w-[64ch]">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {tools && <div className="mt-4 flex flex-wrap items-center gap-2">{tools}</div>}
    </header>
  )
}

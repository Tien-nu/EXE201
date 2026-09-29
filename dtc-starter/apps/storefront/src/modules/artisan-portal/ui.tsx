import { clx } from "@modules/common/components/ui"

export const fieldClass =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2 txt-medium focus:border-violet-400 focus:outline-none"

export const Field = ({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) => (
  <label className={clx("flex flex-col gap-1", className)}>
    <span className="txt-small-plus">{label}</span>
    {children}
    {hint && <span className="txt-small text-ui-fg-subtle">{hint}</span>}
  </label>
)

export const Card = ({
  title,
  actions,
  children,
}: {
  title?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) => (
  <section className="rounded-lg border border-gray-200 bg-white p-5">
    {(title || actions) && (
      <div className="mb-4 flex items-center justify-between gap-2">
        {title && <h2 className="txt-xlarge-plus">{title}</h2>}
        {actions}
      </div>
    )}
    {children}
  </section>
)

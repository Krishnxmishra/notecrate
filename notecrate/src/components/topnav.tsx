interface TopNavProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopNav({ title, subtitle, actions }: TopNavProps) {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-neutral-200/60 bg-white px-5">
      <div className="flex items-center gap-3">
        {title && (
          <div className="flex items-baseline gap-2">
            <h1 className="text-[14px] font-semibold tracking-[-0.01em] text-neutral-900">
              {title}
            </h1>
            {subtitle && (
              <>
                <span className="text-neutral-300">/</span>
                <p className="text-[13px] text-neutral-400">{subtitle}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <button className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">
          K
        </button>
      </div>
    </header>
  );
}

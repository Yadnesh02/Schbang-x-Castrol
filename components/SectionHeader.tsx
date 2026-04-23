interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="text-[16px] font-bold tracking-tight text-ink-900">{title}</h2>
        {subtitle ? <p className="text-[12.5px] text-ink-500 mt-0.5">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

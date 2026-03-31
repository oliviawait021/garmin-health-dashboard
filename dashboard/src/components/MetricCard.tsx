interface MetricCardProps {
  label: string;
  value: string | number | null;
  unit?: string;
  status?: 'good' | 'moderate' | 'attention' | 'neutral';
  subtitle?: string;
}

const statusColor: Record<string, string> = {
  good:      'text-green-400',
  moderate:  'text-yellow-400',
  attention: 'text-red-400',
  neutral:   'text-slate-200',
};

export default function MetricCard({ label, value, unit, status = 'neutral', subtitle }: MetricCardProps) {
  const color = statusColor[status];

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-mono font-bold ${color}`}>
          {value ?? '—'}
        </span>
        {unit && value != null && (
          <span className="text-sm text-slate-500">{unit}</span>
        )}
      </div>
      {subtitle && (
        <span className="text-xs text-slate-600">{subtitle}</span>
      )}
    </div>
  );
}

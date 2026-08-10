interface StatsCardsProps {
  total: number;
  today: number;
  thisWeek: number;
}

export default function StatsCards({ total, today, thisWeek }: StatsCardsProps) {
  const stats = [
    { label: "Total Workers", value: total, color: "bg-blue-600", textColor: "text-blue-600", bg: "bg-blue-50" },
    { label: "Today", value: today, color: "bg-green-600", textColor: "text-green-600", bg: "bg-green-50" },
    { label: "This Week", value: thisWeek, color: "bg-purple-600", textColor: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-4">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
          <p className={`text-2xl font-bold ${s.textColor}`}>{s.value}</p>
          <p className="text-xs text-slate-600 mt-0.5 leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

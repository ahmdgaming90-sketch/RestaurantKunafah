import { DAY_NAMES_AR, type OpeningHour } from "@/types/database";

function formatTime(time: string | null) {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function OpeningHours({ hours }: { hours: OpeningHour[] }) {
  if (hours.length === 0) {
    return <p className="text-sm text-espresso/50">أوقات العمل غير متوفرة حاليًا.</p>;
  }

  return (
    <ul className="divide-y divide-espresso/10 text-sm">
      {hours.map((hour) => (
        <li key={hour.id} className="flex items-center justify-between py-2.5">
          <span className="text-espresso/70">{DAY_NAMES_AR[hour.day_of_week]}</span>
          <span className="font-medium text-espresso">
            {hour.is_closed ? "مغلق" : `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

"use client";

type Props = {
  months: string[];
  selectedMonth: string;
  basePath?: string;
};

export default function MonthSelector({
  months,
  selectedMonth,
  basePath = "",
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <label className="font-bold mr-3">表示月</label>

      <select
        value={selectedMonth}
        className="border rounded-lg px-4 py-2"
        onChange={(e) => {
          window.location.href = `${basePath}?month=${e.target.value}`;
        }}
      >
        {months.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
}
type Props = {
  current: any;
  previous: any | null;
};

function activeBrands(store: any) {
  return store.brands.filter((brand: any) => brand.sales > 0);
}

function avg(store: any, key: string) {
  const brands = activeBrands(store);
  if (brands.length === 0) return 0;

  return (
    brands.reduce((sum: number, brand: any) => sum + brand[key], 0) /
    brands.length
  );
}

function formatDiff(diff: number, suffix: string) {
  if (diff === 0) return "良好";

  const arrow = diff >= 0 ? "↗" : "↘";
  const sign = diff > 0 ? "+" : "";

  return `${arrow} ${sign}${diff.toFixed(1)}${suffix}`;
}

export default function KPIComparisonCards({ current, previous }: Props) {
  if (!previous) {
    return (
      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">前月比サマリー</h2>
        <p className="text-gray-500">前月データなし</p>
      </section>
    );
  }

  const salesDiff = current.totalSales - previous.totalSales;
  const salesPercent =
    previous.totalSales === 0 ? 0 : (salesDiff / previous.totalSales) * 100;

  const businessHoursDiff =
    avg(current, "businessHours") - avg(previous, "businessHours");

  const onlineRateDiff =
    avg(current, "onlineRate") - avg(previous, "onlineRate");

  const makeTimeDiff =
    avg(current, "makeTime") - avg(previous, "makeTime");

  const items = [
    {
      label: "売上",
      percent: `${salesDiff >= 0 ? "↗ +" : "↘ "}${salesPercent.toFixed(1)}%`,
      amount: `${salesDiff >= 0 ? "+" : ""}${salesDiff.toLocaleString()}円`,
      isPositive: salesDiff >= 0,
    },
    {
      label: "営業時間",
      value: formatDiff(businessHoursDiff, "時間"),
      isPositive: businessHoursDiff >= 0,
    },
    {
      label: "オンライン率",
      value: formatDiff(onlineRateDiff, "%"),
      isPositive: onlineRateDiff >= 0,
    },
    {
      label: "メイク時間",
      value: formatDiff(makeTimeDiff, "分"),
      isPositive: makeTimeDiff <= 0,
    },
  ];

  return (
    <section className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">前月比サマリー</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-xl p-5">
            <p className="text-gray-500">{item.label}</p>

            {item.label === "売上" ? (
              <div className="mt-2">
                <p
                  className={`text-2xl font-bold ${
                    item.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.percent}
                </p>
                <p
                  className={`text-sm ${
                    item.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.amount}
                </p>
              </div>
            ) : (
              <p
                className={`text-2xl font-bold mt-2 ${
                  item.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
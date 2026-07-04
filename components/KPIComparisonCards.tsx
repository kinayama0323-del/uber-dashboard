type Props = {
  current: any;
  previous: any | null;
  isCurrentMonth?: boolean;
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

function getDiffClass(diff: number) {
  return diff >= 0 ? "text-green-600" : "text-red-600";
}

function getArrow(diff: number, reverse = false) {
  if (diff === 0) return "→";

  if (reverse) {
    return diff <= 0 ? "↘" : "↗";
  }

  return diff >= 0 ? "↗" : "↘";
}

export default function KPIComparisonCards({
  current,
  previous,
  isCurrentMonth = false,
}: Props) {
  if (!previous) {
    return (
      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">前月比サマリー</h2>
        <p className="text-gray-500">前月データなし</p>
      </section>
    );
  }

  const currentSales = isCurrentMonth
    ? current.forecastSales
    : current.totalSales;

  const previousSales = previous.totalSales;

  const salesDiff = currentSales - previousSales;

  const salesPercent =
    previousSales === 0 ? 0 : (salesDiff / previousSales) * 100;

  const businessHoursDiff =
    avg(current, "businessHours") - avg(previous, "businessHours");

  const onlineRateDiff =
    avg(current, "onlineRate") - avg(previous, "onlineRate");

  const makeTimeDiff =
    avg(current, "makeTime") - avg(previous, "makeTime");

  return (
    <section className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">前月比サマリー</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-gray-500">
            売上{isCurrentMonth ? "（予測）" : ""}
          </p>
          <p className={`text-2xl font-bold mt-2 ${getDiffClass(salesDiff)}`}>
            {getArrow(salesDiff)} {salesPercent >= 0 ? "+" : ""}
            {salesPercent.toFixed(1)}%
          </p>
          <p className={`text-sm mt-1 ${getDiffClass(salesDiff)}`}>
            {salesDiff >= 0 ? "+" : ""}
            {Math.round(salesDiff).toLocaleString()}円
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-gray-500">営業時間</p>
          <p
            className={`text-2xl font-bold mt-2 ${getDiffClass(
              businessHoursDiff
            )}`}
          >
            {getArrow(businessHoursDiff)}{" "}
            {businessHoursDiff >= 0 ? "+" : ""}
            {businessHoursDiff.toFixed(1)}時間
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-gray-500">オンライン率</p>
          <p
            className={`text-2xl font-bold mt-2 ${getDiffClass(
              onlineRateDiff
            )}`}
          >
            {getArrow(onlineRateDiff)} {onlineRateDiff >= 0 ? "+" : ""}
            {onlineRateDiff.toFixed(1)}%
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-gray-500">メイク時間</p>
          <p
            className={`text-2xl font-bold mt-2 ${
              makeTimeDiff <= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {getArrow(makeTimeDiff, true)} {makeTimeDiff >= 0 ? "+" : ""}
            {makeTimeDiff.toFixed(1)}分
          </p>
        </div>
      </div>
    </section>
  );
}
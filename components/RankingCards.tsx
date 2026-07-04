type Props = {
  stores: any[];
  growthStores: any[];
  isCurrentMonth?: boolean;
};

export default function RankingCards({
  stores,
  growthStores,
  isCurrentMonth = false,
}: Props) {
  const salesTop = [...stores]
    .sort((a, b) => {
      const aSales = isCurrentMonth ? a.forecastSales : a.totalSales;
      const bSales = isCurrentMonth ? b.forecastSales : b.totalSales;
      return bSales - aSales;
    })
    .slice(0, 10);

  const ratingTop = [...stores]
    .filter((s) => s.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10);

  const growthTop = [...growthStores]
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 10);

  const improvementTop = [...stores]
    .filter((store) => store.commitJudge === "×")
    .sort((a, b) => {
      const aSales = isCurrentMonth ? a.forecastSales : a.totalSales;
      const bSales = isCurrentMonth ? b.forecastSales : b.totalSales;
      return bSales - aSales;
    })
    .slice(0, 10);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          🏆 売上TOP10
          {isCurrentMonth && (
            <span className="text-sm text-gray-500 ml-2">予測</span>
          )}
        </h2>

        <div className="space-y-2">
          {salesTop.map((store, index) => {
            const sales = isCurrentMonth
              ? store.forecastSales
              : store.totalSales;

            return (
              <div
                key={store.slug}
                className="flex justify-between border-b pb-2"
              >
                <span>
                  {index + 1}. {store.storeName}
                </span>
                <span className="font-bold">
                  ¥{Math.round(sales).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">⭐ 評価TOP10</h2>

        <div className="space-y-2">
          {ratingTop.map((store, index) => (
            <div
              key={store.slug}
              className="flex justify-between border-b pb-2"
            >
              <span>
                {index + 1}. {store.storeName}
              </span>
              <span className="font-bold">
                {store.averageRating.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">📈 売上成長率TOP10</h2>

        <div className="space-y-2">
          {growthTop.map((store, index) => (
            <div
              key={store.slug}
              className="flex justify-between border-b pb-2"
            >
              <span>
                {index + 1}. {store.storeName}
              </span>
              <span className="font-bold text-green-600">
                +{store.growth.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">🚨 要改善TOP10</h2>

        <div className="space-y-2">
          {improvementTop.map((store, index) => {
            const sales = isCurrentMonth
              ? store.forecastSales
              : store.totalSales;

            return (
              <div
                key={store.slug}
                className="flex justify-between border-b pb-2"
              >
                <span>
                  {index + 1}. {store.storeName}
                </span>
                <span className="font-bold text-red-600">
                  ¥{Math.round(sales).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
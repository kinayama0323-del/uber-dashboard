type Props = {
  stores: any[];
  growthStores: any[];
};

export default function RankingCards({ stores, growthStores }: Props) {
  const salesTop = [...stores]
    .sort((a, b) => b.totalSales - a.totalSales)
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
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 10);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">🏆 売上TOP10</h2>
        <div className="space-y-2">
          {salesTop.map((store, index) => (
            <div key={store.slug} className="flex justify-between border-b pb-2">
              <span>{index + 1}. {store.storeName}</span>
              <span className="font-bold">¥{store.totalSales.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">⭐ 評価TOP10</h2>
        <div className="space-y-2">
          {ratingTop.map((store, index) => (
            <div key={store.slug} className="flex justify-between border-b pb-2">
              <span>{index + 1}. {store.storeName}</span>
              <span className="font-bold">{store.averageRating.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">📈 売上成長率TOP10</h2>
        <div className="space-y-2">
          {growthTop.map((store, index) => (
            <div key={store.slug} className="flex justify-between border-b pb-2">
              <span>{index + 1}. {store.storeName}</span>
              <span className="font-bold text-green-600">
                {store.growth >= 0 ? "+" : ""}
                {store.growth.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">🚨 要改善TOP10</h2>
        <div className="space-y-2">
          {improvementTop.map((store, index) => (
            <div key={store.slug} className="flex justify-between border-b pb-2">
              <span>{index + 1}. {store.storeName}</span>
              <span className="font-bold text-red-600">
                ¥{store.totalSales.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
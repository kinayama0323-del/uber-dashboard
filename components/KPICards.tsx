type Props = {
  stores: any[];
  isCurrentMonth?: boolean;
};

export function KPICards({ stores, isCurrentMonth = false }: Props) {
  const forecastTotalSales = stores.reduce((sum, store) => {
    return sum + (store.forecastSales || 0);
  }, 0);

  const actualTotalSales = stores.reduce((sum, store) => {
    return sum + (store.totalSales || 0);
  }, 0);

  const displaySales = isCurrentMonth
    ? forecastTotalSales
    : actualTotalSales;

  const activeStores = stores.filter((store) => store.totalSales > 0);

  const averageRating =
    activeStores.length === 0
      ? 0
      : activeStores.reduce((sum, store) => sum + store.averageRating, 0) /
        activeStores.length;

  const brandCount = stores.reduce((sum, store) => {
    return (
      sum +
      store.brands.filter((brand: any) => brand.sales > 0).length
    );
  }, 0);
const totalStoreViews = stores.reduce((sum, store) => {
  return sum + (store.storeViews || 0);
}, 0);

const totalOrderUsers = stores.reduce((sum, store) => {
  return sum + (store.orderUsers || 0);
}, 0);

const averageClRate =
  stores.length === 0
    ? 0
    : stores.reduce((sum, store) => {
        return sum + (store.clRate || 0);
      }, 0) / stores.length;
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">
          {isCurrentMonth ? "予測売上" : "総売上"}
        </p>

        <p className="text-3xl font-bold">
          ¥{Math.round(displaySales).toLocaleString()}
        </p>

        {isCurrentMonth && (
          <p className="text-sm text-gray-500 mt-2">
            実績：¥{Math.round(actualTotalSales).toLocaleString()}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">店舗数</p>
        <p className="text-3xl font-bold">{activeStores.length}店舗</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">運営ブランド数</p>
        <p className="text-3xl font-bold">{brandCount}ブランド</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">平均評価</p>
        <p className="text-3xl font-bold">
          {averageRating === 0
            ? "評価なし"
            : `${averageRating.toFixed(2)} ⭐`}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
  <p className="text-gray-500">総PV</p>
  <p className="text-3xl font-bold">
    {totalStoreViews.toLocaleString()}
  </p>
</div>

<div className="bg-white rounded-xl shadow p-6">
  <p className="text-gray-500">総注文者数</p>
  <p className="text-3xl font-bold">
    {totalOrderUsers.toLocaleString()}
  </p>
</div>

<div className="bg-white rounded-xl shadow p-6">
  <p className="text-gray-500">平均CL率</p>
  <p className="text-3xl font-bold">
    {averageClRate.toFixed(2)}%
  </p>
</div>
    </div>
    
  );
  
}
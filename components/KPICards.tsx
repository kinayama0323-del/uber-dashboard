type Props = {
  stores: any[];
  isCurrentMonth?: boolean;
};

export function KPICards({
  stores,
  isCurrentMonth = false,
}: Props) {
  const forecastTotalSales = stores.reduce(
    (sum, store) => sum + (store.forecastSales || 0),
    0
  );

  const actualTotalSales = stores.reduce(
    (sum, store) => sum + (store.totalSales || 0),
    0
  );

  const displaySales = isCurrentMonth
    ? forecastTotalSales
    : actualTotalSales;

  // 売上がある店舗のみ
  const activeStores = stores.filter((store) =>
    store.brands.some((brand: any) => brand.sales > 0)
  );

  // 売上があるブランドのみ
  const activeBrands = stores.flatMap((store) =>
    store.brands.filter((brand: any) => brand.sales > 0)
  );

  const averageRating =
    activeStores.length === 0
      ? 0
      : activeStores.reduce(
          (sum, store) => sum + store.averageRating,
          0
        ) / activeStores.length;

  const brandCount = activeBrands.length;

  const totalStoreViews = activeBrands.reduce(
    (sum: number, brand: any) =>
      sum + (brand.storeViews || 0),
    0
  );

  const totalMenuViews = activeBrands.reduce(
    (sum: number, brand: any) =>
      sum + (brand.menuViews || 0),
    0
  );

  const totalOrderUsers = activeBrands.reduce(
    (sum: number, brand: any) =>
      sum + (brand.orderUsers || 0),
    0
  );

  const averageClRate =
    totalMenuViews === 0
      ? 0
      : (totalOrderUsers / totalMenuViews) * 100;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* 売上 */}
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-700 font-bold">
          {isCurrentMonth ? "予測売上" : "総売上"}
        </p>

        <p className="text-3xl font-black text-gray-950">
          ¥{Math.round(displaySales).toLocaleString()}
        </p>

        {isCurrentMonth && (
          <p className="text-sm text-gray-700 font-bold mt-2">
            実績：¥
            {Math.round(actualTotalSales).toLocaleString()}
          </p>
        )}
      </div>

      {/* 店舗数 */}
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-700 font-bold">店舗数</p>
        <p className="text-3xl font-black text-gray-950">
          {activeStores.length.toLocaleString()}店舗
        </p>
      </div>

      {/* ブランド数 */}
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-700 font-bold">
          運営ブランド数
        </p>
        <p className="text-3xl font-black text-gray-950">
          {brandCount.toLocaleString()}ブランド
        </p>
      </div>

      {/* 評価 */}
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-700 font-bold">
          平均評価
        </p>

        <p className="text-3xl font-black text-gray-950">
          {averageRating === 0
            ? "評価なし"
            : `${averageRating.toFixed(2)} ⭐`}
        </p>
      </div>

      {/* PV */}
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-700 font-bold">
          総店舗閲覧数
        </p>

        <p className="text-3xl font-black text-gray-950">
          {totalStoreViews.toLocaleString()}
        </p>

        <p className="text-sm text-gray-600 mt-2">
          メニュー閲覧：
          {totalMenuViews.toLocaleString()}
        </p>
      </div>

      {/* 注文者 */}
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-700 font-bold">
          総注文者数
        </p>

        <p className="text-3xl font-black text-gray-950">
          {totalOrderUsers.toLocaleString()}
        </p>
      </div>

      {/* CL率 */}
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-700 font-bold">
          平均CL率
        </p>

        <p className="text-3xl font-black text-gray-950">
          {averageClRate.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
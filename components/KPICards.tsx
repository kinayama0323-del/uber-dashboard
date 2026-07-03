type Props = {
  stores: any[];
};

export function KPICards({ stores }: Props) {
  const totalStores = new Set(
  stores.map((store) => store.slug)
).size;

const totalBrands = new Set(
  stores.flatMap((store) =>
    store.brands
      .filter((brand: any) => brand.sales > 0)
      .map((brand: any) => `${store.slug}-${brand.brandName}`)
  )
).size;

  const totalSales = stores.reduce((sum, store) => sum + store.totalSales, 0);

  const storesWithRating = stores.filter((store) => store.averageRating > 0);

  const averageRating =
    storesWithRating.length === 0
      ? 0
      : storesWithRating.reduce((sum, store) => sum + store.averageRating, 0) /
        storesWithRating.length;

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">店舗数</p>
        <p className="text-3xl font-bold">{totalStores}店舗</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">運営ブランド数</p>
        <p className="text-3xl font-bold">{totalBrands}ブランド</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">総売上</p>
        <p className="text-3xl font-bold">¥{totalSales.toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">平均評価</p>
        <p className="text-3xl font-bold">
          {averageRating === 0 ? "評価なし" : `${averageRating.toFixed(2)} ⭐`}
        </p>
      </div>
    </div>
  );
}
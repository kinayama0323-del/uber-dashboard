import Link from "next/link";
import {
  getAvailableMonths,
  getStoresByMonth,
} from "../../../lib/sheets";
import Sidebar from "../../../components/Sidebar";

type SortKey = "sales" | "pv" | "orders" | "cl";

type Props = {
  searchParams: Promise<{
    month?: string;
    sort?: string;
  }>;
};

function getActiveBrands(store: any) {
  return store.brands.filter(
    (brand: any) => Number(brand.sales || 0) > 0
  );
}

function getAverage(
  brands: any[],
  key: "businessHours" | "onlineRate" | "makeTime"
) {
  if (brands.length === 0) return 0;

  return (
    brands.reduce(
      (sum: number, brand: any) =>
        sum + Number(brand[key] || 0),
      0
    ) / brands.length
  );
}

function getBrandTotal(
  brands: any[],
  key: "storeViews" | "menuViews" | "orderUsers"
) {
  return brands.reduce(
    (sum: number, brand: any) =>
      sum + Number(brand[key] || 0),
    0
  );
}

function normalizeSort(value?: string): SortKey {
  if (
    value === "pv" ||
    value === "orders" ||
    value === "cl"
  ) {
    return value;
  }

  return "sales";
}

export default async function SalesAnalysisPage({
  searchParams,
}: Props) {
  const { month, sort } = await searchParams;

  const months = await getAvailableMonths();
  const selectedMonth = month || months[0] || "";
  const selectedSort = normalizeSort(sort);

  const stores = selectedMonth
    ? await getStoresByMonth(selectedMonth)
    : [];

  const isCurrentMonth =
    selectedMonth !== "" && selectedMonth === months[0];

  const activeStores = stores
    .map((store) => {
      const activeBrands = getActiveBrands(store);

      const storeViews = getBrandTotal(
        activeBrands,
        "storeViews"
      );

      const menuViews = getBrandTotal(
        activeBrands,
        "menuViews"
      );

      const orderUsers = getBrandTotal(
        activeBrands,
        "orderUsers"
      );

      const clRate =
        menuViews > 0
          ? (orderUsers / menuViews) * 100
          : 0;

      return {
        ...store,
        activeBrands,
        businessHours: getAverage(
          activeBrands,
          "businessHours"
        ),
        onlineRate: getAverage(
          activeBrands,
          "onlineRate"
        ),
        makeTime: getAverage(
          activeBrands,
          "makeTime"
        ),
        storeViews,
        menuViews,
        orderUsers,
        clRate,
      };
    })
    .filter((store) => store.activeBrands.length > 0)
    .sort((a, b) => {
      if (selectedSort === "pv") {
        return b.storeViews - a.storeViews;
      }

      if (selectedSort === "orders") {
        return b.orderUsers - a.orderUsers;
      }

      if (selectedSort === "cl") {
        return b.clRate - a.clRate;
      }

      const salesA = isCurrentMonth
        ? Number(a.forecastSales || 0)
        : Number(a.totalSales || 0);

      const salesB = isCurrentMonth
        ? Number(b.forecastSales || 0)
        : Number(b.totalSales || 0);

      return salesB - salesA;
    });

  const sortLabel: Record<SortKey, string> = {
    sales: isCurrentMonth
      ? "予測売上順"
      : "実績売上順",
    pv: "店舗閲覧者数順",
    orders: "注文者数順",
    cl: "CL率順",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="min-h-screen flex-1 bg-gray-100">
        <header className="bg-green-600 p-6 text-white shadow">
          <h1 className="text-3xl font-bold">
            📈 売上分析
          </h1>
        </header>

        <div className="mx-auto max-w-[1700px] p-4 md:p-8">
          <section className="mb-6 rounded-xl bg-white p-5 shadow">
            <form
              method="get"
              action="/admin-gk-manage/sales"
              className="flex flex-col gap-4 md:flex-row md:items-end"
            >
              <label className="flex flex-col gap-2">
                <span className="font-bold text-gray-800">
                  表示月
                </span>

                <select
                  name="month"
                  defaultValue={selectedMonth}
                  className="min-w-44 rounded-lg border border-gray-300 bg-white px-4 py-2 font-bold text-gray-950"
                >
                  {months.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-bold text-gray-800">
                  並び替え
                </span>

                <select
                  name="sort"
                  defaultValue={selectedSort}
                  className="min-w-52 rounded-lg border border-gray-300 bg-white px-4 py-2 font-bold text-gray-950"
                >
                  <option value="sales">
                    {isCurrentMonth
                      ? "予測売上順"
                      : "実績売上順"}
                  </option>
                  <option value="pv">
                    店舗閲覧者数順
                  </option>
                  <option value="orders">
                    注文者数順
                  </option>
                  <option value="cl">
                    CL率順
                  </option>
                </select>
              </label>

              <button
                type="submit"
                className="rounded-lg bg-gray-950 px-6 py-2 font-bold text-white hover:bg-gray-800"
              >
                表示する
              </button>
            </form>
          </section>

          {activeStores.length > 0 &&
            activeStores[0].closeDate && (
              <div className="mb-6 rounded-xl bg-white px-6 py-3 shadow">
                <span className="text-sm font-bold text-gray-700">
                  集計時点：
                  {activeStores[0].closeDate}
                </span>
              </div>
            )}

          <section className="rounded-xl bg-white p-4 shadow md:p-6">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-950">
                  全店舗 売上一覧
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  売上がある店舗のみ表示／現在の並び：
                  {sortLabel[selectedSort]}
                </p>
              </div>

              <p className="font-bold text-gray-700">
                {activeStores.length.toLocaleString()}
                店舗
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] border-collapse text-sm text-gray-950">
                <thead>
                  <tr className="bg-gray-950 text-white">
                    <th className="border border-gray-700 p-3 text-center font-bold text-white">
                      順位
                    </th>

                    <th className="border border-gray-700 p-3 text-left font-bold text-white">
                      店舗名
                    </th>

                    <th className="border border-gray-700 p-3 text-right font-bold text-white">
                      予測売上
                    </th>

                    <th className="border border-gray-700 p-3 text-right font-bold text-white">
                      実績売上
                    </th>

                    <th className="border border-gray-700 p-3 text-right font-bold text-white">
                      営業時間
                    </th>

                    <th className="border border-gray-700 p-3 text-right font-bold text-white">
                      オンライン率
                    </th>

                    <th className="border border-gray-700 p-3 text-right font-bold text-white">
                      メイク時間
                    </th>

                    <th className="border border-gray-700 p-3 text-right font-bold text-white">
                      店舗閲覧者数
                    </th>

                    <th className="border border-gray-700 p-3 text-right font-bold text-white">
                      メニュー閲覧数
                    </th>

                    <th className="border border-gray-700 p-3 text-right font-bold text-white">
                      注文者数
                    </th>

                    <th className="border border-gray-700 p-3 text-right font-bold text-white">
                      CL率
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activeStores.map(
                    (store, index) => (
                      <tr
                        key={`${store.slug}-${store.month}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="border p-3 text-center font-bold">
                          {index + 1}
                        </td>

                        <td className="border p-3 font-bold">
                          <Link
                            href={`/report/${store.slug}?month=${selectedMonth}`}
                            className="text-blue-700 hover:underline"
                          >
                            {store.storeName}
                          </Link>
                        </td>

                        <td className="border p-3 text-right font-bold">
                          ¥
                          {Math.round(
                            Number(
                              store.forecastSales || 0
                            )
                          ).toLocaleString()}
                        </td>

                        <td className="border p-3 text-right font-bold">
                          ¥
                          {Math.round(
                            Number(
                              store.totalSales || 0
                            )
                          ).toLocaleString()}
                        </td>

                        <td className="border p-3 text-right">
                          {store.businessHours.toFixed(
                            1
                          )}
                          h
                        </td>

                        <td className="border p-3 text-right">
                          {store.onlineRate.toFixed(
                            2
                          )}
                          %
                        </td>

                        <td className="border p-3 text-right">
                          {store.makeTime.toFixed(
                            2
                          )}
                          分
                        </td>

                        <td className="border p-3 text-right font-bold">
                          {Math.round(
                            store.storeViews
                          ).toLocaleString()}
                        </td>

                        <td className="border p-3 text-right font-bold">
                          {Math.round(
                            store.menuViews
                          ).toLocaleString()}
                        </td>

                        <td className="border p-3 text-right font-bold">
                          {Math.round(
                            store.orderUsers
                          ).toLocaleString()}
                        </td>

                        <td className="border p-3 text-right font-bold">
                          {store.clRate.toFixed(2)}%
                        </td>
                      </tr>
                    )
                  )}

                  {activeStores.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="border p-8 text-center font-bold text-gray-600"
                      >
                        対象店舗がありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
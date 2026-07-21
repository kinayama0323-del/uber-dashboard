import StoreTrendChart from "../../../components/StoreTrendChart";
import { notFound } from "next/navigation";
import {
  getAvailableMonths,
  getStoresByMonth,
  getStoreHistory,
  getPreviousMonthStore,
} from "../../../lib/sheets";
import MonthSelector from "../../../components/MonthSelector";
import KPIComparisonCards from "../../../components/KPIComparisonCards";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ month?: string }>;
};

function JudgeBadge({
  type,
  value,
}: {
  type:
    | "rating"
    | "businessHours"
    | "onlineRate"
    | "missedRate"
    | "makeTime";
  value: number;
}) {
  let label = "標準";
  let className = "bg-gray-100 text-gray-700";

  if (type === "rating") {
    if (value >= 4.5) {
      label = "良好";
      className = "bg-green-100 text-green-700";
    } else if (value < 4.0) {
      label = "要改善";
      className = "bg-red-100 text-red-700";
    }
  }

  if (type === "businessHours") {
    if (value >= 180) {
      label = "良好";
      className = "bg-green-100 text-green-700";
    } else {
      label = "要改善";
      className = "bg-red-100 text-red-700";
    }
  }

  if (type === "onlineRate") {
    if (value >= 98) {
      label = "良好";
      className = "bg-green-100 text-green-700";
    } else if (value < 90) {
      label = "要改善";
      className = "bg-red-100 text-red-700";
    }
  }

  if (type === "missedRate") {
    if (value <= 1) {
      label = "良好";
      className = "bg-green-100 text-green-700";
    } else {
      label = "要改善";
      className = "bg-red-100 text-red-700";
    }
  }

  if (type === "makeTime") {
    if (value <= 5) {
      label = "良好";
      className = "bg-green-100 text-green-700";
    } else if (value > 10) {
      label = "要改善";
      className = "bg-red-100 text-red-700";
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${className}`}
    >
      {label}
    </span>
  );
}

function getQualityJudge(store: any) {
  const ngItems = new Set<string>();

  store.brands.forEach((brand: any) => {
    if (brand.rating > 0 && brand.rating < 4.0) {
      ngItems.add("rating");
    }

    if (brand.businessHours < 180) {
      ngItems.add("businessHours");
    }

    if (brand.onlineRate < 90) {
      ngItems.add("onlineRate");
    }

    if (brand.missedRate > 1) {
      ngItems.add("missedRate");
    }

    if (brand.makeTime > 10) {
      ngItems.add("makeTime");
    }
  });

  const ngCount = ngItems.size;

  if (ngCount === 0) {
    return {
      label: "良好",
      className: "bg-green-100 text-green-700",
    };
  }

  if (ngCount === 1) {
    return {
      label: "もう一歩",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "要改善",
    className: "bg-red-100 text-red-700",
  };
}

function getImprovementComments(store: any) {
  const comments: string[] = [];

  const activeBrands = store.brands.filter(
    (brand: any) => brand.sales > 0
  );

  if (
    activeBrands.some(
      (brand: any) =>
        brand.rating > 0 && brand.rating < 4.0
    )
  ) {
    comments.push(
      "店舗評価が4.0を下回っているブランドがあります。商品品質・梱包・提供スピード・レビュー内容の確認をおすすめします。"
    );
  }

  if (
    activeBrands.some(
      (brand: any) => brand.businessHours < 180
    )
  ) {
    comments.push(
      "営業時間が180時間未満のブランドがあります。稼働時間を増やすことで、注文機会の増加が期待できます。"
    );
  }

  if (
    activeBrands.some(
      (brand: any) => brand.onlineRate < 90
    )
  ) {
    comments.push(
      "オンライン率が90%未満のブランドがあります。営業中のオフライン時間を減らすことで、売上機会損失を防げます。"
    );
  }

  if (
    activeBrands.some(
      (brand: any) => brand.missedRate > 1
    )
  ) {
    comments.push(
      "未受注率が1%を超えているブランドがあります。注文通知・端末確認・受注体制の見直しをおすすめします。"
    );
  }

  if (
    activeBrands.some(
      (brand: any) => brand.makeTime > 10
    )
  ) {
    comments.push(
      "メイク時間が10分を超えているブランドがあります。調理導線・仕込み量・ピーク時対応の見直しが有効です。"
    );
  }

  if (comments.length === 0) {
    comments.push(
      "主要な運営品質項目は基準を満たしています。現在の運営状態を維持しながら、売上拡大を目指しましょう。"
    );
  }

  return comments;
}

export default async function StoreDetailPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { month } = await searchParams;

  const months = await getAvailableMonths();
  const history = await getStoreHistory(slug);

  if (history.length === 0) {
    notFound();
  }

  const storeMonths = history
    .map((item) => item.month)
    .sort()
    .reverse();

  const selectedMonth = month || storeMonths[0];

  const stores = await getStoresByMonth(selectedMonth);

  const store = stores.find(
    (item) => item.slug === slug
  );

  if (!store) {
    notFound();
  }

  const previousStore =
    await getPreviousMonthStore(
      slug,
      selectedMonth
    );

  const isCurrentMonth =
    selectedMonth === months[0];

  const qualityJudge =
    getQualityJudge(store);

  const improvementComments =
    getImprovementComments(store);

  const salesChartData = history.map(
    (item) => ({
      month: item.month,
      value: item.totalSales,
    })
  );

  const ratingChartData = history.map(
    (item) => ({
      month: item.month,
      value: item.averageRating,
    })
  );

  const businessHoursChartData =
    history.map((item) => ({
      month: item.month,
      value:
        item.brands.length === 0
          ? 0
          : item.brands.reduce(
              (sum, brand) =>
                sum + brand.businessHours,
              0
            ) / item.brands.length,
    }));

  const onlineRateChartData =
    history.map((item) => ({
      month: item.month,
      value:
        item.brands.length === 0
          ? 0
          : item.brands.reduce(
              (sum, brand) =>
                sum + brand.onlineRate,
              0
            ) / item.brands.length,
    }));

  const missedRateChartData =
    history.map((item) => ({
      month: item.month,
      value:
        item.brands.length === 0
          ? 0
          : item.brands.reduce(
              (sum, brand) =>
                sum + brand.missedRate,
              0
            ) / item.brands.length,
    }));

  const makeTimeChartData =
    history.map((item) => ({
      month: item.month,
      value:
        item.brands.length === 0
          ? 0
          : item.brands.reduce(
              (sum, brand) =>
                sum + brand.makeTime,
              0
            ) / item.brands.length,
    }));

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-green-600 p-8 text-white">
        <p className="text-sm opacity-90">
          月次実績レポート
        </p>

        <h1 className="mt-2 text-3xl font-black text-gray-950">
          {store.storeName}
        </h1>

        <p className="mt-2 opacity-90">
          {store.month}
          {store.closeDate &&
            `　${store.closeDate}`}
        </p>
      </header>

      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <MonthSelector
          months={storeMonths}
          selectedMonth={selectedMonth}
          basePath={`/report/${slug}`}
        />

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="font-bold text-gray-700">
              {isCurrentMonth
                ? "予測売上"
                : "総売上"}
            </p>

            <p className="text-3xl font-black text-gray-950">
              ¥
              {Math.round(
                isCurrentMonth
                  ? store.forecastSales
                  : store.totalSales
              ).toLocaleString()}
            </p>

            {isCurrentMonth && (
              <p className="mt-2 text-sm font-bold text-gray-700">
                （{store.closeDate}実績：¥
                {Math.round(
                  store.totalSales
                ).toLocaleString()}
                ）
              </p>
            )}
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="font-bold text-gray-700">
              平均評価
            </p>

            <p className="text-3xl font-black text-gray-950">
              {store.averageRating === 0
                ? "評価なし"
                : `${store.averageRating.toFixed(
                    2
                  )} ⭐`}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="font-bold text-gray-700">
              運営品質判定
            </p>

            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${qualityJudge.className}`}
              >
                {qualityJudge.label}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="font-bold text-gray-700">
              運営ブランド数
            </p>

            <p className="text-3xl font-black text-gray-950">
              {
                store.brands.filter(
                  (brand) =>
                    brand.sales > 0
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="font-bold text-gray-700">
              店舗閲覧者数
            </p>

            <p className="text-3xl font-black text-gray-950">
              {Math.round(
                store.storeViews || 0
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="font-bold text-gray-700">
              メニュー閲覧数
            </p>

            <p className="text-3xl font-black text-gray-950">
              {Math.round(
                store.menuViews || 0
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="font-bold text-gray-700">
              注文者数
            </p>

            <p className="text-3xl font-black text-gray-950">
              {Math.round(
                store.orderUsers || 0
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="font-bold text-gray-700">
              CL率
            </p>

            <p className="text-3xl font-black text-gray-950">
              {(store.clRate || 0).toFixed(2)}
              %
            </p>
          </div>
        </div>

        <KPIComparisonCards
          current={store}
          previous={previousStore}
          isCurrentMonth={isCurrentMonth}
        />

<section className="mb-8 rounded-xl bg-white p-4 shadow md:p-6">
  <h2 className="mb-4 text-2xl font-bold text-gray-950">
    ブランド別 運営品質
  </h2>

  <div className="overflow-x-auto">
    <table className="w-full min-w-[1600px] border-collapse text-sm text-gray-950">
      <thead>
        <tr className="bg-gray-950 text-white">
          <th className="border border-gray-700 p-3 text-left font-bold text-white">
            ブランド名
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            売上
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            店舗評価
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            営業時間
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            オンライン率
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            未受注率
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            メイク時間
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            店舗閲覧者数
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            メニュー閲覧数
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            注文者数
          </th>

          <th className="border border-gray-700 p-3 font-bold text-white">
            CL率
          </th>
        </tr>
      </thead>

      <tbody>
        {store.brands.map((brand, index) => (
          <tr key={`${brand.brandName}-${index}`}>
            <td className="border p-3 font-bold text-gray-950">
              {brand.brandName}
            </td>

            <td className="border p-3 text-right font-semibold text-gray-950">
              ¥{Math.round(brand.sales || 0).toLocaleString()}
            </td>

            <td className="border p-3 text-center font-semibold text-gray-950">
              {brand.rating === 0 ? (
                <span className="text-gray-700">
                  評価なし
                </span>
              ) : (
                <>
                  <span className="font-bold text-gray-950">
                    {brand.rating.toFixed(2)}
                  </span>{" "}
                  <JudgeBadge
                    type="rating"
                    value={brand.rating}
                  />
                </>
              )}
            </td>

            <td className="border p-3 text-center font-semibold text-gray-950">
              {brand.businessHours.toFixed(1)}h{" "}
              <JudgeBadge
                type="businessHours"
                value={brand.businessHours}
              />
            </td>

            <td className="border p-3 text-center font-semibold text-gray-950">
              {brand.onlineRate.toFixed(2)}%{" "}
              <JudgeBadge
                type="onlineRate"
                value={brand.onlineRate}
              />
            </td>

            <td className="border p-3 text-center font-semibold text-gray-950">
              {brand.missedRate.toFixed(2)}%{" "}
              <JudgeBadge
                type="missedRate"
                value={brand.missedRate}
              />
            </td>

            <td className="border p-3 text-center font-semibold text-gray-950">
              {brand.makeTime.toFixed(2)}分{" "}
              <JudgeBadge
                type="makeTime"
                value={brand.makeTime}
              />
            </td>

            <td className="border p-3 text-right font-semibold text-gray-950">
              {Math.round(
                brand.storeViews || 0
              ).toLocaleString()}
            </td>

            <td className="border p-3 text-right font-semibold text-gray-950">
              {Math.round(
                brand.menuViews || 0
              ).toLocaleString()}
            </td>

            <td className="border p-3 text-right font-semibold text-gray-950">
              {Math.round(
                brand.orderUsers || 0
              ).toLocaleString()}
            </td>

            <td className="border p-3 text-center font-bold text-gray-950">
              {(brand.clRate || 0).toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>

        <section className="mb-8">
          <StoreTrendChart
            title="売上推移"
            data={salesChartData}
          />
        </section>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <StoreTrendChart
            title="平均評価推移"
            data={ratingChartData}
            yMin={0}
            yMax={5}
            referenceValue={4.5}
            referenceLabel="4.5"
          />

          <StoreTrendChart
            title="営業時間推移"
            data={businessHoursChartData}
            referenceValue={180}
            referenceLabel="180h"
          />

          <StoreTrendChart
            title="オンライン率推移"
            data={onlineRateChartData}
            yMin={0}
            yMax={100}
            referenceValue={90}
            referenceLabel="90%"
          />

          <StoreTrendChart
            title="未受注率推移"
            data={missedRateChartData}
            yMin={0}
            referenceValue={1}
            referenceLabel="1%"
          />

          <StoreTrendChart
            title="メイク時間推移"
            data={makeTimeChartData}
            yMin={0}
            referenceValue={10}
            referenceLabel="10分"
          />
        </div>

        <section className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="mb-3 text-xl font-bold text-gray-950">
            改善ポイント
          </h2>

          <ul className="list-disc space-y-3 pl-6 leading-7 text-gray-950">
            {improvementComments.map(
              (comment, index) => (
                <li key={index}>
                  {comment}
                </li>
              )
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
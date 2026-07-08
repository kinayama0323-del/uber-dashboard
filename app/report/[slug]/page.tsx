import StoreTrendChart from "../../../components/StoreTrendChart";
import Link from "next/link";
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
  type: "rating" | "businessHours" | "onlineRate" | "missedRate" | "makeTime";
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
    if (brand.rating > 0 && brand.rating < 4.0) ngItems.add("rating");
    if (brand.businessHours < 180) ngItems.add("businessHours");
    if (brand.onlineRate < 90) ngItems.add("onlineRate");
    if (brand.missedRate > 1) ngItems.add("missedRate");
    if (brand.makeTime > 10) ngItems.add("makeTime");
  });

  const ngCount = ngItems.size;

  if (ngCount === 0) {
    return { label: "良好", className: "bg-green-100 text-green-700" };
  }

  if (ngCount === 1) {
    return { label: "もう一歩", className: "bg-yellow-100 text-yellow-700" };
  }

  return { label: "要改善", className: "bg-red-100 text-red-700" };
}

function getImprovementComments(store: any) {
  const comments: string[] = [];
  const activeBrands = store.brands.filter((brand: any) => brand.sales > 0);

  if (activeBrands.some((brand: any) => brand.rating > 0 && brand.rating < 4.0)) {
    comments.push("店舗評価が4.0を下回っているブランドがあります。商品品質・梱包・提供スピード・レビュー内容の確認をおすすめします。");
  }

  if (activeBrands.some((brand: any) => brand.businessHours < 180)) {
    comments.push("営業時間が180時間未満のブランドがあります。稼働時間を増やすことで、注文機会の増加が期待できます。");
  }

  if (activeBrands.some((brand: any) => brand.onlineRate < 90)) {
    comments.push("オンライン率が90%未満のブランドがあります。営業中のオフライン時間を減らすことで、売上機会損失を防げます。");
  }

  if (activeBrands.some((brand: any) => brand.missedRate > 1)) {
    comments.push("未受注率が1%を超えているブランドがあります。注文通知・端末確認・受注体制の見直しをおすすめします。");
  }

  if (activeBrands.some((brand: any) => brand.makeTime > 10)) {
    comments.push("メイク時間が10分を超えているブランドがあります。調理導線・仕込み量・ピーク時対応の見直しが有効です。");
  }

  if (comments.length === 0) {
    comments.push("主要な運営品質項目は基準を満たしています。現在の運営状態を維持しながら、売上拡大を目指しましょう。");
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
  const store = stores.find((s) => s.slug === slug);

  if (!store) {
    notFound();
  }

  const previousStore = await getPreviousMonthStore(slug, selectedMonth);
  const isCurrentMonth = selectedMonth === months[0];

  const qualityJudge = getQualityJudge(store);
  const improvementComments = getImprovementComments(store);

  const salesChartData = history.map((item) => ({
    month: item.month,
    value: item.totalSales,
  }));

  const ratingChartData = history.map((item) => ({
    month: item.month,
    value: item.averageRating,
  }));

  const businessHoursChartData = history.map((item) => ({
    month: item.month,
    value:
      item.brands.length === 0
        ? 0
        : item.brands.reduce((sum, brand) => sum + brand.businessHours, 0) /
          item.brands.length,
  }));

  const onlineRateChartData = history.map((item) => ({
    month: item.month,
    value:
      item.brands.length === 0
        ? 0
        : item.brands.reduce((sum, brand) => sum + brand.onlineRate, 0) /
          item.brands.length,
  }));

  const missedRateChartData = history.map((item) => ({
    month: item.month,
    value:
      item.brands.length === 0
        ? 0
        : item.brands.reduce((sum, brand) => sum + brand.missedRate, 0) /
          item.brands.length,
  }));

  const makeTimeChartData = history.map((item) => ({
    month: item.month,
    value:
      item.brands.length === 0
        ? 0
        : item.brands.reduce((sum, brand) => sum + brand.makeTime, 0) /
          item.brands.length,
  }));

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white p-8">
        <p className="text-sm opacity-90">月次実績レポート</p>
        <h1 className="text-3xl font-black text-gray-950 mt-2">{store.storeName}</h1>

        <p className="mt-2 opacity-90">
          {store.month}
          {store.closeDate && `　${store.closeDate}`}
        </p>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        <MonthSelector
          months={storeMonths}
          selectedMonth={selectedMonth}
          basePath={`/report/${slug}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700 font-bold">
              {isCurrentMonth ? "予測売上" : "総売上"}
            </p>

            <p className="text-3xl font-black text-gray-950">
              ¥
              {Math.round(
                isCurrentMonth ? store.forecastSales : store.totalSales
              ).toLocaleString()}
            </p>

            {isCurrentMonth && (
              <p className="text-sm text-gray-700 font-bold mt-2">
                （{store.closeDate}実績：¥
                {Math.round(store.totalSales).toLocaleString()}）
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700 font-bold">平均評価</p>
            <p className="text-3xl font-black text-gray-950">
              {store.averageRating === 0
                ? "評価なし"
                : `${store.averageRating.toFixed(2)} ⭐`}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700 font-bold">運営品質判定</p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${qualityJudge.className}`}
              >
                {qualityJudge.label}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700 font-bold">運営ブランド数</p>
            <p className="text-3xl font-black text-gray-950">
              {store.brands.filter((brand) => brand.sales > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
  <p className="text-gray-700 font-bold">店舗閲覧者数</p>
  <p className="text-3xl font-black text-gray-950">
    {Math.round(store.storeViews || 0).toLocaleString()}
  </p>
</div>

<div className="bg-white rounded-xl shadow p-6">
  <p className="text-gray-700 font-bold">メニュー閲覧数</p>
  <p className="text-3xl font-black text-gray-950">
    {Math.round(store.menuViews || 0).toLocaleString()}
  </p>
</div>

<div className="bg-white rounded-xl shadow p-6">
  <p className="text-gray-700 font-bold">注文者数</p>
  <p className="text-3xl font-black text-gray-950">
    {Math.round(store.orderUsers || 0).toLocaleString()}
  </p>
</div>

<div className="bg-white rounded-xl shadow p-6">
  <p className="text-gray-700 font-bold">CL率</p>
  <p className="text-3xl font-black text-gray-950">
    {(store.clRate || 0).toFixed(2)}%
  </p>
</div>
        </div>

        <KPIComparisonCards
          current={store}
          previous={previousStore}
          isCurrentMonth={isCurrentMonth}
        />

        <section className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-950">ブランド別 運営品質</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
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
</tr>
              </thead>

              <tbody>
                {store.brands.map((brand, index) => (
                  <tr key={`${brand.brandName}-${index}`}>
                    <td className="border p-3 font-bold">{brand.brandName}</td>

                    <td className="border p-3 text-right">
                      ¥{brand.sales.toLocaleString()}
                    </td>

                    <td className="border p-3 text-center">
                      {brand.rating === 0 ? (
                        <span className="text-gray-400">評価なし</span>
                      ) : (
                        <>
                          {brand.rating.toFixed(2)}{" "}
                          <JudgeBadge type="rating" value={brand.rating} />
                        </>
                      )}
                    </td>

                    <td className="border p-3 text-center">
                      {brand.businessHours.toFixed(1)}h{" "}
                      <JudgeBadge
                        type="businessHours"
                        value={brand.businessHours}
                      />
                    </td>

                    <td className="border p-3 text-center">
                      {brand.onlineRate.toFixed(2)}%{" "}
                      <JudgeBadge type="onlineRate" value={brand.onlineRate} />
                    </td>

                    <td className="border p-3 text-center">
                      {brand.missedRate.toFixed(2)}%{" "}
                      <JudgeBadge type="missedRate" value={brand.missedRate} />
                    </td>

                    <td className="border p-3 text-center">
                      {brand.makeTime.toFixed(2)}分{" "}
                      <JudgeBadge type="makeTime" value={brand.makeTime} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <StoreTrendChart title="売上推移" data={salesChartData} />
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
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

        <section className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-3">改善ポイント</h2>

          <ul className="list-disc pl-6 space-y-3 leading-7">
            {improvementComments.map((comment, index) => (
              <li key={index}>{comment}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
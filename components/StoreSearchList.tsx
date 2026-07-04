"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  stores: any[];
  selectedMonth: string;
  isCurrentMonth?: boolean;
};

export default function StoreSearchList({
  stores,
  selectedMonth,
  isCurrentMonth = false,
}: Props) {
  const [keyword, setKeyword] = useState("");

  const filteredStores = stores.filter((store) => {
    const text = `${store.owner} ${store.storeName}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  });

  return (
    <section>
      <div className="mb-6">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="店舗名・オーナー名で検索"
          className="w-full rounded-xl border px-5 py-3 text-lg shadow"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredStores.map((store) => {
          const displaySales = isCurrentMonth
            ? store.forecastSales
            : store.totalSales;

          return (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow hover:shadow-xl transition p-6"
            >
              <h3 className="text-xl font-bold mb-4">{store.storeName}</h3>

              <div className="space-y-2">
                <p>
                  🏢 企業/オーナー
                  <span className="font-bold ml-2">{store.owner}</span>
                </p>

                <p>
                  💰 {isCurrentMonth ? "予測売上" : "総売上"}
                  <span className="font-bold ml-2">
                    ¥{Math.round(displaySales).toLocaleString()}
                  </span>
                </p>

                {isCurrentMonth && (
                  <p className="text-sm text-gray-500 ml-7">
                    実績：¥{Math.round(store.totalSales).toLocaleString()}
                  </p>
                )}

                <p>
                  ⭐ 平均評価
                  <span className="font-bold ml-2">
                    {store.averageRating === 0
                      ? "評価なし"
                      : store.averageRating.toFixed(2)}
                  </span>
                </p>

                <p>
                  ✅ コミット判定
                  <span
                    className={`font-bold ml-2 ${
                      store.commitJudge === "○"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {store.commitJudge}
                  </span>
                </p>

                <p>
                  🍱 運営ブランド数
                  <span className="font-bold ml-2">
                    {
                      new Set(
                        store.brands
                          .filter((brand: any) => brand.sales > 0)
                          .map((brand: any) => brand.brandName)
                      ).size
                    }
                    ブランド
                  </span>
                </p>
              </div>

              <Link
                href={`/report/${store.slug}?month=${selectedMonth}`}
                className="mt-6 block w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-center"
              >
                詳細を見る
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
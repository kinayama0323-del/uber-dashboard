"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  stores: any[];
  selectedMonth: string;
};

export default function StoreSearchList({ stores, selectedMonth }: Props) {
  const [keyword, setKeyword] = useState("");

  const filteredStores = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return stores;

    return stores.filter((store) => {
      const storeName = String(store.storeName || "").toLowerCase();
      const owner = String(store.owner || "").toLowerCase();

      const brandNames = store.brands
        .map((brand: any) => String(brand.brandName || "").toLowerCase())
        .join(" ");

      return (
        storeName.includes(q) ||
        owner.includes(q) ||
        brandNames.includes(q)
      );
    });
  }, [keyword, stores]);

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <label className="font-bold mr-3">検索</label>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="店舗名・オーナー名・ブランド名で検索"
          className="border rounded-lg px-4 py-2 w-full md:w-96"
        />

        <p className="text-sm text-gray-500 mt-2">
          表示件数：{filteredStores.length}件
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6">店舗一覧</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredStores.map((store) => (
          <div
            key={`${store.slug}-${store.month}`}
            className="bg-white rounded-xl shadow hover:shadow-xl transition p-6"
          >
            <h3 className="text-xl font-bold mb-4">{store.storeName}</h3>

            <div className="space-y-2">
              <p>
                🏢 企業/オーナー
                <span className="font-bold ml-2">{store.owner}</span>
              </p>

              <p>
                💰 総売上
                <span className="font-bold ml-2">
                  ¥{store.totalSales.toLocaleString()}
                </span>
              </p>

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
        ))}
      </div>
    </>
  );
}
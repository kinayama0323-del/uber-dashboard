import Papa from "papaparse";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR7eOIuYXpuBYGMubWUtQRMXClEqb57Wpj36oMqPrfUGe6KQiUyOEObB3WzkjmDesMTs_fa0NVfD9w_/pub?gid=1100032526&single=true&output=csv";

export type Store = {
  id: number;
  slug: string;
  owner: string;
  storeName: string;
  month: string;
  closeDate: string;
  totalSales: number;
  forecastSales: number;
  averageRating: number;
  commitJudge: string;
  brands: any[];
};

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;
  return Number(String(value).replace(/,/g, "").replace("%", "")) || 0;
}

function getValue(row: any, key: string) {
  return row[key] ?? row[`﻿${key}`] ?? "";
}

function hasStoreStarted(store: Store) {
  return (
    store.totalSales > 0 ||
    store.forecastSales > 0 ||
    store.brands.some((brand: any) => brand.sales > 0)
  );
}

export async function getStoresFromSheet(): Promise<Store[]> {
  const response = await fetch(CSV_URL + `&t=${Date.now()}`, {
    cache: "no-store",
  });

  const csv = await response.text();

  const result = Papa.parse<any>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = result.data.filter((row: any) => {
    const slug = getValue(row, "slug");
    const month = getValue(row, "month");
    const brandName = getValue(row, "brandName");
    return slug && month && brandName;
  });

  const storeMap = new Map<string, Store>();

  rows.forEach((row: any) => {
    const slug = String(getValue(row, "slug")).trim();
    const month = String(getValue(row, "month")).trim();

    const key = `${slug}-${month}`;

    if (!storeMap.has(key)) {
      storeMap.set(key, {
        id: storeMap.size + 1,
        slug,
        owner: String(getValue(row, "owner")).trim(),
        storeName: String(getValue(row, "storeName")).trim(),
        month,
        closeDate: String(getValue(row, "closeDate")).trim(),
        totalSales: toNumber(getValue(row, "totalSales")),
        forecastSales: toNumber(getValue(row, "forecastSales")),
        averageRating: toNumber(getValue(row, "averageRating")),
        commitJudge: String(getValue(row, "commitJudge")).trim(),
        brands: [],
      });
    }

    const store = storeMap.get(key)!;

    store.brands.push({
      brandName: String(getValue(row, "brandName")).trim(),
      sales: toNumber(getValue(row, "sales")),
      rating: toNumber(getValue(row, "rating")),
      ratingJudge: String(getValue(row, "ratingJudge")).trim(),
      businessHours: toNumber(getValue(row, "businessHours")),
      businessHoursJudge: String(getValue(row, "businessHoursJudge")).trim(),
      onlineRate: toNumber(getValue(row, "onlineRate")),
      onlineRateJudge: String(getValue(row, "onlineRateJudge")).trim(),
      missedRate: toNumber(getValue(row, "missedRate")),
      missedRateJudge: String(getValue(row, "missedRateJudge")).trim(),
      makeTime: toNumber(getValue(row, "makeTime")),
      makeTimeJudge: String(getValue(row, "makeTimeJudge")).trim(),
    });
  });

  return Array.from(storeMap.values());
}

export async function getAvailableMonths(): Promise<string[]> {
  const stores = await getStoresFromSheet();

  return Array.from(new Set(stores.map((store) => store.month)))
    .sort()
    .reverse();
}

export async function getStoresByMonth(month?: string): Promise<Store[]> {
  const stores = await getStoresFromSheet();
  const months = await getAvailableMonths();

  const selectedMonth = month || months[0];

  return stores.filter((store) => store.month === selectedMonth);
}

export async function getStoreHistory(slug: string) {
  const stores = await getStoresFromSheet();

  const history = stores
    .filter((s) => s.slug === slug)
    .sort((a, b) => a.month.localeCompare(b.month));

  const startIndex = history.findIndex((store) => hasStoreStarted(store));

  if (startIndex === -1) return history;

  return history.slice(startIndex);
}

export async function getPreviousMonthStore(slug: string, month: string) {
  const history = await getStoreHistory(slug);

  const index = history.findIndex((s) => s.month === month);

  if (index <= 0) return null;

  return history[index - 1];
}

export async function getStoreGrowthRates(stores: Store[], month: string) {
  const allStores = await getStoresFromSheet();

  const result = stores
    .map((store) => {
      const history = allStores
        .filter((s) => s.slug === store.slug)
        .sort((a, b) => a.month.localeCompare(b.month));

      const startIndex = history.findIndex((s) => hasStoreStarted(s));
      const activeHistory =
        startIndex === -1 ? history : history.slice(startIndex);

      const index = activeHistory.findIndex((s) => s.month === month);

      if (index <= 0) return null;

      const previous = activeHistory[index - 1];

      if (!previous || previous.totalSales === 0) return null;

      const currentSales =
        store.month === activeHistory[activeHistory.length - 1]?.month
          ? store.forecastSales
          : store.totalSales;

      const growth =
        ((currentSales - previous.totalSales) / previous.totalSales) * 100;

      return {
        ...store,
        growth,
      };
    })
    .filter(Boolean);

  return result;
}
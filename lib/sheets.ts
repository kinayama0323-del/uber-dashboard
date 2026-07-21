import Papa from "papaparse";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR7eOIuYXpuBYGMubWUtQRMXClEqb57Wpj36oMqPrfUGe6KQiUyOEObB3WzkjmDesMTs_fa0NVfD9w_/pub?gid=1100032526&single=true&output=csv";

export type Brand = {
  brandName: string;
  sales: number;

  storeViews: number;
  menuViews: number;
  orderUsers: number;
  clRate: number;

  rating: number;
  ratingJudge: string;

  businessHours: number;
  businessHoursJudge: string;

  onlineRate: number;
  onlineRateJudge: string;

  missedRate: number;
  missedRateJudge: string;

  makeTime: number;
  makeTimeJudge: string;
};

export type Store = {
  id: number;
  slug: string;
  owner: string;
  storeName: string;
  month: string;
  closeDate: string;

  totalSales: number;
  forecastSales: number;

  storeViews: number;
  menuViews: number;
  orderUsers: number;
  clRate: number;

  averageRating: number;
  commitJudge: string;

  brands: Brand[];
};

type CsvRow = Record<string, unknown>;

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\uFEFF/g, "")
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .trim();
}

function normalizeRow(row: CsvRow): CsvRow {
  const normalized: CsvRow = {};

  Object.entries(row).forEach(([key, value]) => {
    normalized[normalizeHeader(key)] = value;
  });

  return normalized;
}

function toNumber(value: unknown): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const text = String(value)
    .replace(/,/g, "")
    .replace(/%/g, "")
    .replace(/￥/g, "")
    .replace(/¥/g, "")
    .trim();

  const number = Number(text);

  return Number.isFinite(number) ? number : 0;
}

function getValue(
  row: CsvRow,
  key: string
): unknown {
  return row[key] ?? "";
}

function hasStoreStarted(
  store: Store
): boolean {
  return (
    store.totalSales > 0 ||
    store.forecastSales > 0 ||
    store.brands.some(
      (brand) => brand.sales > 0
    )
  );
}

export async function getStoresFromSheet(): Promise<
  Store[]
> {
  const response = await fetch(
    `${CSV_URL}&t=${Date.now()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `app_dataのCSV取得に失敗しました。status: ${response.status}`
    );
  }

  const csv = await response.text();

  const parseResult =
    Papa.parse<CsvRow>(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (
        header: string
      ) => normalizeHeader(header),
    });

  if (parseResult.errors.length > 0) {
    console.error(
      "CSV解析エラー:",
      parseResult.errors
    );
  }

  const normalizedRows =
    parseResult.data.map(
      (row) => normalizeRow(row)
    );

  const rows = normalizedRows.filter(
    (row) => {
      const slug = String(
        getValue(row, "slug")
      ).trim();

      const month = String(
        getValue(row, "month")
      ).trim();

      const brandName = String(
        getValue(row, "brandName")
      ).trim();

      return Boolean(
        slug &&
          month &&
          brandName
      );
    }
  );

  const storeMap =
    new Map<string, Store>();

  rows.forEach((row) => {
    const slug = String(
      getValue(row, "slug")
    ).trim();

    const month = String(
      getValue(row, "month")
    ).trim();

    const key = `${slug}-${month}`;

    if (!storeMap.has(key)) {
      storeMap.set(key, {
        id: storeMap.size + 1,

        slug,

        owner: String(
          getValue(row, "owner")
        ).trim(),

        storeName: String(
          getValue(row, "storeName")
        ).trim(),

        month,

        closeDate: String(
          getValue(row, "closeDate")
        ).trim(),

        totalSales: toNumber(
          getValue(row, "totalSales")
        ),

        forecastSales: toNumber(
          getValue(
            row,
            "forecastSales"
          )
        ),

        storeViews: 0,
        menuViews: 0,
        orderUsers: 0,
        clRate: 0,

        averageRating: toNumber(
          getValue(
            row,
            "averageRating"
          )
        ),

        commitJudge: String(
          getValue(
            row,
            "commitJudge"
          )
        ).trim(),

        brands: [],
      });
    }

    const store =
      storeMap.get(key);

    if (!store) return;

    const brand: Brand = {
      brandName: String(
        getValue(row, "brandName")
      ).trim(),

      sales: toNumber(
        getValue(row, "sales")
      ),

      storeViews: toNumber(
        getValue(row, "storeViews")
      ),

      menuViews: toNumber(
        getValue(row, "menuViews")
      ),

      orderUsers: toNumber(
        getValue(row, "orderUsers")
      ),

      clRate: toNumber(
        getValue(row, "clRate")
      ),

      rating: toNumber(
        getValue(row, "rating")
      ),

      ratingJudge: String(
        getValue(
          row,
          "ratingJudge"
        )
      ).trim(),

      businessHours: toNumber(
        getValue(
          row,
          "businessHours"
        )
      ),

      businessHoursJudge: String(
        getValue(
          row,
          "businessHoursJudge"
        )
      ).trim(),

      onlineRate: toNumber(
        getValue(
          row,
          "onlineRate"
        )
      ),

      onlineRateJudge: String(
        getValue(
          row,
          "onlineRateJudge"
        )
      ).trim(),

      missedRate: toNumber(
        getValue(
          row,
          "missedRate"
        )
      ),

      missedRateJudge: String(
        getValue(
          row,
          "missedRateJudge"
        )
      ).trim(),

      makeTime: toNumber(
        getValue(
          row,
          "makeTime"
        )
      ),

      makeTimeJudge: String(
        getValue(
          row,
          "makeTimeJudge"
        )
      ).trim(),
    };

    store.brands.push(brand);
  });

  const stores =
    Array.from(
      storeMap.values()
    );

  stores.forEach((store) => {
    store.storeViews =
      store.brands.reduce(
        (sum, brand) =>
          sum + brand.storeViews,
        0
      );

    store.menuViews =
      store.brands.reduce(
        (sum, brand) =>
          sum + brand.menuViews,
        0
      );

    store.orderUsers =
      store.brands.reduce(
        (sum, brand) =>
          sum + brand.orderUsers,
        0
      );

    // CL率はブランドごとの単純平均ではなく、
    // 店舗TOTALの注文者数 ÷ メニュー閲覧数で計算
    store.clRate =
      store.menuViews > 0
        ? (store.orderUsers /
            store.menuViews) *
          100
        : 0;
  });

  return stores;
}

export async function getAvailableMonths(): Promise<
  string[]
> {
  const stores =
    await getStoresFromSheet();

  return Array.from(
    new Set(
      stores.map(
        (store) => store.month
      )
    )
  )
    .sort()
    .reverse();
}

export async function getStoresByMonth(
  month?: string
): Promise<Store[]> {
  const stores =
    await getStoresFromSheet();

  const months = Array.from(
    new Set(
      stores.map(
        (store) => store.month
      )
    )
  )
    .sort()
    .reverse();

  const selectedMonth =
    month || months[0];

  if (!selectedMonth) {
    return [];
  }

  return stores.filter(
    (store) =>
      store.month === selectedMonth
  );
}

export async function getStoreHistory(
  slug: string
): Promise<Store[]> {
  const stores =
    await getStoresFromSheet();

  const history = stores
    .filter(
      (store) =>
        store.slug === slug
    )
    .sort((a, b) =>
      a.month.localeCompare(
        b.month
      )
    );

  const startIndex =
    history.findIndex(
      (store) =>
        hasStoreStarted(store)
    );

  if (startIndex === -1) {
    return history;
  }

  return history.slice(
    startIndex
  );
}

export async function getPreviousMonthStore(
  slug: string,
  month: string
): Promise<Store | null> {
  const history =
    await getStoreHistory(slug);

  const index =
    history.findIndex(
      (store) =>
        store.month === month
    );

  if (index <= 0) {
    return null;
  }

  return history[index - 1];
}

export async function getStoreGrowthRates(
  stores: Store[],
  month: string
): Promise<
  Array<
    Store & {
      growth: number;
    }
  >
> {
  const allStores =
    await getStoresFromSheet();

  return stores
    .map((store) => {
      const history =
        allStores
          .filter(
            (item) =>
              item.slug ===
              store.slug
          )
          .sort((a, b) =>
            a.month.localeCompare(
              b.month
            )
          );

      const startIndex =
        history.findIndex(
          (item) =>
            hasStoreStarted(item)
        );

      const activeHistory =
        startIndex === -1
          ? history
          : history.slice(
              startIndex
            );

      const index =
        activeHistory.findIndex(
          (item) =>
            item.month === month
        );

      if (index <= 0) {
        return null;
      }

      const previous =
        activeHistory[index - 1];

      if (
        !previous ||
        previous.totalSales === 0
      ) {
        return null;
      }

      const latestMonth =
        activeHistory[
          activeHistory.length - 1
        ]?.month;

      const currentSales =
        store.month === latestMonth
          ? store.forecastSales
          : store.totalSales;

      const growth =
        ((currentSales -
          previous.totalSales) /
          previous.totalSales) *
        100;

      return {
        ...store,
        growth,
      };
    })
    .filter(
      (
        item
      ): item is Store & {
        growth: number;
      } => item !== null
    );
}
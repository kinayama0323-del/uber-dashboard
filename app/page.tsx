import {
  getAvailableMonths,
  getStoresByMonth,
  getStoreGrowthRates,
} from "../lib/sheets";
import { KPICards } from "../components/KPICards";
import Sidebar from "../components/Sidebar";
import MonthSelector from "../components/MonthSelector";
import StoreSearchList from "../components/StoreSearchList";
import RankingCards from "../components/RankingCards";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;

  const months = await getAvailableMonths();
  const selectedMonth = month || months[0];

  const stores = await getStoresByMonth(selectedMonth);

  const growthStores = await getStoreGrowthRates(
    stores,
    selectedMonth
  );

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-100">
        <header className="bg-green-600 text-white p-6 shadow">
          <h1 className="text-3xl font-bold">
            🍔 Uber加盟店ダッシュボード
          </h1>
        </header>

        <div className="max-w-7xl mx-auto p-8">
          <KPICards stores={stores} />

          <MonthSelector
            months={months}
            selectedMonth={selectedMonth}
          />

          <RankingCards
            stores={stores}
            growthStores={growthStores}
          />

          <StoreSearchList
            stores={stores}
            selectedMonth={selectedMonth}
          />
        </div>
      </main>
    </div>
  );
}
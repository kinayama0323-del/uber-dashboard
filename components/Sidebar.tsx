import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-10">
        🍔 Globridge
      </h1>

      <nav className="space-y-4">

        <Link
          href="/admin-gk-manage"
          className="block hover:text-green-400"
        >
          🏠 ダッシュボード
        </Link>

        <Link
          href="/admin-gk-manage/sales"
          className="block hover:text-green-400"
        >
          📈 売上分析
        </Link>

        <div className="text-gray-500">
          🏪 店舗一覧（準備中）
        </div>

        <div className="text-gray-500">
          ⭐ 評価分析（準備中）
        </div>

        <div className="text-gray-500">
          📄 レポート（準備中）
        </div>

        <div className="text-gray-500">
          ⚙ 設定（準備中）
        </div>

      </nav>
    </aside>
  );
}
export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-10">
        🍔 Globridge
      </h1>

      <nav className="space-y-4">
        <div className="cursor-pointer hover:text-green-400">
          🏠 ダッシュボード
        </div>

        <div className="cursor-pointer hover:text-green-400">
          🏪 店舗一覧
        </div>

        <div className="cursor-pointer hover:text-green-400">
          📈 売上分析
        </div>

        <div className="cursor-pointer hover:text-green-400">
          ⭐ 評価分析
        </div>

        <div className="cursor-pointer hover:text-green-400">
          📄 レポート
        </div>

        <div className="cursor-pointer hover:text-green-400">
          ⚙ 設定
        </div>
      </nav>
    </aside>
  );
}
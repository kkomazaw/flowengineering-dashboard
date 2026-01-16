import ValueStreamDashboard from "@/components/ValueStreamDashboard";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Flow Engineering Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            バリューストリームマッピング（VSM）ダッシュボード
          </p>
        </header>

        <ValueStreamDashboard />
      </div>
    </main>
  );
}

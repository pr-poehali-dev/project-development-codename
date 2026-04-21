export default function MasterCabinetLoader() {
  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Загрузка...</p>
      </div>
    </div>
  );
}

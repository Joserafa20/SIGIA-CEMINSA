export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">📶</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Sin conexión</h1>
        <p className="text-sm text-gray-500">
          SIGIA-CEMINSA no pudo conectarse al servidor. Verificá tu conexión a internet e intentá
          nuevamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

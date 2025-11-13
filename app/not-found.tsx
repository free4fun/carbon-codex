export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
      <p className="text-lg text-text-gray mb-8">La ruta que intentaste acceder no existe.</p>
      <a href="/" className="px-6 py-3 bg-magenta text-white rounded-lg font-semibold">Volver al inicio</a>
    </main>
  );
}

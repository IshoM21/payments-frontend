import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePurchasesList } from "../hooks/usePurchases";
import { debounce } from "../utils/debounce";
import type { PurchaseResponse } from "../types/purchases";

export const PurchasesPage = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const size = 9;

  const { data, isLoading, isError } = usePurchasesList({
    page,
    size,
    sort: "createdAt",
  });

  const allPurchases: PurchaseResponse[] = data?.content ?? [];

  // filtramos por descripción en frontend
  const filteredPurchases = allPurchases.filter((p) =>
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = data?.totalPages ?? 1;
  const isLast = data?.last ?? true;

  const updateSearch = useCallback(
    debounce((value: string) => {
      setPage(0);
      setSearch(value);
    }, 400),
    []
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando compras...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-red-700">
          Ocurrió un error al cargar las compras.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      {/* 👇 Card grande animada desde/hacia la card "Compras" del menú */}
      <motion.div
        layoutId="card-compras"
        className="max-w-6xl w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        {/* Header + buscador */}
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Compras</h1>
            <p className="text-sm text-gray-600 mt-1">
              Lista general de compras registradas en el sistema.
            </p>
          </div>

          <input
            type="text"
            placeholder="Buscar por descripción de compra..."
            onChange={(e) => updateSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm"
          />
        </header>

        {/* Sin compras */}
        {filteredPurchases.length === 0 && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center">
            <p className="text-gray-700 text-center">
              No hay compras que coincidan con tu búsqueda.
            </p>
            <div className="mt-6 flex gap-4">
              <Link
                to="/purchases/new"
                className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 text-sm"
              >
                Nueva compra
              </Link>
              <Link
                to="/"
                className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 text-sm"
              >
                Menú principal
              </Link>
            </div>
          </div>
        )}

        {/* Grid de cards */}
        {filteredPurchases.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPurchases.map((p) => (
                <Link
                  key={p.id}
                  to={`/purchases/${p.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h2 className="text-base font-semibold text-gray-900">
                      {p.description}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    Cliente: <strong>{p.customerName}</strong>
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-700">
                    <span>
                      Total:{" "}
                      <strong>${p.totalAmount.toFixed(2)}</strong>
                    </span>
                    <span>
                      Pagado:{" "}
                      <strong>${p.paidAmount.toFixed(2)}</strong>
                    </span>
                    <span>
                      Restante:{" "}
                      <strong>${p.remainingAmount.toFixed(2)}</strong>
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Fecha:{" "}
                    <strong>
                      {new Date(p.createdAt).toLocaleString()}
                    </strong>
                  </p>

                  {p.installmentEnabled && (
                    <div className="mt-2 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded px-2 py-1 inline-block">
                      Plazos: {p.installmentCount ?? "-"} x $
                      {p.installmentAmount?.toFixed(2) ?? "-"}
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Paginación + botones acción */}
            <div className="mt-6 flex flex-col gap-4 items-center">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
                >
                  Anterior
                </button>

                <span className="text-sm text-gray-700">
                  Página <strong>{page + 1}</strong> de{" "}
                  <strong>{totalPages}</strong>
                </span>

                <button
                  onClick={() => !isLast && setPage((prev) => prev + 1)}
                  disabled={isLast}
                  className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>

              <div className="flex gap-4">
                <Link
                  to="/purchases/new"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 text-sm"
                >
                  Nueva compra
                </Link>
                <Link
                  to="/"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 text-sm"
                >
                  Menú principal
                </Link>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
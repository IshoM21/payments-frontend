import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useCreatePurchase } from "../hooks/usePurchases";
import { CustomersApi } from "../api/customers";
import { PurchasesApi } from "../api/purchases";
import type { CustomerResponse } from "../types/customers";
import type { PageResponse } from "../types/common";
import type { InstallmentSimulationResponse } from "../types/purchases";

export const PurchaseNewPage = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreatePurchase();

  // Form state (como strings para inputs)
  const [form, setForm] = useState({
    customerId: "",
    description: "",
    totalAmount: "",
    installmentEnabled: false,
    installmentCount: "",
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  // Cargar clientes para el select
  const {
    data: customersPage,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
  } = useQuery<PageResponse<CustomerResponse>>({
    queryKey: ["customers", { for: "purchase-select" }],
    queryFn: () =>
      CustomersApi.list({
        q: "",
        page: 0,
        size: 100,
        sort: "name",
      }),
  });

  const customers = customersPage?.content ?? [];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = () => {
    const newErrors: Partial<typeof form> = {};

    if (!form.customerId) {
      newErrors.customerId = "Debes seleccionar un cliente.";
    }

    if (!form.description.trim()) {
      newErrors.description = "La descripción es obligatoria.";
    } else if (form.description.trim().length > 200) {
      newErrors.description = "La descripción no puede exceder 200 caracteres.";
    }

    if (!form.totalAmount.trim()) {
      newErrors.totalAmount = "El monto total es obligatorio.";
    } else if (isNaN(Number(form.totalAmount)) || Number(form.totalAmount) <= 0) {
      newErrors.totalAmount = "El monto total debe ser un número mayor a 0.";
    }

    if (form.installmentEnabled) {
      if (!form.installmentCount.trim()) {
        newErrors.installmentCount = "Ingresa el número de plazos.";
      } else if (
        !/^[0-9]+$/.test(form.installmentCount) ||
        Number(form.installmentCount) <= 0
      ) {
        newErrors.installmentCount =
          "El número de plazos debe ser un entero mayor a 0.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      customerId: Number(form.customerId),
      description: form.description.trim(),
      totalAmount: Number(form.totalAmount),
      installmentEnabled: form.installmentEnabled,
      installmentCount: form.installmentEnabled
        ? Number(form.installmentCount)
        : undefined,
    };

    mutate(payload, {
      onSuccess: () => {
        toast.success("Compra creada correctamente.");
        navigate("/purchases");
      },
      onError: (err: any) => {
        console.error(err);
        const message =
          err?.response?.data?.message ??
          "Ocurrió un error al crear la compra.";
        toast.error(message);
      },
    });
  };

  // --- Simulación de plazos ---
  const totalAmountNumber = Number(form.totalAmount);
  const installmentCountNumber = Number(form.installmentCount);

  const shouldSimulate =
    form.installmentEnabled &&
    !isNaN(totalAmountNumber) &&
    totalAmountNumber > 0 &&
    !isNaN(installmentCountNumber) &&
    installmentCountNumber > 0;

  const {
    data: simulation,
    isLoading: isSimLoading,
    isError: isSimError,
  } = useQuery<InstallmentSimulationResponse>({
    queryKey: [
      "installmentSimulation",
      {
        totalAmount: shouldSimulate ? totalAmountNumber : 0,
        installmentCount: shouldSimulate ? installmentCountNumber : 0,
      },
    ],
    queryFn: () =>
      PurchasesApi.simulateInstallments({
        totalAmount: totalAmountNumber,
        installmentCount: installmentCountNumber,
      }),
    enabled: shouldSimulate,
  });

  // ---- Estados especiales de clientes ----
  if (isCustomersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando clientes...</p>
      </div>
    );
  }

  if (isCustomersError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4">
        <p className="text-red-700 mb-2">
          No se pudieron cargar los clientes.
        </p>
        <Link
          to="/customers/new"
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Crear cliente
        </Link>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-700 mb-2">
          No hay clientes registrados. Crea al menos uno para registrar compras.
        </p>
        <Link
          to="/customers/new"
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Nuevo cliente
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Nueva compra
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Registra una nueva compra para un cliente.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div>
            <label
              htmlFor="customerId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              id="customerId"
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                errors.customerId
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            >
              <option value="">Selecciona un cliente...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.email ? `- ${c.email}` : ""}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.customerId}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción <span className="text-red-500">*</span>
            </label>
            <input
              id="description"
              name="description"
              type="text"
              maxLength={200}
              value={form.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                errors.description
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          {/* Total */}
          <div>
            <label
              htmlFor="totalAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Monto total <span className="text-red-500">*</span>
            </label>
            <input
              id="totalAmount"
              name="totalAmount"
              type="number"
              step="0.01"
              min="0"
              value={form.totalAmount}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                errors.totalAmount
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {errors.totalAmount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.totalAmount}
              </p>
            )}
          </div>

          {/* Plazos */}
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                name="installmentEnabled"
                checked={form.installmentEnabled}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Compra a plazos</span>
            </label>

            {form.installmentEnabled && (
              <>
                <div>
                  <label
                    htmlFor="installmentCount"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Número de plazos
                  </label>
                  <input
                    id="installmentCount"
                    name="installmentCount"
                    type="number"
                    min="1"
                    value={form.installmentCount}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors.installmentCount
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-400"
                    }`}
                  />
                  {errors.installmentCount && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.installmentCount}
                    </p>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-700">
                  {isSimLoading && (
                    <span>Calculando monto por plazo...</span>
                  )}

                  {isSimError && (
                    <span className="text-red-600">
                      No se pudo calcular la simulación.
                    </span>
                  )}

                  {simulation && !isSimLoading && !isSimError && (
                    <span>
                      Monto estimado por pago:{" "}
                      <strong>
                        ${simulation.installmentAmount.toFixed(2)}
                      </strong>
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-between items-center pt-2">
            <Link
              to="/purchases"
              className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Guardando..." : "Guardar compra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
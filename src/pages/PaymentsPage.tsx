import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { CustomersApi } from "../api/customers";
import { PurchasesApi } from "../api/purchases";
import {
  usePaymentsByPurchase,
  usePaymentMethods,
  useCreatePayment,
} from "../hooks/usePayments";

import type { PageResponse } from "../types/common";
import type { CustomerResponse } from "../types/customers";
import type { PurchaseResponse } from "../types/purchases";
import type { PaymentMethod } from "../types/payments";

export const PaymentsPage = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>("");

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "",
    note: "",
  });

  const [paymentErrors, setPaymentErrors] = useState<
    Partial<typeof paymentForm>
  >({});

  const purchaseIdNumber = Number(selectedPurchaseId);
  const hasSelectedPurchase =
    selectedPurchaseId !== "" && !Number.isNaN(purchaseIdNumber);

  // 1) Cargar clientes para el filtro
  const {
    data: customersPage,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
  } = useQuery<PageResponse<CustomerResponse>>({
    queryKey: ["customers", { for: "payments-filters" }],
    queryFn: () =>
      CustomersApi.list({
        q: "",
        page: 0,
        size: 100,
        sort: "name",
      }),
  });

  const customers = customersPage?.content ?? [];

  // 2) Cargar compras filtradas por cliente
  const {
    data: purchasesPage,
    isLoading: isPurchasesLoading,
    isError: isPurchasesError,
  } = useQuery<PageResponse<PurchaseResponse>>({
    queryKey: ["purchases-for-customer", selectedCustomerId],
    queryFn: () =>
      PurchasesApi.list({
        customerId: Number(selectedCustomerId),
        page: 0,
        size: 100,
        sort: "createdAt",
      }),
    enabled: !!selectedCustomerId,
  });

  const purchases = purchasesPage?.content ?? [];

  const selectedPurchase: PurchaseResponse | undefined = hasSelectedPurchase
    ? purchases.find((p) => p.id === purchaseIdNumber)
    : undefined;

  // 3) Cargar pagos de la compra seleccionada
  const {
    data: payments,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
  } = usePaymentsByPurchase(hasSelectedPurchase ? purchaseIdNumber : undefined);

  const paymentsList = payments ?? [];

  // 4) Métodos de pago
  const {
    data: methods,
    isLoading: isMethodsLoading,
    isError: isMethodsError,
  } = usePaymentMethods();

  // 5) Mutación para crear pago
  const createPaymentMutation = useCreatePayment(purchaseIdNumber);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCustomerId(value);
    setSelectedPurchaseId("");
  };

  const handlePurchaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPurchaseId(e.target.value);
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
    setPaymentErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validatePayment = () => {
    const newErrors: Partial<typeof paymentForm> = {};

    if (!paymentForm.amount.trim()) {
      newErrors.amount = "El monto es obligatorio.";
    } else if (
      isNaN(Number(paymentForm.amount)) ||
      Number(paymentForm.amount) <= 0
    ) {
      newErrors.amount = "El monto debe ser un número mayor a 0.";
    } else if (
      selectedPurchase &&
      Number(paymentForm.amount) > selectedPurchase.remainingAmount
    ) {
      newErrors.amount = "El monto no puede ser mayor al restante.";
    }

    if (!paymentForm.method) {
      newErrors.method = "Selecciona un método de pago.";
    }

    setPaymentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!hasSelectedPurchase || !selectedPurchase) {
      toast.error("Selecciona una compra antes de registrar un pago.");
      return;
    }
    if (!validatePayment()) return;

    const payload = {
      amount: Number(paymentForm.amount),
      method: paymentForm.method as PaymentMethod,
      paidAt: null, // backend usa LocalDateTime.now() si viene null
      note: paymentForm.note.trim() || null,
    };

    createPaymentMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Pago registrado correctamente.");
        setPaymentForm({
          amount: "",
          method: "",
          note: "",
        });
      },
      onError: (err: any) => {
        console.error(err);
        const message =
          err?.response?.data?.message ??
          "Ocurrió un error al registrar el pago.";
        toast.error(message);
      },
    });
  };

  // ---- UIs de carga/errores globales ----
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
          No se pudieron cargar los clientes para el filtro de pagos.
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      {/* 👇 Card grande que se anima desde/hacia la card "Pagos" del menú */}
      <motion.div
        layoutId="card-pagos"
        className="max-w-6xl w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Pagos</h1>
            <p className="text-sm text-gray-600 mt-1">
              Consulta y registra pagos filtrando por cliente y compra.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/purchases"
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Ir a compras
            </Link>
            <Link
              to="/"
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Menú principal
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Filtros</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Cliente */}
            <div>
              <label
                htmlFor="customerFilter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cliente
              </label>
              <select
                id="customerFilter"
                value={selectedCustomerId}
                onChange={handleCustomerChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">Todos / seleccionar...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.email ? `- ${c.email}` : ""}
                  </option>
                ))}
              </select>
              {isPurchasesError && selectedCustomerId && (
                <p className="mt-1 text-xs text-red-600">
                  No se pudieron cargar las compras de este cliente.
                </p>
              )}
            </div>

            {/* Compra */}
            <div>
              <label
                htmlFor="purchaseFilter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Compra
              </label>
              <select
                id="purchaseFilter"
                value={selectedPurchaseId}
                onChange={handlePurchaseChange}
                disabled={!selectedCustomerId || isPurchasesLoading}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {!selectedCustomerId
                    ? "Selecciona un cliente primero"
                    : isPurchasesLoading
                    ? "Cargando compras..."
                    : purchases.length === 0
                    ? "Este cliente no tiene compras"
                    : "Selecciona una compra..."}
                </option>
                {purchases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.description} · ${p.totalAmount.toFixed(2)} · {p.status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Resumen de compra seleccionada */}
        {selectedPurchase && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Compra seleccionada
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {selectedPurchase.status}
              </span>
            </div>
            <div className="grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
              <p>
                <span className="font-medium">Descripción:</span>{" "}
                {selectedPurchase.description}
              </p>
              <p>
                <span className="font-medium">Total:</span>{" "}
                ${selectedPurchase.totalAmount.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Pagado:</span>{" "}
                ${selectedPurchase.paidAmount.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Restante:</span>{" "}
                ${selectedPurchase.remainingAmount.toFixed(2)}
              </p>
              {selectedPurchase.installmentEnabled && (
                <p className="sm:col-span-2 text-blue-800">
                  Compra a plazos: {selectedPurchase.installmentCount} pagos de $
                  {selectedPurchase.installmentAmount?.toFixed(2) ?? "-"}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Pagos + formulario */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Pagos</h2>

          {/* Mensaje cuando no hay compra seleccionada */}
          {!selectedPurchase && (
            <p className="text-sm text-gray-600">
              Selecciona un cliente y una compra para ver sus pagos.
            </p>
          )}

          {/* Lista de pagos */}
          {selectedPurchase && (
            <>
              {isPaymentsLoading && (
                <p className="text-sm text-gray-600">Cargando pagos...</p>
              )}

              {isPaymentsError && (
                <p className="text-sm text-red-600">
                  Ocurrió un error al cargar los pagos.
                </p>
              )}

              {!isPaymentsLoading &&
                !isPaymentsError &&
                paymentsList.length === 0 && (
                  <p className="text-sm text-gray-600">
                    Sin pagos registrados para esta compra.
                  </p>
                )}

              {!isPaymentsLoading &&
                !isPaymentsError &&
                paymentsList.length > 0 && (
                  <div className="space-y-3">
                    {paymentsList.map((p) => (
                      <article
                        key={p.id}
                        className="border border-gray-200 rounded-lg p-3 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            ${p.amount.toFixed(2)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {p.method}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Fecha de pago:{" "}
                          <strong>
                            {p.paidAt
                              ? new Date(p.paidAt).toLocaleString()
                              : "(fecha no registrada)"}
                          </strong>
                        </p>
                        {p.note && (
                          <p className="text-xs text-gray-700 mt-1">
                            {p.note}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}

              {/* Formulario de nuevo pago */}
              {selectedPurchase.remainingAmount > 0 &&
                selectedPurchase.status !== "CANCELADO" && (
                  <div className="border-t border-gray-200 pt-4 mt-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Registrar nuevo pago
                    </h3>

                    <form
                      className="grid gap-3 sm:grid-cols-2"
                      onSubmit={handlePaymentSubmit}
                    >
                      {/* Monto */}
                      <div>
                        <label
                          htmlFor="amount"
                          className="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Monto <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="amount"
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentForm.amount}
                          onChange={handlePaymentChange}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                            paymentErrors.amount
                              ? "border-red-500 focus:ring-red-400"
                              : "border-gray-300 focus:ring-blue-400"
                          }`}
                        />
                        {paymentErrors.amount && (
                          <p className="mt-1 text-xs text-red-600">
                            {paymentErrors.amount}
                          </p>
                        )}
                      </div>

                      {/* Método */}
                      <div>
                        <label
                          htmlFor="method"
                          className="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Método de pago{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="method"
                          name="method"
                          value={paymentForm.method}
                          onChange={handlePaymentChange}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                            paymentErrors.method
                              ? "border-red-500 focus:ring-red-400"
                              : "border-gray-300 focus:ring-blue-400"
                          }`}
                        >
                          <option value="">
                            {isMethodsLoading
                              ? "Cargando métodos..."
                              : "Selecciona un método"}
                          </option>
                          {!isMethodsLoading &&
                            !isMethodsError &&
                            methods?.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                        </select>
                        {paymentErrors.method && (
                          <p className="mt-1 text-xs text-red-600">
                            {paymentErrors.method}
                          </p>
                        )}
                      </div>

                      {/* Nota */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="note"
                          className="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Nota (opcional)
                        </label>
                        <textarea
                          id="note"
                          name="note"
                          rows={2}
                          value={paymentForm.note}
                          onChange={handlePaymentChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      {/* Botón */}
                      <div className="sm:col-span-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={createPaymentMutation.isPending}
                          className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {createPaymentMutation.isPending
                            ? "Guardando pago..."
                            : "Guardar pago"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              {selectedPurchase.remainingAmount <= 0 && (
                <p className="text-xs text-green-700 mt-2">
                  Esta compra ya está completamente pagada.
                </p>
              )}

              {selectedPurchase.status === "CANCELADO" && (
                <p className="text-xs text-red-700 mt-2">
                  Esta compra está cancelada. No se pueden registrar nuevos
                  pagos.
                </p>
              )}
            </>
          )}
        </section>
      </motion.div>
    </div>
  );
};
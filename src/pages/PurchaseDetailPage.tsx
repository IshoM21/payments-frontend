import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { usePurchase } from "../hooks/usePurchases";
import {
    usePaymentsByPurchase,
    usePaymentMethods,
    useCreatePayment,
} from "../hooks/usePayments";
import type { PaymentMethod } from "../types/payments";

export const PurchaseDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const purchaseId = Number(id);

    const {
        data: purchase,
        isLoading: isPurchaseLoading,
        isError: isPurchaseError,
    } = usePurchase(Number.isNaN(purchaseId) ? undefined : purchaseId);

    const {
        data: payments,
        isLoading: isPaymentsLoading,
        isError: isPaymentsError,
    } = usePaymentsByPurchase(Number.isNaN(purchaseId) ? undefined : purchaseId);

    const {
        data: methods,
        isLoading: isMethodsLoading,
        isError: isMethodsError,
    } = usePaymentMethods();

    const createPaymentMutation = useCreatePayment(purchaseId);

    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        method: "",
        note: "",
    });
    const [paymentErrors, setPaymentErrors] = useState<
        Partial<typeof paymentForm>
    >({});

    if (Number.isNaN(purchaseId)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <p className="text-red-700">ID de compra inválido.</p>
            </div>
        );
    }

    if (isPurchaseLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Cargando detalles de la compra...</p>
            </div>
        );
    }

    if (isPurchaseError || !purchase) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4">
                <p className="text-red-700 mb-4">
                    No se pudo cargar la información de la compra.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-white hover:bg-gray-900"
                >
                    Volver
                </button>
            </div>
        );
    }

    const handlePaymentChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setPaymentForm((prev) => ({ ...prev, [name]: value }));
        setPaymentErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validatePayment = () => {
        const newErrors: Partial<typeof paymentForm> = {};

        if (!paymentForm.amount.trim()) {
            newErrors.amount = "El monto es obligatorio.";
        } else if (isNaN(Number(paymentForm.amount)) || Number(paymentForm.amount) <= 0) {
            newErrors.amount = "El monto debe ser un número mayor a 0.";
        } else if (Number(paymentForm.amount) > purchase.remainingAmount) {
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
        if (!validatePayment()) return;

        const payload = {
            amount: Number(paymentForm.amount),
            method: paymentForm.method as PaymentMethod,
            paidAt: null,
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

    const paymentsList = payments ?? [];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header + acciones */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {purchase.description}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Compra de {purchase.customerName}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            to="/purchases"
                            className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Volver a compras
                        </Link>
                        <Link
                            to="/"
                            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Menú principal
                        </Link>
                    </div>
                </div>

                {/* Info de la compra */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Información de la compra
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {purchase.status}
                        </span>
                    </div>

                    <div className="grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
                        <p>
                            <span className="font-medium">Cliente:</span>{" "}
                            {purchase.customerName}
                        </p>
                        <p>
                            <span className="font-medium">Total:</span>{" "}
                            ${purchase.totalAmount.toFixed(2)}
                        </p>
                        <p>
                            <span className="font-medium">Pagado:</span>{" "}
                            ${purchase.paidAmount.toFixed(2)}
                        </p>
                        <p>
                            <span className="font-medium">Restante:</span>{" "}
                            ${purchase.remainingAmount.toFixed(2)}
                        </p>
                        <p>
                            <span className="font-medium">Fecha creación:</span>{" "}
                            {new Date(purchase.createdAt).toLocaleString()}
                        </p>

                        {purchase.installmentEnabled && (
                            <p className="sm:col-span-2 text-blue-800">
                                Compra a plazos: {purchase.installmentCount} pagos de $
                                {purchase.installmentAmount?.toFixed(2) ?? "-"}
                            </p>
                        )}
                    </div>
                </section>

                {/* Pagos */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Pagos registrados
                    </h2>

                    {isPaymentsLoading && (
                        <p className="text-sm text-gray-600">Cargando pagos...</p>
                    )}

                    {isPaymentsError && (
                        <p className="text-sm text-red-600">
                            Ocurrió un error al cargar los pagos.
                        </p>
                    )}

                    {!isPaymentsLoading && !isPaymentsError && paymentsList.length === 0 && (
                        <p className="text-sm text-gray-600">Sin pagos registrados.</p>
                    )}

                    {!isPaymentsLoading && !isPaymentsError && paymentsList.length > 0 && (
                        <div className="space-y-3">
                            {paymentsList.map((p) => (
                                <article
                                    key={p.id}
                                    className="border border-gray-200 rounded-lg p-3 flex flex-col gap-1"
                                >
                                    <div className="flex items-center justify-between">
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
                                        <p className="text-xs text-gray-700 mt-1">{p.note}</p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Formulario nuevo pago */}
                    {purchase.status !== "CANCELADO" && purchase.remainingAmount > 0 && (
                        <div className="border-t border-gray-200 pt-4 mt-2">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                Registrar nuevo pago
                            </h3>

                            <form
                                onSubmit={handlePaymentSubmit}
                                className="grid gap-3 sm:grid-cols-2"
                            >
                                {/* Monto */}
                                <div className="sm:col-span-1">
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
                                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${paymentErrors.amount
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
                                <div className="sm:col-span-1">
                                    <label
                                        htmlFor="method"
                                        className="block text-xs font-medium text-gray-700 mb-1"
                                    >
                                        Método de pago <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="method"
                                        name="method"
                                        value={paymentForm.method}
                                        onChange={handlePaymentChange}
                                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${paymentErrors.method
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

                    {purchase.remainingAmount <= 0 && (
                        <p className="text-xs text-green-700 mt-2">
                            Esta compra ya está completamente pagada.
                        </p>
                    )}

                    {purchase.status === "CANCELADO" && (
                        <p className="text-xs text-red-700 mt-2">
                            Esta compra está cancelada. No se pueden registrar nuevos pagos.
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
};
import { useState, useEffect, type FormEvent } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useCustomer,
  useCustomerPurchases,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../hooks/useCustomers";
import type { CustomerUpdateRequest } from "../types/customers";

export const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = Number(id);

  const [page, setPage] = useState(0);
  const size = 5;

  const {
    data: customer,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
  } = useCustomer(Number.isNaN(customerId) ? undefined : customerId);

  const {
    data: purchasesPage,
    isLoading: isPurchasesLoading,
    isError: isPurchasesError,
  } = useCustomerPurchases({
    customerId: Number.isNaN(customerId) ? undefined : customerId,
    page,
    size,
    sort: "createdAt",
  });

  // 👉 Mutaciones para editar / eliminar
  const updateMutation = useUpdateCustomer(customerId);
  const deleteMutation = useDeleteCustomer();

  // 👉 Estado para modo edición
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<CustomerUpdateRequest>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerUpdateRequest, string>>
  >({});

  // Cuando llega el cliente, llenamos el formulario
  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        notes: customer.notes ?? "",
      });
    }
  }, [customer]);

  if (Number.isNaN(customerId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-red-700">ID de cliente inválido.</p>
      </div>
    );
  }

  if (isCustomerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando datos del cliente...</p>
      </div>
    );
  }

  if (isCustomerError || !customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4">
        <p className="text-red-700 mb-4">
          No se pudo cargar la información del cliente.
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

  const purchases = purchasesPage?.content ?? [];
  const totalPages = purchasesPage?.totalPages ?? 1;
  const isLast = purchasesPage?.last ?? true;

  // Handlers para edición
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof CustomerUpdateRequest, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = "Correo electrónico no válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updateMutation.mutate(form, {
      onSuccess: () => {
        toast.success("Cliente actualizado correctamente.");
        setIsEditing(false);
      },
      onError: (err: any) => {
        console.error(err);
        const message =
          err?.response?.data?.message ?? "Error al actualizar el cliente.";
        toast.error(message);
      },
    });
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    deleteMutation.mutate(customerId, {
      onSuccess: () => {
        toast.success("Cliente eliminado correctamente.");
        navigate("/customers");
      },
      onError: (err: any) => {
        console.error(err);
        const message =
          err?.response?.data?.message ?? "Error al eliminar el cliente.";
        toast.error(message);
      },
    });
  };

  const resetForm = () => {
    if (customer) {
      setForm({
        name: customer.name ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        notes: customer.notes ?? "",
      });
    }
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header + acciones */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {customer.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Detalle del cliente y sus compras registradas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isEditing) resetForm();
                setIsEditing((v) => !v);
              }}
              className="px-3 py-2 text-sm rounded-lg bg-yellow-600 text-white hover:bg-yellow-700"
            >
              {isEditing ? "Cancelar edición" : "Editar cliente"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </button>

            <Link
              to="/customers"
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Volver a clientes
            </Link>
            <Link
              to="/"
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Menú principal
            </Link>
          </div>
        </div>

        {/* Card de información del cliente / edición */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Información del cliente
          </h2>

          {!isEditing && (
            <div className="grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
              <p>
                <span className="font-medium">ID:</span> {customer.id}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {customer.email || "(sin email)"}
              </p>
              <p>
                <span className="font-medium">Teléfono:</span>{" "}
                {customer.phone || "(sin teléfono)"}
              </p>
              <p className="sm:col-span-2">
                <span className="font-medium">Notas:</span>{" "}
                {customer.notes || "(sin notas)"}
              </p>
            </div>
          )}

          {isEditing && (
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              {/* Nombre */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-400"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-400"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Notas */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="notes"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Notas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsEditing(false);
                  }}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Compras del cliente */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Compras</h2>
          </div>

          {isPurchasesLoading && (
            <p className="text-sm text-gray-600">Cargando compras...</p>
          )}

          {isPurchasesError && (
            <p className="text-sm text-red-600">
              Ocurrió un error al cargar las compras.
            </p>
          )}

          {/* Mensaje cuando NO hay compras */}
          {!isPurchasesLoading &&
            !isPurchasesError &&
            purchases.length === 0 && (
              <p className="text-sm text-gray-600">
                Sin compras registradas.
              </p>
            )}

          {/* Lista de compras con link */}
          {!isPurchasesLoading &&
            !isPurchasesError &&
            purchases.length > 0 && (
              <>
                <div className="space-y-3">
                  {purchases.map((p) => (
                    <Link
                      key={p.id}
                      to={`/purchases/${p.id}`}
                      className="block border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition-shadow transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {p.description}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {p.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-700 mt-1">
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
                        <span>
                          Fecha:{" "}
                          <strong>
                            {new Date(p.createdAt).toLocaleString()}
                          </strong>
                        </span>
                      </div>

                      {p.installmentEnabled && (
                        <div className="mt-2 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded px-2 py-1 inline-block">
                          Plazos: {p.installmentCount ?? "-"} x $
                          {p.installmentAmount?.toFixed(2) ?? "-"}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Paginación de compras */}
                <div className="mt-4 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    className="px-3 py-1.5 text-xs rounded border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
                  >
                    Anterior
                  </button>

                  <span className="text-xs text-gray-700">
                    Página <strong>{page + 1}</strong> de{" "}
                    <strong>{totalPages}</strong>
                  </span>

                  <button
                    onClick={() => !isLast && setPage((prev) => prev + 1)}
                    disabled={isLast}
                    className="px-3 py-1.5 text-xs rounded border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
        </section>
      </div>
    </div>
  );
};

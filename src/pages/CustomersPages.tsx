import { useState, useCallback, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import toast from "react-hot-toast";

import {
  useCustomersList,
  useDeleteCustomer,
  useUpdateCustomer,
} from "../hooks/useCustomers";
import { debounce } from "../utils/debounce";

import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type {
  CustomerResponse,
  CustomerUpdateRequest,
} from "../types/customers";

export const CustomersPage = () => {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");

  const size = 9;

  // Cliente seleccionado para editar
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerResponse | null>(null);

  // Cliente seleccionado para eliminar (confirm modal)
  const [deletingCustomer, setDeletingCustomer] =
    useState<CustomerResponse | null>(null);

  const [form, setForm] = useState<CustomerUpdateRequest>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerUpdateRequest, string>>
  >({});

  // Mutaciones
  const deleteMutation = useDeleteCustomer();
  const updateMutation = useUpdateCustomer(editingCustomer?.id ?? 0);

  // Debounce para búsquedas
  const updateQuery = useCallback(
    debounce((value: string) => {
      setPage(0);
      setQ(value);
    }, 400),
    []
  );

  const { data, isLoading, isError } = useCustomersList({
    q,
    page,
    size,
    sort: "name",
  });

  const customers: CustomerResponse[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isLast = data?.last ?? true;

  // =========================
  // Modal de edición
  // =========================
  const openEditModal = (customer: CustomerResponse) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      notes: customer.notes ?? "",
    });
    setErrors({});
  };

  const closeEditModal = () => {
    setEditingCustomer(null);
    setErrors({});
  };

  const handleFormChange = (
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

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!validate()) return;

    updateMutation.mutate(form, {
      onSuccess: () => {
        toast.success("Cliente actualizado correctamente.");
        closeEditModal();
      },
      onError: (err: any) => {
        console.error(err);
        const msg =
          err?.response?.data?.message ?? "Error al actualizar el cliente.";
        toast.error(msg);
      },
    });
  };

  // =========================
  // Modal de confirmación de eliminación
  // =========================
  const openDeleteModal = (customer: CustomerResponse) => {
    setDeletingCustomer(customer);
  };

  const closeDeleteModal = () => {
    setDeletingCustomer(null);
  };

  const confirmDelete = () => {
    if (!deletingCustomer) return;

    deleteMutation.mutate(deletingCustomer.id, {
      onSuccess: () => {
        toast.success("Cliente eliminado.");
        closeDeleteModal();
      },
      onError: (err: any) => {
        console.error(err);
        const msg =
          err?.response?.data?.message ?? "Error al eliminar el cliente.";
        toast.error(msg);
      },
    });
  };

  // =========================
  // Handlers iconos de card
  // =========================
  const handleEditClick = (
    e: React.MouseEvent,
    customer: CustomerResponse
  ) => {
    e.preventDefault();
    e.stopPropagation();
    openEditModal(customer);
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    customer: CustomerResponse
  ) => {
    e.preventDefault();
    e.stopPropagation();
    openDeleteModal(customer);
  };

  // =========================
  // Loading / Error
  // =========================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando clientes...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-red-800">
          Ocurrió un error al cargar los clientes.
        </p>
      </div>
    );
  }

  // Variants para animación del modal
    const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.18 }, // 👈 sin "ease"
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      y: 20,
      transition: { duration: 0.15 }, // 👈 sin "ease"
    },
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <motion.div
        layoutId="card-clientes"
        className="max-w-6xl w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        {/* Header */}
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>

          <input
            type="text"
            placeholder="Buscar cliente por nombre..."
            onChange={(e) => updateQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          />
        </header>

        {/* Sin resultados */}
        {customers.length === 0 && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center">
            <p className="text-gray-700 text-center">
              No hay clientes que coincidan con tu búsqueda.
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                to="/customers/new"
                className="px-4 py-2 bg-yellow-700 text-white rounded-lg shadow hover:bg-yellow-800"
              >
                Nuevo Cliente
              </Link>

              <Link
                to="/"
                className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800"
              >
                Menú Principal
              </Link>
            </div>
          </div>
        )}

        {/* Grid de cards */}
        {customers.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customers.map((c) => (
                <Link
                  key={c.id}
                  to={`/customers/${c.id}`}
                  className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Iconos editar / eliminar */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={(e) => handleEditClick(e, c)}
                      className="p-1 rounded hover:bg-yellow-100"
                      title="Editar"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-yellow-700" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteClick(e, c)}
                      className="p-1 rounded hover:bg-red-100"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5 text-red-700" />
                    </button>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {c.name}
                  </h2>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {c.email || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Teléfono:</span>{" "}
                      {c.phone || "—"}
                    </p>
                    {c.notes && (
                      <p className="text-xs text-gray-500 mt-2">{c.notes}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Paginación */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
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
                onClick={() => !isLast && setPage((p) => p + 1)}
                disabled={isLast}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50 bg-white hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>

            {/* Botones finales */}
            <div className="mt-10 flex justify-center gap-6">
              <Link
                to="/customers/new"
                className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800"
              >
                Nuevo Cliente
              </Link>

              <Link
                to="/"
                className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800"
              >
                Menú Principal
              </Link>
            </div>
          </>
        )}
      </motion.div>

      {/* =========================
          MODAL EDICIÓN
         ========================= */}
      <AnimatePresence>
        {editingCustomer && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeEditModal}
            />
            <motion.div
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              variants={modalVariants}
            >
              {/* Cerrar */}
              <button
                onClick={closeEditModal}
                className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>

              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Editar cliente
              </h2>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
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
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* Notas */}
                <div>
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
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================
          MODAL CONFIRM ELIMINAR
         ========================= */}
      <AnimatePresence>
        {deletingCustomer && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeDeleteModal}
            />
            <motion.div
              className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
              variants={modalVariants}
            >
              <button
                onClick={closeDeleteModal}
                className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>

              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Eliminar cliente
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                ¿Seguro que quieres eliminar al cliente{" "}
                <span className="font-semibold">
                  {deletingCustomer.name}
                </span>
                ? Esta acción no se puede deshacer.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

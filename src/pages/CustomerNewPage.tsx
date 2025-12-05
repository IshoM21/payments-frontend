// src/pages/CustomerNewPage.tsx
import { type FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreateCustomer } from "../hooks/useCustomers";

export const CustomerNewPage = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateCustomer();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // limpiar error si el usuario corrige
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<typeof form> = {};

    if (!form.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }

    if (!form.email.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "El email no tiene un formato válido.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio.";
    }

    // notes no es obligatoria, pero puedes validar longitud si quieres

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Cliente creado correctamente.");
          // opcional: limpiar form
          setForm({
            name: "",
            email: "",
            phone: "",
            notes: "",
          });
          // redirigir al listado
          navigate("/customers");
        },
        onError: (err: any) => {
          console.error(err);
          const message =
            err?.response?.data?.message ??
            "Ocurrió un error al crear el cliente.";
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Nuevo Cliente
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Completa los datos para registrar un nuevo cliente.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              maxLength={120}
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={150}
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              maxLength={20}
              value={form.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                errors.phone
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Notas */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={255}
              value={form.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-between items-center pt-2">
            <Link
              to="/customers"
              className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Guardando..." : "Guardar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
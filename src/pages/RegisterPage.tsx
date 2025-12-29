import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import { AuthApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await AuthApi.register(form);
      login(res.accessToken);
      toast.success("Cuenta creada correctamente");
      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Error al registrar usuario";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-900 text-center">
          Crear cuenta
        </h1>

        <input
          name="fullName"
          placeholder="Nombre completo"
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />

        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Registrarse
        </button>

        <p className="text-sm text-center text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
};

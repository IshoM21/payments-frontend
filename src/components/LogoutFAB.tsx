import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { ConfirmModal } from "./ConfirmModal";

const HIDDEN_ROUTES = ["/login", "/register"];

export const LogoutFab = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [open, setOpen] = useState(false);

    if (HIDDEN_ROUTES.includes(pathname)) return null;

    const handleConfirm = () => {
        // Si quisieras hacer logout server-side, aquí podrías esperar un request.
        logout();
        setOpen(false);
        toast.success("Sesión cerrada");
        navigate("/login", { replace: true });
    };

    return (
        <>
            {/* FAB */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="
    group fixed bottom-6 right-6 z-50
    inline-flex items-center gap-2
    rounded-full shadow-lg
    bg-red-600 text-white
    h-12 px-3
    overflow-hidden

    max-w-[48px]
    hover:max-w-[220px]

    transition-[max-width] duration-700 ease-in-out
  "
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="shrink-0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                </svg>

                <span
                    className="
      whitespace-nowrap text-sm font-medium
      opacity-0 translate-x-2
      group-hover:opacity-100 group-hover:translate-x-0
      transition-[opacity,transform] duration-700 ease-in-out
    "
                >
                    Cerrar sesión
                </span>
            </button>

            {/* Modal confirmación */}
            <ConfirmModal
                open={open}
                title="Cerrar sesión"
                message="¿Seguro que deseas cerrar sesión?"
                confirmText="Sí, salir"
                cancelText="Cancelar"
                confirmVariant="danger"
                onCancel={() => setOpen(false)}
                onConfirm={handleConfirm}
            />
        </>
    );
};
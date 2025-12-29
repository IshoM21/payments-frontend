import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 10 },
};

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  const selectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selectors))
    .filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
}

export const ConfirmModal = ({
  open,
  title = "Confirmación",
  message = "¿Estás seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const prevActiveElementRef = useRef<HTMLElement | null>(null);

  // ✅ Bloquear scroll + manejar Esc + focus trap
  useEffect(() => {
    if (!open) return;

    // Guardar elemento previamente enfocado
    prevActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Bloquear scroll del body
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus inicial
    const focusFirst = () => {
      const focusables = getFocusableElements(modalRef.current);
      (focusables[0] ?? modalRef.current)?.focus?.();
    };

    // En el siguiente tick para asegurar montaje
    const t = window.setTimeout(focusFirst, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }

      // Focus trap con Tab
      if (e.key === "Tab") {
        const focusables = getFocusableElements(modalRef.current);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);

      // Restaurar scroll
      document.body.style.overflow = previousOverflow;

      // Restaurar focus
      prevActiveElementRef.current?.focus?.();
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.18 }}
          onClick={onCancel}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-5 outline-none"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-2">{message}</p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={[
                  "px-3 py-2 text-sm rounded-lg text-white disabled:opacity-60",
                  confirmVariant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700",
                ].join(" ")}
              >
                {isLoading ? "Procesando..." : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
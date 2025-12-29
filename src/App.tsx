import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { CustomersPage } from "./pages/CustomersPages";
import { CustomerNewPage } from "./pages/CustomerNewPage";
import { CustomerDetailPage } from "./pages/CustomerDetailPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { PurchaseNewPage } from "./pages/PurchaseNewPage";
import { PurchaseDetailPage } from "./pages/PurchaseDetailPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { MenuPage } from "./pages/MenuPage";
import { AuthProvider } from "./auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LogoutFab } from "./components/LogoutFAB";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageTransition = {
  duration: 0.2,
};

export const App = () => {
  const location = useLocation();

  return (
    <AuthProvider>
      <LayoutGroup>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >

            <Routes location={location}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MenuPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/new" element={<CustomerNewPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/purchases/new" element={<PurchaseNewPage />} />
                <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
              </Route>
            </Routes>
            <LogoutFab/>
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </AuthProvider>
  );
};
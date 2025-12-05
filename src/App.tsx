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
            <Route path="/" element={<MenuPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/new" element={<CustomerNewPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/purchases/new" element={<PurchaseNewPage />} />
            <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  );
};
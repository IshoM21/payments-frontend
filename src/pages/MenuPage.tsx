import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiShoppingCart, FiCreditCard } from "react-icons/fi";

const options = [
  { title: "Clientes", path: "/customers", icon: <FiUsers size={32} />, color: "bg-blue-50 border-blue-200", layoutId:"card-clientes" },
  { title: "Compras", path: "/purchases", icon: <FiShoppingCart size={32} />, color: "bg-green-50 border-green-200", layoutId:"card-compras" },
  { title: "Pagos", path: "/payments", icon: <FiCreditCard size={32} />, color: "bg-yellow-50 border-yellow-200", layoutId:"card-pagos" },
];

export const MenuPage = () => {
  return (
    <div className="min-h-screen flex justify-center items-center p-6 bg-gray-50">
      
      <div className="flex flex-wrap justify-center items-center gap-6 max-w-[1000px] w-full">
        
        {options.map((opt) => (
          <motion.div
            key={opt.title}
            layoutId={opt.layoutId}
            className="w-[280px] max-w-full"
          >
          <Link
            key={opt.title}
            to={opt.path}
            className={`
              ${opt.color}
              border
              rounded-xl 
              p-6 
              w-[280px]
              max-w-full
              shadow-md 
              hover:shadow-xl
              hover:-translate-y-1
              transition-all 
              duration-200
              text-center
              block
            `}
          >
            <div className="flex justify-center mb-3 text-gray-700">{opt.icon}</div>

            <h2 className="text-xl font-semibold text-gray-900">
              {opt.title}
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Ir a {opt.title.toLowerCase()}
            </p>
          </Link>
          </motion.div>
        ))}

      </div>
    </div>
  );
};
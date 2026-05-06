import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  LayoutDashboard, 
  Archive,
  AlertTriangle,
  BookOpen // <-- ACÁ AGREGAMOS EL ÍCONO DE LA LIBRETA
} from 'lucide-react';
import api from '../services/api';
import logo from '../assets/logo.png'; 

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname; 
  const [hayDeudores, setHayDeudores] = useState(false);

  // Consultar si existen deudores para activar la alerta visual
  useEffect(() => {
    const verificarDeudores = async () => {
      try {
        const res = await api.get('/clientes/deudores');
        // Si la lista tiene al menos un cliente, activamos la alerta
        setHayDeudores(res.data.length > 0);
      } catch (error) {
        console.error("Error al verificar deudores en sidebar", error);
      }
    };

    verificarDeudores();
  }, [location]); // Se ejecuta cada vez que el usuario navega entre pestañas

  const getLinkClass = (path) => {
    const base = "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ";
    if (currentPath === path) {
      return base + "bg-bianchi-red text-white font-bold shadow-lg"; 
    }
    return base + "text-blue-100 hover:bg-white/10 hover:text-white";
  };

  const getDeudoresLinkClass = () => {
      const isActive = currentPath === '/deudores';
      const base = "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group mt-2 relative ";
      
      if (isActive) {
          return base + "bg-red-600 text-white shadow-lg shadow-red-900/20 font-bold";
      }
      return base + "text-red-300 hover:bg-red-500/10 hover:text-red-200";
  };

  return (
    <aside className="w-64 bg-bianchi-blue text-white flex flex-col shadow-xl h-screen sticky top-0 border-r border-blue-900">
      
      {/* LOGO */}
      <div className="h-48 flex justify-center items-center bg-bianchi-blue border-b border-blue-800 relative">
        <div className="bg-white h-32 w-32 rounded-full shadow-2xl border-4 border-bianchi-red flex justify-center items-center overflow-hidden transform translate-y-2">
          <img 
            src={logo} 
            alt="Bianchi Latina" 
            className="w-full h-full object-cover scale-110" 
          />
        </div>
      </div>
      
      {/* NAVEGACIÓN */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        
        {/* Sección Principal */}
        <div className="text-xs font-bold text-blue-300 px-4 mb-2 uppercase tracking-wider">Principal</div>

        <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <LayoutDashboard size={20} /> <span className="font-medium">Dashboard</span>
        </Link>

        <Link to="/ventas" className={getLinkClass('/ventas')}>
            <ShoppingCart size={20} /> <span className="font-medium">Ventas</span>
        </Link>

        <Link to="/caja" className={getLinkClass('/caja')}>
            <Archive size={20} /> <span className="font-medium">Caja</span>
        </Link>

        {/* Sección Gestión */}
        <div className="text-xs font-bold text-blue-300 px-4 mt-6 mb-2 uppercase tracking-wider">Gestión</div>

        <Link to="/productos" className={getLinkClass('/productos')}>
          <Package size={20} /> <span className="font-medium">Productos</span>
        </Link>
        
        <Link to="/clientes" className={getLinkClass('/clientes')}>
           <Users size={20} /> <span className="font-medium">Clientes</span>
        </Link>

        {/* 👇 ACÁ ENTRAMOS NOSOTROS CON LA LIBRETA 👇 */}
        <Link to="/cuentas-corrientes" className={getLinkClass('/cuentas-corrientes')}>
           <BookOpen size={20} /> <span className="font-medium">Cuentas Corrientes</span>
        </Link>

        {/* Sección Cobranzas (Con Alerta Visual) */}
        <div className="border-t border-blue-800/50 mt-4 pt-4">
            <Link to="/deudores" className={getDeudoresLinkClass()}>
                <AlertTriangle size={20} className={currentPath === '/deudores' ? 'text-white' : 'text-red-400 group-hover:text-red-200'} />
                <span className="font-bold">Deudores</span>

                {/* 👇 EL BADGE LLAMATIVO 👇 */}
                {hayDeudores && currentPath !== '/deudores' && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
            </Link>
        </div>

      </nav>
      
      <div className="p-4 text-xs text-center text-blue-300/60 bg-blue-900/30">
        Bianchi Latina System v1.0
      </div>
    </aside>
  );
}
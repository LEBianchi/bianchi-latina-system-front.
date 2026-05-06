import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
  Eye,
  Search,
  Wallet,
} from 'lucide-react';
import VentaDetailModal from '../components/VentaDetailModal';

export default function DashboardPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADO DEL FILTRO (Por defecto 'hoy' o 'todo', lo que prefieras)
  const [filtroPeriodo, setFiltroPeriodo] = useState('todo');

  // ESTADO PARA LOS KPI (Tarjetas de arriba)
  const [stats, setStats] = useState({
    ventasHoy: 0,
    saldoCajaHoy: 0,
    porCobrar: 0,     
    cantidadVentas: 0
  });

  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // 1. EFECTO QUE RECARGA CUANDO CAMBIA EL FILTRO
  useEffect(() => {
    cargarDatos();
  }, [filtroPeriodo]); // <--- ¡ESTO HACE LA MAGIA!

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Pedimos al backend los números filtrados
      const resStats = await api.get(`/dashboard/resumen?periodo=${filtroPeriodo}`);
      if (resStats.data) setStats(resStats.data);

      // Cargamos la lista de ventas (siempre todas para buscar fácil, o podés filtrar si querés)
      const resVentas = await api.get('/ventas');
      setVentas(Array.isArray(resVentas.data) ? resVentas.data : []);

    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (id) => {
    // ... (Igual que antes) ...
    const toastId = toast.loading('Cargando...');
    try {
      const res = await api.get(`/ventas/${id}`);
      setVentaSeleccionada(res.data);
      setModalAbierto(true);
    } catch {
      toast.error('Error al cargar detalle');
    } finally {
      toast.dismiss(toastId);
    }
  };

  /* =======================
      FILTROS VISUALES DE LA TABLA
  ======================== */
  const ventasFiltradas = useMemo(() => {
    // Filtro visual para la tabla de abajo
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let inicio = new Date(0);
    let fin = new Date(2100, 0, 1);

    if (filtroPeriodo === 'hoy') {
      inicio = new Date(hoy);
      fin = new Date(hoy); fin.setHours(23, 59, 59);
    } else if (filtroPeriodo === 'semana') {
      inicio = new Date(hoy); inicio.setDate(hoy.getDate() - 7);
      fin = new Date(hoy); fin.setHours(23, 59, 59);
    } else if (filtroPeriodo === '30dias') {
      inicio = new Date(hoy); inicio.setDate(hoy.getDate() - 30);
      fin = new Date(hoy); fin.setHours(23, 59, 59);
    }

    let resultado = ventas.filter(v => {
      const fecha = new Date(v.fecha);
      return fecha >= inicio && fecha <= fin;
    });

    if (busqueda) {
      resultado = resultado.filter(v => {
        const cliente = v.cliente || 'Consumidor Final';
        return (
          cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
          v.id.toString().includes(busqueda)
        );
      });
    }
    return resultado;
  }, [ventas, filtroPeriodo, busqueda]);

  // Botón reutilizable
  const FilterButton = ({ label, value }) => (
    <button
      onClick={() => setFiltroPeriodo(value)}
      className={`px-4 py-2 rounded-full text-sm font-bold transition
        ${filtroPeriodo === value
          ? 'bg-blue-600 text-white shadow scale-105'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
      `}
    >
      {label}
    </button>
  );

  // Textos dinámicos según filtro
  const getLabelPeriodo = () => {
      if(filtroPeriodo === 'hoy') return 'Hoy';
      if(filtroPeriodo === 'semana') return 'Esta Semana';
      if(filtroPeriodo === '30dias') return 'Últimos 30 días';
      return 'Total Histórico';
  }

  const getLabelDeuda = () => {
    if(filtroPeriodo === 'todo') return 'Deuda Total Histórica';
    return `Vencimientos: ${getLabelPeriodo()}`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-black flex items-center gap-2">
          <LayoutDashboard className="text-blue-600" />
          Dashboard
        </h1>

        <div className="flex gap-2 flex-wrap">
          <FilterButton label="Hoy" value="hoy" />
          <FilterButton label="Última semana" value="semana" />
          <FilterButton label="30 días" value="30dias" />
          <FilterButton label="Todas" value="todo" />
        </div>
      </div>

      {/* KPIs (TARJETAS DINÁMICAS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. A COBRAR (DEUDA) */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 transition-all duration-300">
          <p className="text-xs font-bold text-gray-500 uppercase">{getLabelDeuda()}</p>
          <p className="text-3xl font-black text-red-600">
            ${stats.porCobrar?.toLocaleString() || '0'}
          </p>
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <AlertCircle size={14} /> 
            {filtroPeriodo === 'todo' ? 'Clientes morosos totales' : 'A cobrar en este periodo'}
          </p>
        </div>

        {/* 2. CAJA (INGRESOS) */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 transition-all duration-300">
          <p className="text-xs font-bold text-gray-500 uppercase">Caja ({getLabelPeriodo()})</p>
          <p className="text-3xl font-black text-green-600">
             ${stats.saldoCajaHoy?.toLocaleString() || '0'}
          </p>
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <Wallet size={14} /> Ingresos netos
          </p>
        </div>

        {/* 3. FACTURACIÓN */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 transition-all duration-300">
          <p className="text-xs font-bold text-gray-500 uppercase">
             Facturación ({getLabelPeriodo()})
          </p>
          <p className="text-3xl font-black text-gray-800">
            ${stats.ventasHoy?.toLocaleString() || '0'}
          </p>
          <p className="text-blue-600 text-sm mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> {stats.cantidadVentas} Ventas registradas
          </p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="flex justify-end">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar cliente o ID..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* TABLA DE VENTAS */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-center">Tipo</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center">Actualizando...</td></tr>
            ) : ventasFiltradas.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400">No hay movimientos en este periodo</td></tr>
            ) : (
              ventasFiltradas.map(v => (
                <tr key={v.id} className="hover:bg-blue-50 transition">
                  <td className="p-4 font-bold text-gray-600">#{v.id}</td>
                  <td className="p-4">
                    {new Date(v.fecha).toLocaleDateString()}
                    <span className="text-xs text-gray-400 block">{new Date(v.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </td>
                  <td className="p-4 font-medium">{v.cliente || 'Consumidor Final'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${v.tipo === 'Efectivo' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{v.tipo}</span>
                  </td>
                  <td className="p-4 text-right font-bold">${v.total.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => verDetalle(v.id)} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition"><Eye size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <VentaDetailModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        venta={ventaSeleccionada}
        onUpdate={() => { cargarDatos(); setModalAbierto(false); }}
      />
    </div>
  );
}
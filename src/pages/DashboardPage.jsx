import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { LayoutDashboard, TrendingUp, AlertCircle, Eye, Search, Calendar, Filter, Wallet, CreditCard, Landmark } from 'lucide-react';
import VentaDetailModal from '../components/VentaDetailModal';

export default function DashboardPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState('30dias'); 

  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => { cargarVentas(); }, []);

  const cargarVentas = async () => {
    try {
      const res = await api.get('/ventas');
      setVentas(res.data);
    } catch (error) {
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (id) => {
    const toastId = toast.loading("Cargando...");
    try {
      const res = await api.get(`/ventas/${id}`);
      setVentaSeleccionada(res.data);
      setModalAbierto(true);
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Error al cargar detalle");
    }
  };

  const metricas = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    let inicioVentas = new Date(0);
    let finVentas = new Date(2100, 0, 1);
    let inicioCobros = new Date(hoy); 
    let finCobros = new Date(2100, 0, 1);

    
    if (filtroPeriodo === 'hoy') {
        inicioVentas = new Date(hoy); finVentas = new Date(hoy); finVentas.setHours(23,59,59);
        finCobros = new Date(hoy); finCobros.setHours(23,59,59);
    } 
    else if (filtroPeriodo === 'semana') {
        const dia = hoy.getDay() || 7; 
        inicioVentas = new Date(hoy); inicioVentas.setDate(hoy.getDate() - dia + 1);
        finVentas = new Date(inicioVentas); finVentas.setDate(inicioVentas.getDate() + 6); finVentas.setHours(23,59,59);
        finCobros = new Date(finVentas);
    }
    else if (filtroPeriodo === 'mes') {
        inicioVentas = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        finVentas = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
        finCobros = finVentas;
    }
    else if (filtroPeriodo === '30dias') {
        inicioVentas = new Date(hoy); inicioVentas.setDate(hoy.getDate() - 30);
        finVentas = new Date(hoy); finVentas.setHours(23,59,59);
        finCobros = new Date(hoy); finCobros.setDate(hoy.getDate() + 30); finCobros.setHours(23,59,59);
    }
    else if (filtroPeriodo === 'anio') {
        inicioVentas = new Date(hoy.getFullYear(), 0, 1);
        finVentas = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59);
        finCobros = finVentas;
    }

    
    const ventasDelPeriodo = ventas.filter(v => {
        const fechaVenta = new Date(v.fecha);
        return fechaVenta >= inicioVentas && fechaVenta <= finVentas;
    });

    
    const totalVendidoPeriodo = ventasDelPeriodo.reduce((acc, v) => acc + (v.total || 0), 0);

    const totalTarjeta = ventasDelPeriodo
        .filter(v => v.tipo === 'Tarjeta')
        .reduce((acc, v) => acc + (v.total || 0), 0);

    const totalTransferencia = ventasDelPeriodo
        .filter(v => v.tipo === 'Transferencia')
        .reduce((acc, v) => acc + (v.total || 0), 0);

    
    let totalACobrarPeriodo = 0;
    ventas.forEach(v => {
        if (v.listaCuotas && v.listaCuotas.length > 0) {
            v.listaCuotas.forEach(cuota => {
                const vencimiento = new Date(cuota.fechaVencimiento);
                if (vencimiento >= inicioCobros && vencimiento <= finCobros) {
                    const monto = cuota.montoCuota || 0;
                    const pagado = cuota.montoPagado || 0;
                    const saldo = monto - pagado;
                    if(saldo > 0) totalACobrarPeriodo += saldo; 
                }
            });
        }
    });

    const cantAtrasados = ventas.filter(v => {
         const cuotas = v.listaCuotas || [];
         return cuotas.some(c => {
             const vencimiento = new Date(c.fechaVencimiento);
             return vencimiento < hoy && (c.montoPagado || 0) < (c.montoCuota || 0);
         });
    }).length;

    return { totalVendidoPeriodo, totalACobrarPeriodo, cantAtrasados, ventasDelPeriodo, totalTarjeta, totalTransferencia };
  }, [ventas, filtroPeriodo]);

  
  const ventasTabla = metricas.ventasDelPeriodo.filter(v => {
    const nombreCliente = v.cliente || "Consumidor Final"; 
    
    return nombreCliente.toLowerCase().includes(busqueda.toLowerCase()) || 
           v.id.toString().includes(busqueda);
  });

  const FilterButton = ({ label, value }) => (
    <button onClick={() => setFiltroPeriodo(value)}
      className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filtroPeriodo === value ? 'bg-bianchi-blue text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><LayoutDashboard className="text-bianchi-blue"/> Dashboard</h1>
          <p className="text-gray-500 text-sm">Viendo proyección: <span className="font-bold text-bianchi-blue uppercase">{filtroPeriodo === '30dias' ? 'Próximos 30 Días' : filtroPeriodo}</span></p>
        </div>
        <div className="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            <div className="flex items-center px-2 text-gray-400"><Filter size={16} /></div>
            <FilterButton label="Hoy" value="hoy" />
            <FilterButton label="Semana" value="semana" />
            <FilterButton label="Mes (Calendario)" value="mes" />
            <FilterButton label="Próx. 30 Días" value="30dias" />
            <FilterButton label="Año" value="anio" />
            <FilterButton label="Todo" value="historico" />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-orange-500 relative overflow-hidden">
            <div className="relative z-10">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">A Cobrar (Cuotas)</div>
                <div className="text-3xl font-black text-gray-800">${metricas.totalACobrarPeriodo.toLocaleString()}</div>
                <div className="text-xs text-orange-600 font-bold mt-2 flex items-center bg-orange-50 w-fit px-2 py-1 rounded"><Wallet size={12} className="mr-1"/> Ingresos Futuros</div>
            </div>
            <Wallet className="absolute right-[-10px] bottom-[-10px] text-orange-100 w-24 h-24 transform rotate-12 z-0"/>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500 relative overflow-hidden">
             <div className="relative z-10">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Vendido</div>
                <div className="text-3xl font-black text-gray-800">${metricas.totalVendidoPeriodo.toLocaleString()}</div>
                <div className="text-xs text-blue-600 font-bold mt-2 flex items-center bg-blue-50 w-fit px-2 py-1 rounded"><TrendingUp size={12} className="mr-1"/> Facturación Global</div>
            </div>
             <TrendingUp className="absolute right-[-10px] bottom-[-10px] text-blue-100 w-24 h-24 transform rotate-12 z-0"/>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500 relative overflow-hidden">
             <div className="relative z-10">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Clientes Atrasados</div>
                <div className="text-3xl font-black text-red-600">{metricas.cantAtrasados}</div>
                <div className="text-xs text-red-600 font-bold mt-2 flex items-center bg-red-50 w-fit px-2 py-1 rounded"><AlertCircle size={12} className="mr-1"/> Gestión de Cobranza</div>
            </div>
            <AlertCircle className="absolute right-[-10px] bottom-[-10px] text-red-100 w-24 h-24 transform rotate-12 z-0"/>
        </div>
      </div>

      {/* KPI DIGITALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-white to-purple-50 p-4 rounded-xl shadow-sm border border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Landmark size={24}/></div>
                  <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Por Transferencia</p>
                      <p className="text-2xl font-black text-gray-800">${metricas.totalTransferencia.toLocaleString()}</p>
                  </div>
              </div>
          </div>

          <div className="bg-gradient-to-r from-white to-orange-50 p-4 rounded-xl shadow-sm border border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600"><CreditCard size={24}/></div>
                  <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Por Tarjeta</p>
                      <p className="text-2xl font-black text-gray-800">${metricas.totalTarjeta.toLocaleString()}</p>
                  </div>
              </div>
          </div>
      </div>

      {/* TABLA DE OPERACIONES */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2"><Calendar size={18} className="text-bianchi-blue"/> Operaciones Recientes</h3>
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type="text" placeholder="Filtrar..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-bianchi-blue" value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
            </div>
        </div>
        <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 sticky top-0 uppercase text-xs">
                    <tr>
                        <th className="p-4">#</th>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Cliente</th>
                        
                        
                        <th className="p-4">Dirección</th>
                        <th className="p-4">Loc.</th>

                        <th className="p-4">Vendedor</th>
                        <th className="p-4 text-center">Tipo</th>
                        <th className="p-4 text-right">Total</th>
                        <th className="p-4 text-center">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? <tr><td colSpan="9" className="p-10 text-center">Cargando...</td></tr> : 
                     ventasTabla.length === 0 ? <tr><td colSpan="9" className="p-10 text-center text-gray-400 italic">No hay datos en este periodo.</td></tr> :
                     ventasTabla.map(v => {
                        
                        const fecha = new Date(v.fecha).toLocaleDateString();
                        const nombreCliente = v.cliente || "Consumidor Final"; 
                        const tipoVenta = v.tipo || "Desconocido"; 
                        const totalVenta = v.total || 0; 
                        
                        
                        const localidad = v.localidad || "Monteros";
                        const direccion = v.direccion || "-"; // <--- Fallback por si no hay dirección
                        const responsable = v.responsable || "Sistema";

                        return (
                        <tr key={v.id} className="hover:bg-blue-50 transition">
                            <td className="p-4 font-bold text-gray-500">{v.id}</td>
                            <td className="p-4">{fecha}</td>
                            <td className="p-4 font-medium">{nombreCliente}</td>
                            

                            <td className="p-4 text-xs text-gray-500 truncate max-w-[150px]" title={direccion}>
                                {direccion}
                            </td>
                            <td className="p-4 text-xs text-gray-500 uppercase">{localidad}</td>
                            

                            <td className="p-4 text-xs text-gray-500 capitalize">{responsable}</td>
                            
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                    ${tipoVenta === 'Tarjeta' ? 'bg-orange-100 text-orange-700' : 
                                      tipoVenta === 'Transferencia' ? 'bg-purple-100 text-purple-700' : 
                                      'bg-gray-100 text-gray-700'}`}>
                                    {tipoVenta}
                                </span>
                            </td>
                            <td className="p-4 text-right font-bold text-gray-700">${totalVenta.toLocaleString()}</td>
                            <td className="p-4 text-center">
                                <button onClick={() => verDetalle(v.id)} className="text-bianchi-blue hover:bg-blue-100 p-2 rounded"><Eye size={18}/></button>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
      </div>
      
      <VentaDetailModal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        venta={ventaSeleccionada} 
        onUpdate={cargarVentas} 
      />
    </div>
  );
}
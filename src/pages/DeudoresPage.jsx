import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Phone, MapPin, DollarSign, Search, UserCheck } from 'lucide-react';
import ClientHistoryModal from '../components/ClientHistoryModal'; 

export default function DeudoresPage() {
  const [deudores, setDeudores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  
  
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [clienteId, setClienteId] = useState(null);

  useEffect(() => { cargarDeudores(); }, []);

  const cargarDeudores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clientes/deudores');
      setDeudores(res.data);
    } catch (error) {
      toast.error("Error al cargar lista de morosos");
    } finally {
      setLoading(false);
    }
  };

  const verFicha = (id) => {
      setClienteId(id);
      setHistorialAbierto(true);
  };

  const filtrados = deudores.filter(d => d.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const totalDeudaCalle = deudores.reduce((acc, d) => acc + d.deudaTotal, 0);

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-black text-red-700 flex items-center gap-2">
                <AlertTriangle className="text-red-600"/> Gestión de Cobranzas
            </h1>
            <p className="text-gray-500">Listado de clientes con saldo pendiente</p>
        </div>
        <div className="bg-red-50 border border-red-200 px-6 py-3 rounded-xl text-right">
            <div className="text-xs text-red-500 font-bold uppercase">Deuda Total en la Calle</div>
            <div className="text-3xl font-black text-red-700">${totalDeudaCalle.toLocaleString()}</div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input type="text" placeholder="Buscar deudor..." className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col flex-1 overflow-hidden">
        <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm">
                <thead className="bg-red-50 text-red-800 sticky top-0 uppercase text-xs">
                    <tr>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Contacto</th>
                        <th className="p-4 text-center">Cuotas Vencidas</th>
                        <th className="p-4 text-right">Deuda Total</th>
                        <th className="p-4 text-center">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? <tr><td colSpan="5" className="p-10 text-center">Cargando...</td></tr> :
                     filtrados.length === 0 ? <tr><td colSpan="5" className="p-10 text-center text-green-600 font-bold">¡Todo cobrado! No hay deudores.</td></tr> :
                     filtrados.map(d => (
                        <tr key={d.id} className="hover:bg-red-50 transition">
                            <td className="p-4 font-bold text-gray-800">{d.nombre}</td>
                            <td className="p-4 space-y-1">
                                <div className="flex items-center gap-2 text-xs text-gray-600"><Phone size={12}/> {d.telefono || "-"}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-600"><MapPin size={12}/> {d.direccion || "-"}</div>
                            </td>
                            <td className="p-4 text-center">
                                {d.cuotasVencidas > 0 ? (
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs animate-pulse">
                                        {d.cuotasVencidas} Vencidas
                                    </span>
                                ) : (
                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold text-xs">
                                        Al día (con saldo)
                                    </span>
                                )}
                            </td>
                            <td className="p-4 text-right font-black text-lg text-red-600">
                                ${d.deudaTotal.toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                                <button onClick={() => verFicha(d.id)} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center justify-center mx-auto text-xs">
                                    <UserCheck size={16} className="mr-1"/> Ver Ficha
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <ClientHistoryModal isOpen={historialAbierto} onClose={() => setHistorialAbierto(false)} clienteId={clienteId}/>
    </div>
  );
}
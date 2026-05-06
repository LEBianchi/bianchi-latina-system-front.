import { useState, useEffect } from 'react';
import { BookOpen, Search, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import LibretaModal from '../components/LibretaModal';

export default function CuentasCorrientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/libreta/clientes');
      setClientes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const abrirLibreta = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalAbierto(true);
  };

  // Filtrador de búsqueda
  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.dni.includes(busqueda)
  );

  // Estadísticas rápidas
  const totalEnLaCalle = clientes.reduce((acc, curr) => acc + curr.deudaLibreta, 0);
  const totalMorosos = clientes.filter(c => c.esMoroso).length;

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      
      {/* HEADER Y ESTADÍSTICAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" /> Cuentas Corrientes
          </h1>
          <p className="text-gray-500">Gestión de libretas, retiros y cobros de la Caja 2</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-xl shadow-md border-l-4 border-l-blue-500">
            <p className="text-xs font-bold text-gray-500 uppercase">Total en la calle</p>
            <p className="text-xl font-black text-blue-700">${totalEnLaCalle.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-md border-l-4 border-l-orange-500">
            <p className="text-xs font-bold text-gray-500 uppercase">Morosos (+4 sem)</p>
            <p className="text-xl font-black text-orange-700">{totalMorosos} clientes</p>
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-2">
        <Search className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar cliente por nombre o DNI..." 
          className="w-full outline-none font-medium"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="bg-white rounded-xl shadow-md border flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4 text-right">Deuda Actual</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500">Cargando libretas...</td></tr>
              ) : clientesFiltrados.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{c.nombre}</p>
                    <p className="text-xs text-gray-500">DNI: {c.dni}</p>
                  </td>
                  
                  <td className="p-4 text-right">
                    <span className={`font-black text-lg ${c.deudaLibreta > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      ${c.deudaLibreta.toLocaleString()}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    {c.deudaLibreta === 0 ? (
                      <span className="flex items-center gap-1 text-green-600 font-bold bg-green-100 px-2 py-1 rounded-lg w-max text-xs">
                        <CheckCircle size={14} /> Al día
                      </span>
                    ) : c.esMoroso ? (
                      <span className="flex items-center gap-1 text-orange-700 font-bold bg-orange-100 px-2 py-1 rounded-lg w-max text-xs">
                        <AlertTriangle size={14} /> Moroso (+4 sem)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-lg w-max text-xs">
                        Deuda Activa
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <button 
                      onClick={() => abrirLibreta(c)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition flex items-center justify-center gap-2 mx-auto"
                    >
                      Operar <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EL MODAL QUE HICIMOS ANTES SE RENDERIZA ACÁ */}
      <LibretaModal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        cliente={clienteSeleccionado}
        onActualizado={cargarDatos} 
      />

    </div>
  );
}
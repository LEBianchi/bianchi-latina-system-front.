import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Users } from 'lucide-react';
import ClientTable from '../components/ClientTable';
import ClientModal from '../components/ClientModal';
import ClientHistoryModal from '../components/ClientHistoryModal';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteAEditar, setClienteAEditar] = useState(null);

  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [clienteIdHistorial, setClienteIdHistorial] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, [busqueda]);

  // =========================
  // CARGAR CLIENTES (FIX)
  // =========================
  const cargarClientes = async () => {
    setLoading(true);
    try {
      const endpoint = busqueda
        ? `/clientes?busqueda=${encodeURIComponent(busqueda)}`
        : '/clientes';

      const res = await api.get(endpoint);

      const lista = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.clientes)
          ? res.data.clientes
          : [];

      setClientes(lista);
    } catch (error) {
      toast.error('Error de conexión');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GUARDAR / EDITAR
  // =========================
  const handleGuardar = async (formData) => {
    try {
      if (clienteAEditar) {
        await api.put(`/clientes/${clienteAEditar.id}`, formData);
        toast.success('Cliente actualizado');
      } else {
        await api.post('/clientes', formData);
        toast.success('Cliente creado');
      }
      setModalAbierto(false);
      setClienteAEditar(null);
      cargarClientes();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al guardar');
    }
  };

  // =========================
  // ELIMINAR
  // =========================
  const handleEliminar = async (id) => {
    if (!confirm("¿Borrar cliente?")) return;
    try {
      await api.delete(`/clientes/${id}`);
      toast.success('Cliente eliminado');
      cargarClientes();
    } catch (error) {
      toast.error('No se pudo eliminar');
    }
  };

  // =========================
  // HISTORIAL
  // =========================
  const abrirHistorial = (id) => {
    setClienteIdHistorial(id);
    setHistorialAbierto(true);
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-bianchi-blue" /> Clientes
          </h1>
          <p className="text-gray-500">Cartera de clientes</p>
        </div>

        <button
          onClick={() => {
            setClienteAEditar(null);
            setModalAbierto(true);
          }}
          className="bg-bianchi-blue text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition flex items-center shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" /> Nuevo Cliente
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-bianchi-blue outline-none"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="text-center p-10">Cargando...</div>
      ) : (
        <ClientTable
          clientes={Array.isArray(clientes) ? clientes : []}
          onEdit={(c) => {
            setClienteAEditar(c);
            setModalAbierto(true);
          }}
          onDelete={handleEliminar}
          onHistory={abrirHistorial}
        />
      )}

      {/* MODALES */}
      <ClientModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={handleGuardar}
        clienteInicial={clienteAEditar}
      />

      <ClientHistoryModal
        isOpen={historialAbierto}
        onClose={() => setHistorialAbierto(false)}
        clienteId={clienteIdHistorial}
      />
    </div>
  );
}

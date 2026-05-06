import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Phone, MapPin, Search, UserCheck, MessageCircle, Clock } from 'lucide-react';
import ClientHistoryModal from '../components/ClientHistoryModal'; 

export default function DeudoresPage() {
  const [deudores, setDeudores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [clienteId, setClienteId] = useState(null);
  
  // Estado para rastrear notificaciones del día
  const [notificados, setNotificados] = useState({});

  useEffect(() => { 
    cargarDeudores();
    // Cargar notificados del localStorage (se resetean cada día)
    const hoy = new Date().toLocaleDateString();
    const guardados = JSON.parse(localStorage.getItem('notificaciones_wpp') || '{}');
    if (guardados.fecha === hoy) {
      setNotificados(guardados.ids || {});
    }
  }, []);

  const cargarDeudores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clientes/deudores');
      setDeudores(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Error al cargar lista de morosos");
    } finally {
      setLoading(false);
    }
  };

  const enviarWhatsAppMora = (cliente) => {
    const telefonoReal = cliente?.telefono;
    if (!telefonoReal || telefonoReal === "-" || telefonoReal === "") {
      return toast.error("El cliente no tiene teléfono.");
    }

    const telLimpio = telefonoReal.replace(/\D/g, ''); 
    const monto = Number(cliente?.deudaTotal ?? 0).toLocaleString();
    const texto = `¡Hola, *${cliente.nombre}*! 👋 Buenos días.\n\nNos comunicamos desde *Bianchi Latina* para informarle que registra un saldo pendiente de *$${monto}*.\n\nLe recordamos que, superados los 7 días de demora, el sistema aplica recargos por mora.\n\nSi ya pagó, desestime este mensaje. ¡Gracias!`;

    // Guardar en el historial de hoy
    const hoy = new Date().toLocaleDateString();
    const nuevosNotificados = { ...notificados, [cliente.id]: true };
    setNotificados(nuevosNotificados);
    localStorage.setItem('notificaciones_wpp', JSON.stringify({ fecha: hoy, ids: nuevosNotificados }));

    window.open(`https://wa.me/${telLimpio}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const filtrados = deudores.filter(d => (d?.nombre ?? "").toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-red-700 flex items-center gap-2">
            <AlertTriangle className="text-red-600"/> Gestión de Cobranzas
          </h1>
          <p className="text-gray-500">Clientes con pagos pendientes</p>
        </div>
        <div className="bg-red-50 border border-red-200 px-6 py-3 rounded-xl text-right">
          <div className="text-xs text-red-500 font-bold uppercase">Deuda en la Calle</div>
          <div className="text-3xl font-black text-red-700">${deudores.reduce((acc, d) => acc + Number(d?.deudaTotal ?? 0), 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input type="text" placeholder="Buscar deudor..." className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-1 overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-50 text-red-800 sticky top-0 uppercase text-xs">
              <tr>
                <th className="p-4">Cliente / Contacto</th>
                <th className="p-4 text-center">Estado de Mora</th>
                <th className="p-4 text-right">Deuda</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center">Cargando...</td></tr>
              ) : filtrados.map(d => {
                const yaNotificado = notificados[d.id];
                // Simulamos días de atraso (en un sistema real vendría del backend, aquí lo calculamos visualmente)
                const diasAtraso = d.cuotasVencidas * 7; // Ejemplo estimado

                return (
                  <tr key={d.id} className={`hover:bg-red-50 transition ${yaNotificado ? 'opacity-70' : ''}`}>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-lg">{d.nombre}</div>
                      <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
                        <span className="flex items-center gap-1"><Phone size={12}/> {d.telefono}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {d.localidad}</span>
                      </div>
                    </td>
                    
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs uppercase">
                           {d.cuotasVencidas} cuotas vencidas
                        </span>
                        {diasAtraso >= 4 ? (
                          <span className="text-[10px] font-black text-red-600 animate-pulse flex items-center gap-1">
                            <Clock size={10}/> SE DEBE NOTIFICAR AL CLIENTE
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Atraso reciente</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right font-black text-xl text-red-600">
                      ${Number(d.deudaTotal).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => enviarWhatsAppMora(d)}
                          className={`px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2 text-xs ${
                            yaNotificado 
                            ? 'bg-gray-200 text-gray-500' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          <MessageCircle size={16}/>
                          {yaNotificado ? 'Cliente ya notificado' : 'Notificar'}
                        </button>
                        
                        <button onClick={() => {setClienteId(d.id); setHistorialAbierto(true);}} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs">
                          Ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ClientHistoryModal isOpen={historialAbierto} onClose={() => setHistorialAbierto(false)} clienteId={clienteId} />
    </div>
  );
}
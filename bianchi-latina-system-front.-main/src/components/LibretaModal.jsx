import { useState, useEffect } from 'react';
import { X, AlertTriangle, BookOpen, Banknote, ShieldAlert, UserCheck, ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LibretaModal({ isOpen, onClose, cliente, onActualizado }) {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Pestañas: 'cargo' (lleva mercadería) o 'pago' (trae plata)
  const [modo, setModo] = useState('cargo'); 

  const [monto, setMonto] = useState('');
  const [detalle, setDetalle] = useState('');
  const [responsable, setResponsable] = useState('');
  const [autorizadoPor, setAutorizadoPor] = useState('');

  useEffect(() => {
    if (isOpen && cliente) {
      cargarEstado();
      setMonto('');
      setDetalle('');
      setAutorizadoPor('');
      setModo('cargo');
    }
  }, [isOpen, cliente]);

  const cargarEstado = async () => {
    try {
      const res = await api.get(`/libreta/estado/${cliente.id}`);
      setEstado(res.data);
    } catch (error) {
      toast.error('Error al cargar estado de la libreta');
    }
  };

  if (!isOpen || !cliente || !estado) return null;

  // Lógica de las 400 lucas en vivo
  const montoNumerico = Number(monto) || 0;
  const nuevaDeudaSimulada = modo === 'cargo' ? (estado.deudaActual + montoNumerico) : (estado.deudaActual - montoNumerico);
  const requiereAutorizacion = modo === 'cargo' && nuevaDeudaSimulada > 400000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!montoNumerico || montoNumerico <= 0) return toast.error('El monto debe ser mayor a 0');
    if (!responsable.trim()) return toast.error('Indicá tu nombre como responsable de caja');
    
    if (modo === 'cargo') {
      if (!detalle.trim()) return toast.error('Tenés que poner un detalle de lo que lleva');
      if (requiereAutorizacion && !autorizadoPor) return toast.error('Falta autorización para superar los $400.000');
    }

    setLoading(true);
    try {
      if (modo === 'cargo') {
        await api.post('/libreta/cargo', {
          clienteId: cliente.id,
          monto: montoNumerico,
          detalle: detalle,
          responsableCaja: responsable,
          autorizadoPor: requiereAutorizacion ? autorizadoPor : ''
        });
        toast.success('Mercadería anotada en la libreta');
      } else {
        await api.post('/libreta/pago', {
          clienteId: cliente.id,
          monto: montoNumerico,
          responsableCaja: responsable
        });
        toast.success('Pago recibido e ingresado a la Caja');
      }
      
      onActualizado(); // Actualiza la lista de clientes atrás
      onClose(); // Cierra el modal
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="text-blue-400" /> Libreta Caja 2
            </h2>
            <p className="text-sm text-gray-400">{cliente.nombre} (DNI: {cliente.dni})</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition"><X /></button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* TARJETAS DE ALERTA (ACÁ ESTÁ LA MAGIA) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase">Deuda Actual</p>
              <p className={`text-2xl font-black ${estado.deudaActual > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${estado.deudaActual.toLocaleString()}
              </p>
            </div>
            
            <div className={`p-4 rounded-xl border flex flex-col justify-center ${estado.esMoroso ? 'bg-orange-100 border-orange-400' : 'bg-gray-50'}`}>
              <p className="text-xs font-bold text-gray-500 uppercase">Último Pago</p>
              <p className={`font-bold ${estado.esMoroso ? 'text-orange-700' : 'text-gray-800'}`}>
                {estado.ultimoPago ? new Date(estado.ultimoPago).toLocaleDateString() : 'Nunca'}
              </p>
              {estado.esMoroso && <span className="text-xs font-bold text-orange-600 mt-1">⚠️ +4 Semanas de atraso</span>}
            </div>
          </div>

          {estado.alertaDeudaAlta && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded text-yellow-800 flex gap-2 items-center text-sm font-bold">
              <AlertTriangle size={18} /> Atención: La deuda supera los $300.000.
            </div>
          )}

          {/* SELECTOR DE OPERACIÓN */}
          <div className="flex p-1 bg-gray-200 rounded-lg">
            <button 
              type="button" 
              onClick={() => setModo('cargo')} 
              className={`flex-1 py-2 rounded-md font-bold text-sm transition ${modo === 'cargo' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              Lleva Mercadería (Anotar)
            </button>
            <button 
              type="button" 
              onClick={() => setModo('pago')} 
              className={`flex-1 py-2 rounded-md font-bold text-sm transition ${modo === 'pago' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
            >
              Trae Plata (Abonar)
            </button>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Tu Nombre (Cajero)</label>
                <input required value={responsable} onChange={e => setResponsable(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="¿Quién anota?" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Monto ($)</label>
                <input required type="number" value={monto} onChange={e => setMonto(e.target.value)} className="w-full p-2 border rounded font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
              </div>
            </div>

            {modo === 'cargo' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Detalle de mercadería</label>
                <input required value={detalle} onChange={e => setDetalle(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Correa, rulemán y aceite..." />
              </div>
            )}

            {/* ALERTA DE AUTORIZACIÓN (LÍMITE 400K) */}
            {requiereAutorizacion && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mt-4 animate-scale-up">
                <div className="flex gap-2 text-red-700 font-bold mb-2">
                  <ShieldAlert /> <span>¡Límite de $400.000 superado!</span>
                </div>
                <p className="text-xs text-red-600 mb-3">La nueva deuda sería de <b>${nuevaDeudaSimulada.toLocaleString()}</b>. Se necesita la firma de un superior para entregar esta mercadería.</p>
                <div className="flex items-center gap-2">
                  <UserCheck className="text-red-400" />
                  <select required={requiereAutorizacion} value={autorizadoPor} onChange={e => setAutorizadoPor(e.target.value)} className="flex-1 p-2 border border-red-300 rounded outline-none font-bold text-red-900 bg-white">
                    <option value="">-- Seleccionar Autoridad --</option>
                    <option value="Mary">Mary</option>
                    <option value="Miguel">Miguel</option>
                    <option value="Bianchi">Bianchi</option>
                  </select>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || (requiereAutorizacion && !autorizadoPor)}
              className={`w-full py-3 mt-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition shadow-lg
                ${loading || (requiereAutorizacion && !autorizadoPor) ? 'bg-gray-400 cursor-not-allowed' 
                : modo === 'cargo' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? 'Procesando...' : modo === 'cargo' ? 'Anotar en Libreta' : 'Ingresar Pago a Caja 2'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
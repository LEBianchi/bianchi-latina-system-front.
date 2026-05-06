import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, HandCoins, CheckCircle, Wallet } from 'lucide-react';

export default function PagarCuotaModal({ venta, cuota, onClose, reloadVentas }) {
  const [loading, setLoading] = useState(false);
  
  // 👇 NUEVO: Estado para guardar el medio de pago seleccionado
  const [medioPago, setMedioPago] = useState('Efectivo');

  if (!venta || !cuota) return null;

  // Adaptador de datos: para que no falle si la venta viene con formato distinto
  const ventaId = venta.cabecera?.id || venta.id;
  const clienteNombre = venta.cabecera?.clienteNombre || venta.cliente?.nombre || "Cliente";

  const handleCobrar = async () => {
    setLoading(true);
    try {
      // 👇 ACÁ MANDAMOS EL MEDIO DE PAGO AL SERVIDOR
      const datosPago = {
        monto: cuota.montoCuota, 
        medioPago: medioPago // <--- Toma lo que elegiste en el select
      };

      await api.post(`/ventas/${ventaId}/cuotas/${cuota.numeroCuota}/pagar`, datosPago);
      
      toast.success(`¡Cuota ${cuota.numeroCuota} cobrada con ${medioPago}!`);
      
      onClose();
      if (reloadVentas) reloadVentas();

    } catch (error) {
      console.error(error);
      const mensajeError = error.response?.data || 'Error al cobrar la cuota.';
      toast.error(mensajeError); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in">
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-gray-200">

        {/* HEADER */}
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <HandCoins size={24} className="text-blue-200" />
            Cobrar Cuota #{cuota.numeroCuota}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
            <p className="text-xs text-blue-500 font-bold uppercase mb-1">Monto a Cobrar</p>
            <p className="text-4xl font-black text-blue-700">
              ${cuota.montoCuota?.toLocaleString()}
            </p>
          </div>

          {/* 👇 NUEVO: SELECTOR DE MEDIO DE PAGO */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Wallet size={14} /> Medio de Pago
            </label>
            <select
              value={medioPago}
              onChange={(e) => setMedioPago(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
            >
              <option value="Efectivo">💵 Efectivo</option>
              <option value="Transferencia">📱 Transferencia / Banco</option>
            </select>
          </div>

          <div className="space-y-2 text-sm text-gray-600 pt-2">
            <div className="flex justify-between border-b pb-2">
              <span>Cliente:</span>
              <span className="font-bold text-gray-800">{clienteNombre}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Vencimiento:</span>
              <span className="font-bold text-gray-800">
                {new Date(cuota.fechaVencimiento).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span>Estado actual:</span>
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">
                Pendiente
              </span>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-gray-50 flex gap-3 justify-end border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleCobrar}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : (
              <>
                <CheckCircle size={18} /> Confirmar Cobro
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import api from '../services/api';
import { X, User, AlertTriangle, CheckCircle, Clock, Calendar, ShoppingBag, MapPin, Printer } from 'lucide-react';

export default function ClientHistoryModal({ isOpen, onClose, clienteId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && clienteId) {
      cargarEstado();
    } else {
        setData(null); 
        setError(false);
    }
  }, [isOpen, clienteId]);

  const cargarEstado = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/clientes/${clienteId}/estado-cuenta`);
      setData(res.data);
    } catch (error) {
      console.error("Error al cargar historial", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block">
      
      
      <style>{`
        @media print {
          @page { margin: 20px; size: auto; }
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          
          /* Esto rompe la caja del modal para que ocupe toda la hoja */
          .modal-content {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          /* Asegurar colores oscuros para texto */
          h2, h3, p, span, div { color: black !important; }
          
          /* Ocultar scrollbars */
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh] modal-content">
        
        {/* HEADER */}
        <div className="bg-gray-900 p-6 flex justify-between items-start text-white shrink-0 print:bg-white print:text-black print:border-b-2 print:border-black">
            <div className="flex-1">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <User className="text-bianchi-blue print:text-black"/> 
                    {loading ? "Cargando..." : (data?.cliente || "Historial Cliente")}
                </h2>
                
                {!loading && data && (
                    <div className="mt-2 ml-9 space-y-1">
                        <p className="text-gray-400 text-sm print:text-black font-bold">DNI: {data.dni}</p>
                        
                        
                        <div className="flex items-center gap-2 text-sm text-gray-300 print:text-black">
                             <MapPin size={14} className="text-bianchi-blue print:text-black"/>
                             <span className="capitalize">
                                {data.direccion || "Sin dirección"}, {data.localidad || "Monteros"}
                             </span>
                        </div>
                        
                    </div>
                )}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-2 no-print">
                <button 
                    onClick={handlePrint} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition font-bold"
                    disabled={loading || error}
                >
                    <Printer size={18}/> Imprimir
                </button>
                <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition text-white">
                    <X/>
                </button>
            </div>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 print:bg-white print:overflow-visible">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse no-print">
                    <Clock size={48} className="mb-4 text-gray-300"/>
                    <p>Analizando historial financiero...</p>
                </div>
            ) : error || !data ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 no-print">
                    <div className="bg-gray-200 p-4 rounded-full mb-4">
                        <User size={48} className="text-gray-400"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700">Sin historial registrado</h3>
                    <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">
                        Este cliente aún no tiene ventas registradas.
                    </p>
                    <button onClick={onClose} className="mt-6 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition">
                        Volver
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
                        {/* DEUDA */}
                        <div className={`p-5 rounded-xl border-l-4 shadow-sm bg-white print:border text-black ${data.deudaTotal > 0 ? 'border-red-500' : 'border-green-500'}`}>
                            <div className="text-xs font-bold text-gray-500 uppercase mb-1 print:text-black">Estado de Deuda</div>
                            <div className={`text-3xl font-black ${data.deudaTotal > 0 ? 'text-red-600' : 'text-green-600'} print:text-black`}>
                                ${(data.deudaTotal || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 mt-2 flex items-center print:text-black">
                                {data.deudaTotal > 0 ? <><AlertTriangle size={12} className="mr-1"/> Saldo Pendiente</> : <><CheckCircle size={12} className="mr-1"/> Al día</>}
                            </div>
                        </div>

                        {/* REPUTACIÓN */}
                        <div className="p-5 rounded-xl border-l-4 border-blue-500 shadow-sm bg-white print:border text-black">
                            <div className="text-xs font-bold text-gray-500 uppercase mb-1 print:text-black">Reputación</div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-gray-800 print:text-black">{data.vecesAtrasado || 0}</span>
                                <span className="text-sm text-gray-500 mb-1 print:text-black">Atrasos</span>
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 mt-3 rounded-full overflow-hidden print:border print:border-black">
                                <div className={`h-full ${data.vecesAtrasado === 0 ? 'bg-green-500 w-full' : (data.vecesAtrasado < 3 ? 'bg-yellow-500 w-1/2' : 'bg-red-500 w-1/5')} print:bg-black`}></div>
                            </div>
                        </div>

                        {/* VOLUMEN */}
                        <div className="p-5 rounded-xl border-l-4 border-purple-500 shadow-sm bg-white print:border text-black">
                            <div className="text-xs font-bold text-gray-500 uppercase mb-1 print:text-black">Volumen Histórico</div>
                            <div className="text-3xl font-black text-gray-800 print:text-black">${(data.totalGastado || 0).toLocaleString()}</div>
                            <div className="text-xs text-purple-600 mt-2 font-bold flex items-center print:text-black">
                                <ShoppingBag size={12} className="mr-1"/> {data.cantidadCompras || 0} Compras
                            </div>
                        </div>
                    </div>

                    {/* HISTORIAL TABLA */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-0">
                        <div className="px-6 py-4 border-b bg-gray-100 flex justify-between items-center print:bg-white print:border-black print:px-0">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 print:text-black"><Clock size={18}/> Últimos Movimientos</h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 border-b print:text-black print:border-black">
                                <tr>
                                    <th className="px-6 py-3 print:px-0">Fecha</th>
                                    <th className="px-6 py-3 print:px-0">Tipo</th>
                                    <th className="px-6 py-3 text-right print:px-0">Monto</th>
                                    <th className="px-6 py-3 text-center print:px-0">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y print:divide-black">
                                {data.ultimasVentas && data.ultimasVentas.length > 0 ? (
                                    data.ultimasVentas.map(v => (
                                        <tr key={v.id} className="hover:bg-blue-50 transition print:hover:bg-transparent">
                                            <td className="px-6 py-4 flex items-center gap-2 print:px-0">
                                                {new Date(v.fecha).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-700 print:px-0 print:text-black">{v.tipo}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-800 print:px-0 print:text-black">${v.total.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center print:px-0">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${v.estado === 'Pagado' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} print:bg-white print:text-black print:border-black`}>
                                                    {v.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center py-8 text-gray-400 italic">No hay compras recientes.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* FOOTER SOLO PARA IMPRESIÓN */}
                    <div className="hidden print:block mt-8 pt-8 border-t border-black text-center text-xs">
                        <p>Documento generado por Sistema Bianchi Latina - {new Date().toLocaleDateString()}</p>
                    </div>

                </div>
            )}
        </div>
      </div>
    </div>
  );
}
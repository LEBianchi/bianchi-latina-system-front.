import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Archive, ArrowDownCircle, PlusCircle, MinusCircle, User, DollarSign, CreditCard, Landmark, Banknote, Lock } from 'lucide-react'; // <--- AGREGUÉ 'Lock'
import { ChevronDown } from 'lucide-react';
import CierreCajaModal from '../components/CierreCajaModal';

export default function CajaPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [filtro, setFiltro] = useState('hoy'); 
  const [loading, setLoading] = useState(true);


  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoMov, setTipoMov] = useState('Egreso'); 

  
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  
  const [form, setForm] = useState({ concepto: '', monto: '', responsable: '', medioPago: 'Efectivo' });

  useEffect(() => {
    cargarCaja();
  }, [filtro]);

  const cargarCaja = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/caja/movimientos?periodo=${filtro}`); // Asegurate que la ruta coincida con tu back
      setMovimientos(res.data.movimientos);
      setSaldo(res.data.saldoTotal);
    } catch (error) {
      toast.error("Error cargando caja");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.concepto || !form.monto || !form.responsable) return toast.error("Completá todos los datos");

    try {
      await api.post('/caja', {
        tipo: tipoMov,
        concepto: form.concepto,
        monto: parseFloat(form.monto),
        responsable: form.responsable,
        medioPago: form.medioPago 
      });
      
      toast.success("Movimiento registrado");
      setModalAbierto(false);
      setForm({ concepto: '', monto: '', responsable: '', medioPago: 'Efectivo' }); 
      cargarCaja(); 
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  
  const totalEfectivo = movimientos
    .filter(m => m.tipo === 'Ingreso' && (m.medioPago === 'Efectivo' || !m.medioPago))
    .reduce((acc, m) => acc + m.monto, 0);

  const totalTransferencia = movimientos
    .filter(m => m.tipo === 'Ingreso' && m.medioPago === 'Transferencia')
    .reduce((acc, m) => acc + m.monto, 0);

  const totalTarjeta = movimientos
    .filter(m => m.tipo === 'Ingreso' && m.medioPago === 'Tarjeta')
    .reduce((acc, m) => acc + m.monto, 0);

  const totalEgresos = movimientos
    .filter(m => m.tipo === 'Egreso')
    .reduce((acc, m) => acc + m.monto, 0);

  const getIconoPago = (medio) => {
      switch(medio) {
          case 'Transferencia': return <Landmark size={16} className="text-purple-500"/>;
          case 'Tarjeta': return <CreditCard size={16} className="text-orange-500"/>;
          default: return <Banknote size={16} className="text-green-500"/>;
      }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Archive className="text-bianchi-blue"/> Control de Caja
          </h1>
          <p className="text-gray-500">Administración de ingresos y egresos</p>
        </div>
        
        <div className="flex gap-4 items-center">
            {/* BOTÓN PARA CERRAR CAJA */}
            <button 
                onClick={() => setModalCierreAbierto(true)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition transform hover:-translate-y-0.5"
            >
                <Lock size={18} className="text-yellow-400"/> Cerrar Caja
            </button>

            <div className={`px-8 py-3 rounded-xl shadow-lg text-white flex flex-col items-end ${saldo >= 0 ? 'bg-bianchi-blue' : 'bg-red-600'}`}>
                <span className="text-xs font-bold uppercase opacity-80">Saldo Total Neto</span>
                <span className="text-3xl font-black">${saldo.toLocaleString()}</span>
            </div>
        </div>
      </div>

      {/* TARJETAS DE TOTALES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="p-4 bg-white border border-green-100 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
            <span className="text-xs font-bold text-green-600 uppercase flex items-center gap-2"><Banknote size={14}/> Efectivo (Entrada)</span>
            <span className="text-2xl font-black text-gray-800 mt-1">${totalEfectivo.toLocaleString()}</span>
            <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
         </div>

         <div className="p-4 bg-white border border-purple-100 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
            <span className="text-xs font-bold text-purple-600 uppercase flex items-center gap-2"><Landmark size={14}/> Transferencias</span>
            <span className="text-2xl font-black text-gray-800 mt-1">${totalTransferencia.toLocaleString()}</span>
            <div className="absolute right-0 top-0 h-full w-1 bg-purple-500"></div>
         </div>

         <div className="p-4 bg-white border border-orange-100 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
            <span className="text-xs font-bold text-orange-600 uppercase flex items-center gap-2"><CreditCard size={14}/> Tarjetas</span>
            <span className="text-2xl font-black text-gray-800 mt-1">${totalTarjeta.toLocaleString()}</span>
            <div className="absolute right-0 top-0 h-full w-1 bg-orange-500"></div>
         </div>

         <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-red-700 uppercase flex items-center gap-2"><ArrowDownCircle size={14}/> Total Gastos</span>
                <span className="text-xl font-black text-red-700">${totalEgresos.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
                <button onClick={() => { setTipoMov('Ingreso'); setModalAbierto(true); }} className="flex-1 bg-white border border-green-200 text-green-700 py-1 rounded text-xs font-bold hover:bg-green-50">+ Ingreso</button>
                <button onClick={() => { setTipoMov('Egreso'); setModalAbierto(true); }} className="flex-1 bg-white border border-red-200 text-red-700 py-1 rounded text-xs font-bold hover:bg-red-50">- Gasto</button>
            </div>
         </div>
      </div>

      {/* LISTADO */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="flex gap-2">
                <button onClick={() => setFiltro('hoy')} className={`px-4 py-1 rounded-lg text-sm font-bold ${filtro === 'hoy' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border'}`}>Hoy</button>
                <button onClick={() => setFiltro('mes')} className={`px-4 py-1 rounded-lg text-sm font-bold ${filtro === 'mes' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border'}`}>Este Mes</button>
            </div>
            <div className="text-sm text-gray-400 italic">{movimientos.length} movimientos encontrados</div>
        </div>

        <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 sticky top-0 uppercase text-xs">
                    <tr>
                        <th className="p-4">Hora</th>
                        <th className="p-4">Concepto</th>
                        <th className="p-4">Medio</th>
                        <th className="p-4">Responsable</th>
                        <th className="p-4 text-center">Tipo</th>
                        <th className="p-4 text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="6" className="p-10 text-center">Cargando caja...</td></tr>
                    ) : (
                        movimientos.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 text-gray-500 font-mono">
                                    {new Date(m.fechaHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                    <span className="text-xs ml-2 text-gray-300">{new Date(m.fechaHora).toLocaleDateString()}</span>
                                </td>
                                <td className="p-4 font-medium text-gray-800">{m.concepto}</td>
                                <td className="p-4 text-gray-600 flex items-center gap-2">
                                    {getIconoPago(m.medioPago)} 
                                    <span>{m.medioPago || 'Efectivo'}</span>
                                </td>
                                <td className="p-4 text-gray-600">
                                    <div className="flex items-center gap-1"><User size={14} className="text-gray-400"/> {m.responsable || "Sistema"}</div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${m.tipo === 'Ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {m.tipo.toUpperCase()}
                                    </span>
                                </td>
                                <td className={`p-4 text-right font-bold text-lg ${m.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                    {m.tipo === 'Egreso' && "- "}${m.monto.toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODAL PARA NUEVO MOVIMIENTO MANUAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end md:items-center z-50 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className={`${tipoMov === 'Ingreso' ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'} p-5 text-white flex justify-between items-center shrink-0`}>
                    <div>
                        <h3 className="font-black text-xl tracking-tight">Registrar {tipoMov}</h3>
                        <p className="text-white/80 text-sm">Completa los datos del movimiento</p>
                    </div>
                    <button onClick={() => setModalAbierto(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors focus:outline-none">
                        <ArrowDownCircle size={24}/>
                    </button>
                </div>

                <form onSubmit={handleGuardar} className="p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-1">Responsable</label>
                        <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-bianchi-blue focus-within:border-transparent focus-within:bg-white transition-all duration-200 overflow-hidden group">
                            <div className="pl-4 text-gray-400 group-focus-within:text-bianchi-blue transition-colors">
                                <User size={20}/>
                            </div>
                            <input
                                autoFocus
                                required
                                type="text"
                                placeholder="Ej: Juan Pérez"
                                className="w-full py-3.5 px-3 bg-transparent outline-none placeholder-gray-400 text-gray-800 font-medium"
                                value={form.responsable}
                                onChange={e => setForm({...form, responsable: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-1">Concepto</label>
                        <input
                            required
                            type="text"
                            placeholder={tipoMov === 'Egreso' ? "Ej: Pago de servicios..." : "Ej: Ventas del día..."}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-bianchi-blue focus:border-transparent focus:bg-white outline-none transition-all duration-200 font-medium text-gray-800 placeholder-gray-400"
                            value={form.concepto}
                            onChange={e => setForm({...form, concepto: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                          <label className="block text-sm font-bold text-gray-700 ml-1">Medio de Pago</label>
                          <div className="relative">
                              <select
                                  className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-bianchi-blue focus:border-transparent focus:bg-white outline-none transition-all duration-200 appearance-none font-medium text-gray-700 cursor-pointer"
                                  value={form.medioPago}
                                  onChange={e => setForm({...form, medioPago: e.target.value})}
                              >
                                  <option value="Efectivo">💵 Efectivo</option>
                                  <option value="Transferencia">🏦 Transferencia</option>
                                  <option value="Tarjeta">💳 Tarjeta</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                  <ChevronDown size={20} />
                              </div>
                          </div>
                      </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-1">Monto Total</label>
                        <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-bianchi-blue focus-within:border-transparent focus-within:bg-white transition-all duration-200 overflow-hidden group">
                            <div className="pl-4 text-gray-400 group-focus-within:text-bianchi-blue transition-colors">
                                <DollarSign size={24}/>
                            </div>
                            <input
                                required
                                type="number"
                                placeholder="0.00"
                                className="w-full py-4 px-3 bg-transparent outline-none placeholder-gray-300 text-gray-800 font-black text-2xl"
                                value={form.monto}
                                onChange={e => setForm({...form, monto: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 ${tipoMov === 'Ingreso' ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'}`}>
                        CONFIRMAR OPERACIÓN
                    </button>
                </form>
            </div>
        </div>
      )}

        {/* MODAL DE CIERRE DE CAJA */}
      <CierreCajaModal 
          isOpen={modalCierreAbierto}
          onClose={() => setModalCierreAbierto(false)}
          onCierreExitoso={() => {
              
              setModalCierreAbierto(false); 
              cargarCaja(); 
              toast.success("¡Cierre completado y caja reiniciada!");
          }}
      />
    </div>
  );
}
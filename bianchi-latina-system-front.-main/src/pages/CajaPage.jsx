import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Archive, User, CreditCard, Landmark, Banknote, Lock, Plus, Minus, X, Save, UserCircle
} from 'lucide-react';
import CierreCajaModal from '../components/CierreCajaModal';

export default function CajaPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [filtro, setFiltro] = useState('hoy');
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [cajaA_Cerrar, setCajaA_Cerrar] = useState(1); // 1 o 2
  
  const [modalMovimiento, setModalMovimiento] = useState({
    abierto: false,
    tipo: 'Ingreso'
  });

  const [estadoCaja, setEstadoCaja] = useState({
    saldoSistemaEfectivo: 0,
    saldoSistemaTransferencia: 0,
    cantidadMovimientos: 0
  });

  useEffect(() => {
    cargarCaja();
    cargarEstadoCaja();
  }, [filtro]);

  const cargarCaja = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/caja/movimientos?periodo=${filtro}`);
      const movimientosData = Array.isArray(res.data?.movimientos) ? res.data.movimientos : [];
      setMovimientos(movimientosData);
      setSaldo(res.data?.saldoTotal ?? 0);
    } catch {
      toast.error("Error cargando caja");
      setMovimientos([]);
      setSaldo(0);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadoCaja = async () => {
    try {
      const res = await api.get('/caja/estado-actual');
      setEstadoCaja(res.data);
    } catch {
      setEstadoCaja({ saldoSistemaEfectivo: 0, saldoSistemaTransferencia: 0, cantidadMovimientos: 0 });
    }
  };

  const abrirModalMovimiento = (tipo) => {
    setModalMovimiento({ abierto: true, tipo });
  };

  const handleGuardarMovimiento = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const monto = parseFloat(formData.get('monto'));
    const concepto = formData.get('concepto');
    const responsable = formData.get('responsable');

    if (!responsable) return toast.error("Indicá quién es el responsable");
    if (!monto || monto <= 0) return toast.error("El monto debe ser mayor a 0");
    if (!concepto) return toast.error("Escribí un motivo");

    try {
      await api.post('/caja', {
        tipo: modalMovimiento.tipo,
        monto: monto,
        concepto: concepto,
        medioPago: 'Efectivo', 
        responsable: responsable
      });
      toast.success(`${modalMovimiento.tipo} registrado por ${responsable}`);
      setModalMovimiento({ ...modalMovimiento, abierto: false });
      cargarCaja();
      cargarEstadoCaja();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el movimiento");
    }
  };

  const abrirCierreCaja = (numeroCaja) => {
    setCajaA_Cerrar(numeroCaja);
    setModalCierreAbierto(true);
  };

  const lista = Array.isArray(movimientos) ? movimientos : [];
  const saldoTotalSistema = estadoCaja.saldoSistemaEfectivo + estadoCaja.saldoSistemaTransferencia;

  const getIconoPago = (medio) => {
    switch (medio) {
      case 'Transferencia': return <Landmark size={16} className="text-purple-500" />;
      case 'Tarjeta': return <CreditCard size={16} className="text-orange-500" />;
      default: return <Banknote size={16} className="text-green-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Archive className="text-bianchi-blue" /> Control de Caja
          </h1>
          <p className="text-gray-500">Administración de ingresos y egresos</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => abrirModalMovimiento('Ingreso')} className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-bold flex items-center gap-2 transition">
            <Plus size={18} /> Ingreso
          </button>
          <button onClick={() => abrirModalMovimiento('Egreso')} className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-bold flex items-center gap-2 transition">
            <Minus size={18} /> Retiro
          </button>

          <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>

          {/* 👇 ACÁ ESTÁN LOS DOS BOTONES SEPARADOS 👇 */}
          <div className="flex gap-2">
            <button
              disabled={estadoCaja.cantidadMovimientos === 0}
              onClick={() => abrirCierreCaja(1)}
              className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition
                ${estadoCaja.cantidadMovimientos === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              <Lock size={18} className="text-blue-200" /> Cierre Caja 1
            </button>
            <button
              disabled={estadoCaja.cantidadMovimientos === 0}
              onClick={() => abrirCierreCaja(2)}
              className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition
                ${estadoCaja.cantidadMovimientos === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
            >
              <Lock size={18} className="text-purple-200" /> Cierre Caja 2
            </button>
          </div>

          <div className={`px-6 py-2 rounded-xl shadow-lg text-white ${saldoTotalSistema >= 0 ? 'bg-bianchi-blue' : 'bg-red-600'}`}>
            <div className="text-[10px] font-bold uppercase opacity-80">Saldo Sistema</div>
            <div className="text-2xl font-black">${saldoTotalSistema.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex gap-2">
            <button onClick={() => setFiltro('hoy')} className={`px-4 py-1 rounded-lg text-sm font-bold ${filtro === 'hoy' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600'}`}>Hoy</button>
            <button onClick={() => setFiltro('mes')} className={`px-4 py-1 rounded-lg text-sm font-bold ${filtro === 'mes' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600'}`}>Este Mes</button>
          </div>
          <div className="text-sm text-gray-400 italic">{lista.length} movimientos</div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-xs uppercase sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left">Hora</th>
                <th className="p-4 text-left">Concepto</th>
                <th className="p-4 text-left">Medio</th>
                <th className="p-4 text-left">Responsable</th>
                <th className="p-4 text-center">Tipo</th>
                <th className="p-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-500">Cargando caja...</td></tr>
              ) : lista.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400">No hay movimientos registrados.</td></tr>
              ) : (
                lista.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono text-gray-500">{new Date(m.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4 font-medium text-gray-800">{m.concepto}</td>
                    <td className="p-4 flex items-center gap-2 text-gray-600">{getIconoPago(m.medioPago)} {m.medioPago || 'Efectivo'}</td>
                    <td className="p-4 text-gray-600"><span className="flex items-center gap-1"><User size={14} /> {m.responsable || 'Sistema'}</span></td>
                    <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${m.tipo === 'Ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.tipo}</span></td>
                    <td className={`p-4 text-right font-bold ${m.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>{m.tipo === 'Egreso' ? '-' : '+'}${m.monto?.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CierreCajaModal
        isOpen={modalCierreAbierto}
        numeroCaja={cajaA_Cerrar}
        onClose={() => setModalCierreAbierto(false)}
        onCierreExitoso={() => {
          setModalCierreAbierto(false);
          cargarCaja();
          cargarEstadoCaja();
          toast.success(`Caja ${cajaA_Cerrar} cerrada y registrada`);
        }}
      />

      {/* MODAL DE NUEVO MOVIMIENTO (Mantenido igual) */}
      {modalMovimiento.abierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className={`p-4 flex justify-between items-center text-white ${modalMovimiento.tipo === 'Ingreso' ? 'bg-green-600' : 'bg-red-600'}`}>
              <h3 className="font-bold text-lg flex items-center gap-2">{modalMovimiento.tipo === 'Ingreso' ? <Plus size={24}/> : <Minus size={24}/>} Registrar {modalMovimiento.tipo}</h3>
              <button onClick={() => setModalMovimiento({ ...modalMovimiento, abierto: false })} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleGuardarMovimiento} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Responsable</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><UserCircle size={20}/></span>
                  <input name="responsable" type="text" autoFocus className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none" placeholder="¿Quién sos?"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input name="monto" type="number" step="0.01" className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 outline-none font-bold text-lg" placeholder="0.00"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Motivo / Concepto</label>
                <input name="concepto" type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none" placeholder="Motivo..."/>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setModalMovimiento({ ...modalMovimiento, abierto: false })} className="flex-1 py-2 bg-gray-100 font-bold rounded-lg">Cancelar</button>
                <button type="submit" className={`flex-1 py-2 text-white font-bold rounded-lg flex justify-center items-center gap-2 ${modalMovimiento.tipo === 'Ingreso' ? 'bg-green-600' : 'bg-red-600'}`}><Save size={18} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import {
  X, Lock, CheckCircle, AlertTriangle, UserCircle, Store, Settings, Download
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CierreCajaModal({ isOpen, numeroCaja, onClose, onCierreExitoso }) {
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [responsable, setResponsable] = useState('');

  const [sistema, setSistema] = useState({
    caja1: { efectivo: 0, transferencia: 0 },
    caja2: { efectivo: 0, transferencia: 0 },
  });

  const [inputs, setInputs] = useState({
    efectivo1: '', transf1: '',
    efectivo2: '', transf2: ''
  });

  const [resultadoBackend, setResultadoBackend] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPaso(1);
      setResponsable('');
      setInputs({ efectivo1: '', transf1: '', efectivo2: '', transf2: '' });
      setResultadoBackend(null);
      cargarEstadoGlobal();
    }
  }, [isOpen, numeroCaja]);

  const cargarEstadoGlobal = async () => {
    try {
      const res = await api.get('/caja/estado-global');
      setSistema({
        caja1: { efectivo: Number(res.data.caja1.efectivo), transferencia: Number(res.data.caja1.transferencia) },
        caja2: { efectivo: Number(res.data.caja2.efectivo), transferencia: Number(res.data.caja2.transferencia) }
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar estado de cajas');
    }
  };

  // Solo nos importa calcular la diferencia de la caja que el usuario seleccionó
  const rEf1 = inputs.efectivo1 === '' ? 0 : Number(inputs.efectivo1);
  const rTr1 = inputs.transf1 === '' ? 0 : Number(inputs.transf1);
  const rEf2 = inputs.efectivo2 === '' ? 0 : Number(inputs.efectivo2);
  const rTr2 = inputs.transf2 === '' ? 0 : Number(inputs.transf2);

  const difEf1 = rEf1 - sistema.caja1.efectivo;
  const difTr1 = rTr1 - sistema.caja1.transferencia;
  const difEf2 = rEf2 - sistema.caja2.efectivo;
  const difTr2 = rTr2 - sistema.caja2.transferencia;

  // Si cerramos la 1, la diferencia total es solo de la 1.
  const difTotal = numeroCaja === 1 ? (difEf1 + difTr1) : (difEf2 + difTr2);
  const esPerfecto = difTotal === 0;

  const handleCerrar = async () => {
    if (!responsable.trim()) return toast.error('Falta el nombre del responsable');
    
    // Validación de inputs solo para la caja seleccionada
    if (numeroCaja === 1 && (inputs.efectivo1 === '' || inputs.transf1 === '')) {
      return toast.error('Completá Efectivo y Banco. Escribí 0 si no hay plata.');
    }
    if (numeroCaja === 2 && (inputs.efectivo2 === '' || inputs.transf2 === '')) {
      return toast.error('Completá Efectivo y Banco. Escribí 0 si no hay plata.');
    }

    if (Math.abs(difTotal) > 2000) {
      if (!window.confirm(`⚠️ Hay una diferencia de $${difTotal}. ¿Seguro que contaste bien?`)) return;
    }

    setLoading(true);
    try {
      // MAGIA NEGRA: Mandamos los datos reales del usuario para su caja,
      // y mandamos los datos perfectos del sistema para la caja que NO se está cerrando.
      const payload = {
        realEfectivoCaja1: numeroCaja === 1 ? rEf1 : sistema.caja1.efectivo,
        realTransfCaja1:   numeroCaja === 1 ? rTr1 : sistema.caja1.transferencia,
        realEfectivoCaja2: numeroCaja === 2 ? rEf2 : sistema.caja2.efectivo,
        realTransfCaja2:   numeroCaja === 2 ? rTr2 : sistema.caja2.transferencia,
        responsable: responsable + ` (Solo Caja ${numeroCaja})`
      };

      const res = await api.post('/caja/cerrar', payload);
      setResultadoBackend(res.data);
      setPaso(2);
      if (onCierreExitoso) onCierreExitoso();

    } catch (error) {
      console.error(error);
      toast.error('Error al cerrar caja');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPdf = async () => {
    if (!resultadoBackend?.id) return;
    const loadingToast = toast.loading("Descargando PDF...");
    try {
      const res = await api.get(`/caja/pdf/${resultadoBackend.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cierre_Caja${numeroCaja}_${resultadoBackend.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss(loadingToast);
      toast.success("PDF Descargado");
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Error al descargar PDF");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[95vh]">

        <div className={`p-5 flex justify-between items-center text-white ${paso === 1 ? (numeroCaja === 1 ? 'bg-blue-600' : 'bg-purple-600') : esPerfecto ? 'bg-green-600' : 'bg-orange-500'}`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {paso === 1 ? <Lock className="text-white" /> : <CheckCircle />}
            {paso === 1 ? `Cierre de Turno - CAJA ${numeroCaja}` : 'Cierre Finalizado'}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition"><X /></button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          {paso === 1 && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-1">Responsable del Turno</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><UserCircle size={24}/></span>
                  <input type="text" value={responsable} onChange={(e) => setResponsable(e.target.value)} autoFocus className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg" placeholder="Ingresá tu nombre..."/>
                </div>
              </div>

              {/* RENDERIZADO CONDICIONAL: Solo mostramos la caja elegida */}
              {numeroCaja === 1 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-t-blue-500">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Store size={20}/></div>
                    <div><h3 className="font-bold text-gray-800">CAJA 1</h3><p className="text-xs text-gray-500">Mostrador / Ventas</p></div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500">EFECTIVO (Sis: ${sistema.caja1.efectivo.toLocaleString()})</label>
                      <input type="number" value={inputs.efectivo1} onChange={e => setInputs({...inputs, efectivo1: e.target.value})} className={`w-full p-2 text-xl font-bold border rounded ${difEf1 !== 0 ? 'bg-orange-50 border-orange-300' : 'bg-gray-50'}`} placeholder="$0" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">BANCO (Sis: ${sistema.caja1.transferencia.toLocaleString()})</label>
                      <input type="number" value={inputs.transf1} onChange={e => setInputs({...inputs, transf1: e.target.value})} className={`w-full p-2 text-xl font-bold border rounded ${difTr1 !== 0 ? 'bg-orange-50 border-orange-300' : 'bg-gray-50'}`} placeholder="$0" />
                    </div>
                  </div>
                </div>
              )}

              {numeroCaja === 2 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-t-purple-500">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Settings size={20}/></div>
                    <div><h3 className="font-bold text-gray-800">CAJA 2</h3><p className="text-xs text-gray-500">Repuestos / Especias</p></div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500">EFECTIVO (Sis: ${sistema.caja2.efectivo.toLocaleString()})</label>
                      <input type="number" value={inputs.efectivo2} onChange={e => setInputs({...inputs, efectivo2: e.target.value})} className={`w-full p-2 text-xl font-bold border rounded ${difEf2 !== 0 ? 'bg-orange-50 border-orange-300' : 'bg-gray-50'}`} placeholder="$0" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">BANCO (Sis: ${sistema.caja2.transferencia.toLocaleString()})</label>
                      <input type="number" value={inputs.transf2} onChange={e => setInputs({...inputs, transf2: e.target.value})} className={`w-full p-2 text-xl font-bold border rounded ${difTr2 !== 0 ? 'bg-orange-50 border-orange-300' : 'bg-gray-50'}`} placeholder="$0" />
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-xl border flex justify-between items-center shadow-md ${esPerfecto ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                <div className="flex items-center gap-3">
                  {esPerfecto ? <CheckCircle size={32}/> : <AlertTriangle size={32}/>}
                  <div>
                    <h3 className="font-bold">{esPerfecto ? 'BALANCEADA' : 'DIFERENCIA DETECTADA'}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{difTotal > 0 ? '+' : ''}{difTotal.toLocaleString()}</p>
                </div>
              </div>

              <button onClick={handleCerrar} disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition shadow-lg">
                {loading ? 'Procesando...' : `CONFIRMAR CIERRE CAJA ${numeroCaja}`}
              </button>
            </div>
          )}

          {paso === 2 && resultadoBackend && (
            <div className="flex flex-col items-center justify-center h-full space-y-8 animate-scale-up">
              <div className="bg-green-100 p-6 rounded-full text-green-600"><CheckCircle size={80} /></div>
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-800">Caja {numeroCaja} Cerrada</h2>
                <p className="text-gray-500 mt-2">La caja individual se guardó correctamente.</p>
              </div>
              <div className="flex gap-4 w-full">
                <button onClick={onClose} className="flex-1 py-3 bg-gray-200 font-bold rounded-xl hover:bg-gray-300">Salir</button>
                <button onClick={handleDescargarPdf} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"><Download size={20}/> Descargar PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { X, Lock, Calculator, Landmark, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CierreCajaModal({ isOpen, onClose, onCierreExitoso }) {
  const [paso, setPaso] = useState(1);
  const [sistema, setSistema] = useState({ saldoSistemaEfectivo: 0, saldoSistemaTransferencia: 0, cantidadMovimientos: 0 });
  const [realEfectivo, setRealEfectivo] = useState('');
  const [realTransf, setRealTransf] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaso(1);
      setRealEfectivo('');
      setRealTransf('');
      setResultado(null);
      cargarEstado();
    }
  }, [isOpen]);

  const cargarEstado = async () => {
    try {
        const res = await api.get('/caja/estado-actual');
        setSistema(res.data);
    } catch { toast.error("Error al cargar datos"); }
  };

  const handleCerrar = async () => {
    if (realEfectivo === '' || realTransf === '') return toast.error("Completá ambos montos (o poné 0)");
    
    setLoading(true);
    try {
        const res = await api.post('/caja/cerrar', {
            saldoRealEfectivo: Number(realEfectivo),
            saldoRealTransferencia: Number(realTransf),
            responsable: "Admin"
        });
        setResultado(res.data);
        setPaso(2);
        if (onCierreExitoso) onCierreExitoso();
    } catch (e) { toast.error("Error al cerrar caja"); } 
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gray-900 p-5 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2"><Lock className="text-yellow-400"/> Arqueo General</h2>
          <button onClick={onClose}><X/></button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto">
           {paso === 1 ? (
             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* COLUMNA EFECTIVO */}
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase">Sistema espera (Efectivo)</p>
                            <p className="text-3xl font-black text-green-700">${sistema.saldoSistemaEfectivo.toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                                <Calculator size={16}/> Efectivo Real
                            </label>
                            <input type="number" autoFocus className="w-full p-3 text-xl font-bold border-2 border-gray-300 rounded-xl text-center focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none" 
                                placeholder="$0" value={realEfectivo} onChange={e=>setRealEfectivo(e.target.value)} />
                        </div>
                    </div>

                    {/* COLUMNA TRANSFERENCIAS */}
                    <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase">Sistema espera (Bancos)</p>
                            <p className="text-3xl font-black text-purple-700">${sistema.saldoSistemaTransferencia.toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                                <Landmark size={16}/> Saldo en Cuentas
                            </label>
                            <input type="number" className="w-full p-3 text-xl font-bold border-2 border-gray-300 rounded-xl text-center focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none" 
                                placeholder="$0" value={realTransf} onChange={e=>setRealTransf(e.target.value)} />
                            <p className="text-[10px] text-gray-400 text-center mt-1">Revisá Homebanking / MP</p>
                        </div>
                    </div>
                </div>

                <button onClick={handleCerrar} disabled={loading} className="w-full bg-bianchi-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition shadow-lg">
                    {loading ? "Procesando..." : "Confirmar Cierre Total"}
                </button>
             </div>
           ) : (
             
             <div className="text-center space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <ResultCard titulo="Efectivo" diff={resultado.diferenciaEfectivo} />
                    <ResultCard titulo="Cuentas" diff={resultado.diferenciaTransferencia} />
                </div>
                
                {resultado.diferenciaTotal === 0 ? (
                    <div className="bg-green-100 text-green-800 p-4 rounded-xl font-bold flex items-center justify-center gap-2">
                        <CheckCircle/> ¡Cierre Perfecto!
                    </div>
                ) : (
                    <div className="bg-red-100 text-red-800 p-4 rounded-xl font-bold flex items-center justify-center gap-2">
                        <AlertTriangle/> Diferencia Total: ${resultado.diferenciaTotal.toLocaleString()}
                    </div>
                )}

                <button onClick={onClose} className="w-full bg-gray-100 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-200">Cerrar</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}


function ResultCard({ titulo, diff }) {
    const color = diff === 0 ? 'text-green-600' : (diff > 0 ? 'text-blue-600' : 'text-red-600');
    return (
        <div className="bg-gray-50 p-4 rounded-xl border">
            <p className="text-xs font-bold uppercase text-gray-500">{titulo}</p>
            <p className={`text-xl font-black ${color}`}>
                {diff > 0 ? '+' : ''}{diff.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400">{diff === 0 ? 'OK' : (diff > 0 ? 'Sobrante' : 'Faltante')}</p>
        </div>
    );
}
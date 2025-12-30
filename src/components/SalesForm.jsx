import { useState } from 'react';
import { User, CheckCircle, AlertTriangle, Zap, Contact, CreditCard, Landmark, Banknote } from 'lucide-react';

export default function SalesForm({ clientes, totalLista, onSubmit }) {
  const [clienteId, setClienteId] = useState("");
  
  
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); 
  
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [responsable, setResponsable] = useState(""); 
  
  const [descuentoPorc, setDescuentoPorc] = useState(0);
  const [entregaInicial, setEntregaInicial] = useState(0);
  const [cantCuotas, setCantCuotas] = useState(1);
  const [montoCuota, setMontoCuota] = useState(0);
  const [diaCobro, setDiaCobro] = useState(5);

  
  const esVentaContado = metodoPago !== "Cuotas";

  const totalEfectivo = totalLista - (totalLista * (descuentoPorc / 100));
  const totalFinanciado = parseFloat(entregaInicial || 0) + (parseFloat(montoCuota || 0) * parseInt(cantCuotas || 0));
  const esPrecioValido = esVentaContado ? true : totalFinanciado >= totalLista;

  
  const handleClienteChange = (e) => {
      const id = e.target.value;
      setClienteId(id);
      
      
      const cliente = clientes.find(c => c.id === parseInt(id));
      setClienteSeleccionado(cliente);
  };

  const seleccionarAnonimo = () => {
    const anonimo = clientes.find(c => c.dni === "0000");
    if (anonimo) {
      setClienteId(anonimo.id);
      setClienteSeleccionado(anonimo);
      setMetodoPago("Efectivo");
      setDescuentoPorc(0);
    } else {
      alert("⚠️ Creá primero el cliente 'CONSUMIDOR FINAL' (DNI 0000)");
    }
  };

  const handleSubmit = () => {
    if (!clienteId) return alert("Seleccioná un cliente");

    if (metodoPago === "Cuotas" && !esPrecioValido) return alert("El precio financiado es muy bajo.");

    const ventaData = {
      clienteId: parseInt(clienteId),
      responsable: responsable.trim() || "Mostrador", 
      metodoPago, 
      porcentajeDescuento: parseFloat(descuentoPorc),
      entregaInicial: parseFloat(entregaInicial),
      cantidadCuotas: parseInt(cantCuotas),
      montoCuotaManual: parseFloat(montoCuota),
      diaDeCobroPreferido: parseInt(diaCobro)
    };
    
    onSubmit(ventaData);
  };

  const getBtnClass = (tipo) => `flex-1 py-2 rounded-lg font-bold border transition-all flex items-center justify-center gap-2 text-xs md:text-sm ${metodoPago === tipo ? 'bg-bianchi-blue text-white border-blue-600 shadow-md transform scale-105' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-gray-200'}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full flex flex-col">
      <h2 className="text-xl font-bold text-bianchi-blue mb-6 flex items-center">
        <CheckCircle className="mr-2"/> Finalizar Venta
      </h2>

      {/* VENDEDOR */}
      <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <label className="text-sm font-bold text-gray-700 mb-1 block">Vendedor</label>
        <div className="relative">
          <Contact className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Opcional (Por defecto: Mostrador)" 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bianchi-blue outline-none font-bold text-gray-700 placeholder-gray-400"
            value={responsable} onChange={e => setResponsable(e.target.value)}
          />
        </div>
      </div>

      {/* CLIENTE CON ALERTA */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-bold text-gray-700">Cliente</label>
            <button onClick={seleccionarAnonimo} className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded flex items-center transition border border-orange-200" title="DNI 0000">
                <Zap size={12} className="mr-1 fill-orange-500"/> Consumidor Final
            </button>
        </div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${clienteSeleccionado?.deuda > 0 ? 'border-red-300 focus:ring-red-500 bg-red-50 text-red-900 font-bold' : 'border-gray-300 focus:ring-bianchi-blue'}`} 
            value={clienteId} 
            onChange={handleClienteChange}
          >
            <option value="">Seleccionar Cliente...</option>
            {clientes.map(c => (
                <option key={c.id} value={c.id}>
                    {c.nombre} {c.dni} {c.deuda > 0 ? `(Debe: $${c.deuda.toLocaleString()})` : ''}
                </option>
            ))}
          </select>
        </div>

        {/* ALERTA VISUAL DE DEUDA */}
        {clienteSeleccionado && clienteSeleccionado.deuda > 0 && (
            <div className="mt-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded flex items-start animate-pulse">
                <AlertTriangle className="shrink-0 mr-2" size={20}/>
                <div>
                    <p className="font-bold text-sm">¡CLIENTE MOROSO!</p>
                    <p className="text-xs">
                        Este cliente tiene una deuda pendiente de <span className="font-black text-lg">${clienteSeleccionado.deuda.toLocaleString()}</span>.
                        <br/>Revisá su estado de cuenta antes de venderle fiado.
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* MEDIOS DE PAGO */}
      <div className="mb-6">
        <label className="text-sm font-bold text-gray-700 mb-2 block">Medio de Pago</label>
        <div className="grid grid-cols-2 gap-2 mb-2">
            <button onClick={() => setMetodoPago("Efectivo")} className={getBtnClass("Efectivo")}>
                <Banknote size={16}/> Efectivo
            </button>
            <button onClick={() => setMetodoPago("Transferencia")} className={getBtnClass("Transferencia")}>
                <Landmark size={16}/> Transf.
            </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMetodoPago("Tarjeta")} className={getBtnClass("Tarjeta")}>
                <CreditCard size={16}/> Tarjeta
            </button>
            <button onClick={() => setMetodoPago("Cuotas")} className={getBtnClass("Cuotas")}>
                <span className="font-black">CUOTAS</span>
            </button>
        </div>
      </div>

      {/* DETALLES DE PAGO */}
      <div className="flex-1 overflow-y-auto pr-1">
        {esVentaContado ? (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in-up">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                {metodoPago === 'Efectivo' ? 'Descuento (%)' : 'Recargo / Descuento (%)'}
            </label>
            <input type="number" className="w-full p-2 border rounded mb-3 focus:outline-none focus:border-blue-500" 
                placeholder="0" value={descuentoPorc} onChange={e => setDescuentoPorc(e.target.value)}/>
            
            <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between"><span>Subtotal:</span> <span>${totalLista.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold"><span>Ajuste:</span> <span>-${(totalLista * (descuentoPorc/100)).toLocaleString()}</span></div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-800">Total {metodoPago}:</span>
              <span className="text-2xl font-black text-bianchi-blue">${totalEfectivo.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          /* PANTALLA DE CUOTAS */
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3 animate-fade-in-up">
            <div>
              <label className="text-xs font-bold text-blue-800 block mb-1">Anticipo</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" className="w-full pl-6 p-2 border rounded text-sm focus:outline-none focus:border-blue-500" value={entregaInicial} onChange={e => setEntregaInicial(e.target.value)}/></div>
            </div>
            <div className="flex gap-2">
               <div className="w-1/2">
                  <label className="text-xs font-bold text-blue-800 block mb-1">Valor Cuota</label>
                  <div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" className="w-full pl-5 p-2 border rounded text-sm font-bold focus:outline-none focus:border-blue-500" value={montoCuota} onChange={e => setMontoCuota(e.target.value)}/></div>
               </div>
               <div className="w-1/2"><label className="text-xs font-bold text-blue-800 block mb-1">Cant. Semanas</label><input type="number" className="w-full p-2 border rounded text-sm focus:outline-none focus:border-blue-500" value={cantCuotas} onChange={e => setCantCuotas(e.target.value)}/></div>
            </div>
            <div>
              <label className="text-xs font-bold text-blue-800 block mb-1">Día de Cobro</label>
              <select className="w-full p-2 border rounded text-sm bg-white focus:outline-none focus:border-blue-500" value={diaCobro} onChange={e => setDiaCobro(e.target.value)}>
                <option value="1">Lunes</option><option value="2">Martes</option><option value="3">Miércoles</option><option value="4">Jueves</option><option value="5">Viernes</option><option value="6">Sábado</option>
              </select>
            </div>
            <div className={`mt-2 p-3 rounded text-center border transition-colors ${esPrecioValido ? 'bg-white border-blue-200' : 'bg-red-50 border-red-300'}`}>
              <div className="text-sm text-gray-600">Total Financiado</div>
              <div className={`text-xl font-black ${esPrecioValido ? 'text-blue-700' : 'text-red-600'}`}>${totalFinanciado.toLocaleString()}</div>
              {!esPrecioValido && <div className="text-xs text-red-600 flex items-center justify-center mt-2 font-bold animate-pulse"><AlertTriangle size={14} className="mr-1"/> Pierdes plata</div>}
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSubmit} disabled={!clienteId || (!esVentaContado && !esPrecioValido) || totalLista === 0} className="mt-6 bg-bianchi-red hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-colors w-full uppercase tracking-wider text-lg">
        CONFIRMAR VENTA
      </button>
    </div>
  );
}
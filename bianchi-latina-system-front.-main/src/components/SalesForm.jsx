import { useState } from 'react';
import { User, CheckCircle, AlertTriangle, Zap, Contact, CreditCard, Landmark, Banknote, ShieldAlert, Search } from 'lucide-react';

export default function SalesForm({ clientes, totalLista, onSubmit }) {
  // --- ESTADOS ORIGINALES ---
  const [clienteId, setClienteId] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); 
  
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [responsable, setResponsable] = useState(""); 
  
  const [descuentoPorc, setDescuentoPorc] = useState(0);
  const [entregaInicial, setEntregaInicial] = useState(0);
  const [cantCuotas, setCantCuotas] = useState(1);
  const [montoCuota, setMontoCuota] = useState(0);
  const [diaCobro, setDiaCobro] = useState(5);
  const [medioPagoEntrega, setMedioPagoEntrega] = useState('Efectivo');
  const [interesSemanal, setInteresSemanal] = useState(0);

  // --- NUEVOS ESTADOS PARA EL BUSCADOR INTELIGENTE ---
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  // Cálculos de la venta
  const esVentaContado = metodoPago !== "Cuotas";
  const totalEfectivo = totalLista - (totalLista * (descuentoPorc / 100));
  const totalFinanciado = parseFloat(entregaInicial || 0) + (parseFloat(montoCuota || 0) * parseInt(cantCuotas || 0));
  const esPrecioValido = esVentaContado ? true : totalFinanciado >= totalLista;

  // Alertas
  const tieneDeuda = clienteSeleccionado?.deuda > 0;
  const atrasosHistoricos = clienteSeleccionado?.historialAtrasos || 0;
  const esRiesgoso = atrasosHistoricos >= 5;

  // --- LÓGICA DEL BUSCADOR ---
  const clientesFiltrados = clientes.filter(c => 
    (c.nombre || "").toLowerCase().includes(busquedaCliente.toLowerCase()) || 
    (c.dni || "").includes(busquedaCliente)
  );

  const handleSeleccionarCliente = (cliente) => {
    setClienteId(cliente.id);
    setClienteSeleccionado(cliente);
    // Ponemos el nombre y DNI en el input para que quede prolijo
    setBusquedaCliente(`${cliente.nombre} - DNI: ${cliente.dni}`);
    setMostrarDropdown(false);
  };

  const handleInputBusqueda = (e) => {
    setBusquedaCliente(e.target.value);
    setMostrarDropdown(true);
    // Si empieza a borrar/escribir de nuevo, deseleccionamos al cliente actual
    if (clienteId) {
        setClienteId("");
        setClienteSeleccionado(null);
    }
  };

  const seleccionarAnonimo = () => {
    const anonimo = clientes.find(c => c.dni === "0000");
    if (anonimo) {
      handleSeleccionarCliente(anonimo);
      setMetodoPago("Efectivo");
      setDescuentoPorc(0);
    } else {
      alert("⚠️ Creá primero el cliente 'CONSUMIDOR FINAL' (DNI 0000)");
    }
  };

  const handleSubmit = () => {
    if (!clienteId) return alert("Seleccioná un cliente válido de la lista.");
    if (tieneDeuda) return alert("El cliente tiene deudas activas. Venta bloqueada.");
    if (metodoPago === "Cuotas" && !esPrecioValido) return alert("El precio financiado es muy bajo.");

    const ventaData = {
      clienteId: parseInt(clienteId),
      responsable: responsable.trim() || "Mostrador", 
      metodoPago, 
      porcentajeDescuento: parseFloat(descuentoPorc) || 0,
      entregaInicial: parseFloat(entregaInicial) || 0,
      medioPagoEntrega: medioPagoEntrega, 
      cantidadCuotas: parseInt(cantCuotas) || 1,
      montoCuotaManual: parseFloat(montoCuota) || 0,
      diaDeCobroPreferido: parseInt(diaCobro) || 5,
      interesSemanal: parseFloat(interesSemanal) || 0 
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

      {/* CLIENTE CON BUSCADOR Y ALERTAS */}
      <div className="mb-6 relative">
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-bold text-gray-700">Cliente</label>
            <button onClick={seleccionarAnonimo} className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded flex items-center transition border border-orange-200" title="DNI 0000">
                <Zap size={12} className="mr-1 fill-orange-500"/> Consumidor Final
            </button>
        </div>
        
        {/* BUSCADOR INTELIGENTE */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por Nombre o DNI..."
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors shadow-sm ${tieneDeuda ? 'border-red-500 focus:ring-red-600 bg-red-50 text-red-900 font-bold' : esRiesgoso ? 'border-orange-400 bg-orange-50 text-orange-900 font-bold' : 'border-gray-300 focus:ring-bianchi-blue font-bold text-gray-800'}`}
            value={busquedaCliente}
            onChange={handleInputBusqueda}
            onFocus={() => setMostrarDropdown(true)}
            // El setTimeout evita que se cierre el menú antes de registrar el clic en la opción
            onBlur={() => setTimeout(() => setMostrarDropdown(false), 200)}
          />

          {/* MENÚ DESPLEGABLE FLOTANTE */}
          {mostrarDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map(c => (
                  <div 
                    key={c.id} 
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between items-center transition-colors"
                    onClick={() => handleSeleccionarCliente(c)}
                  >
                    <div>
                      <div className="font-bold text-gray-800">{c.nombre}</div>
                      <div className="text-gray-500 text-xs mt-0.5">DNI: {c.dni}</div>
                    </div>
                    {/* Alerta rápida en la lista si el cliente debe plata */}
                    {c.deuda > 0 && (
                        <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-1 rounded border border-red-200">
                            DEBE: ${c.deuda.toLocaleString()}
                        </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-4 text-gray-500 text-sm text-center italic">
                  No se encontraron clientes...
                </div>
              )}
            </div>
          )}
        </div>

        {/* 🛑 ALERTA 1: VENTA BLOQUEADA (Deuda Activa) */}
        {tieneDeuda && (
            <div className="mt-3 bg-red-100 border-l-4 border-red-600 text-red-800 p-3 rounded flex items-start shadow-inner animate-fade-in-up">
                <ShieldAlert className="shrink-0 mr-2 text-red-600" size={24}/>
                <div>
                    <p className="font-black text-sm uppercase">¡Venta Bloqueada!</p>
                    <p className="text-xs mt-1">
                        Este cliente tiene una deuda pendiente de <span className="font-black text-sm">${clienteSeleccionado.deuda.toLocaleString()}</span>. No puede realizar nuevas compras hasta regularizar.
                    </p>
                </div>
            </div>
        )}

        {/* ⚠️ ALERTA 2: CLIENTE RIESGOSO (Historial de Atrasos) */}
        {!tieneDeuda && esRiesgoso && (
            <div className="mt-3 bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-3 rounded flex items-start animate-pulse shadow-inner animate-fade-in-up">
                <AlertTriangle className="shrink-0 mr-2 text-orange-600" size={24}/>
                <div>
                    <p className="font-black text-sm uppercase">Cliente Potencialmente Riesgoso</p>
                    <p className="text-xs mt-1">
                        Actualmente está al día, pero su historial registra <span className="font-black">{atrasosHistoricos} cuotas</span> pagadas fuera de término. Precaución al financiar.
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* MEDIOS DE PAGO */}
      <div className={`mb-6 ${tieneDeuda ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
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
      <div className={`flex-1 overflow-y-auto pr-1 ${tieneDeuda ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input type="number" className="w-full pl-6 p-2 border rounded text-sm focus:outline-none focus:border-blue-500" value={entregaInicial} onChange={e => setEntregaInicial(e.target.value)}/>
              </div>
            </div>

            {entregaInicial > 0 && (
              <div className="mt-2">
                <label className="text-xs font-bold text-blue-800 uppercase block mb-1">Medio de Pago (Anticipo)</label>
                <select 
                  value={medioPagoEntrega}
                  onChange={(e) => setMedioPagoEntrega(e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-700 bg-white cursor-pointer"
                >
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Transferencia">📱 Transferencia / Banco</option>
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-1">
               <div className="w-1/2">
                  <label className="text-xs font-bold text-blue-800 block mb-1">Valor Cuota</label>
                  <div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" className="w-full pl-5 p-2 border rounded text-sm font-bold focus:outline-none focus:border-blue-500" value={montoCuota} onChange={e => setMontoCuota(e.target.value)}/></div>
               </div>
               <div className="w-1/2">
                  <label className="text-xs font-bold text-blue-800 block mb-1">Cant. Semanas</label>
                  <input type="number" className="w-full p-2 border rounded text-sm focus:outline-none focus:border-blue-500" value={cantCuotas} onChange={e => setCantCuotas(e.target.value)}/>
               </div>
            </div>
            
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="text-xs font-bold text-blue-800 block mb-1">Día de Cobro</label>
                <select className="w-full p-2 border rounded text-sm bg-white focus:outline-none focus:border-blue-500" value={diaCobro} onChange={e => setDiaCobro(e.target.value)}>
                  <option value="1">Lunes</option><option value="2">Martes</option><option value="3">Miércoles</option><option value="4">Jueves</option><option value="5">Viernes</option><option value="6">Sábado</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="text-xs font-bold text-blue-800 block mb-1" title="Se aplica por cada semana extra de atraso (desde el día 7)">Interés Mora (Sem.)</label>
                <div className="relative">
                  <input type="number" step="0.1" className="w-full p-2 pr-6 border rounded text-sm bg-white focus:outline-none focus:border-blue-500" value={interesSemanal} onChange={e => setInteresSemanal(e.target.value)} placeholder="0"/>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>

            <div className={`mt-2 p-3 rounded text-center border transition-colors ${esPrecioValido ? 'bg-white border-blue-200' : 'bg-red-50 border-red-300'}`}>
              <div className="text-sm text-gray-600">Total Financiado</div>
              <div className={`text-xl font-black ${esPrecioValido ? 'text-blue-700' : 'text-red-600'}`}>${totalFinanciado.toLocaleString()}</div>
              {!esPrecioValido && <div className="text-xs text-red-600 flex items-center justify-center mt-2 font-bold animate-pulse"><AlertTriangle size={14} className="mr-1"/> Pierdes plata</div>}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={!clienteId || tieneDeuda || (!esVentaContado && !esPrecioValido) || totalLista === 0} 
        className={`mt-6 font-bold py-4 rounded-xl shadow-lg transition-colors w-full uppercase tracking-wider text-lg ${tieneDeuda ? 'bg-red-200 text-red-400 cursor-not-allowed' : 'bg-bianchi-red hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'}`}
      >
        {tieneDeuda ? 'CLIENTE BLOQUEADO' : 'CONFIRMAR VENTA'}
      </button>
    </div>
  );
}
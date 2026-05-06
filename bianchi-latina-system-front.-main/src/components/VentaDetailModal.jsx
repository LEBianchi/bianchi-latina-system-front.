import { useState, useEffect } from "react";
import { X, DollarSign, Calendar, User, CreditCard, ShoppingBag, Printer, MapPin } from "lucide-react";
import PagarCuotaModal from "./PagarCuotaModal";

const VentaDetailModal = ({ isOpen, venta, onClose, onUpdate }) => {
  const [mostrarPagarCuota, setMostrarPagarCuota] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);

  useEffect(() => {
    if (isOpen && venta) {
      console.log("✅ MODAL ABIERTO CON:", venta);
    }
  }, [isOpen, venta]);

  if (!isOpen || !venta) return null;

  /* =========================================================
     DATOS NORMALIZADOS
     ========================================================= */
  const nombreCliente = venta.cabecera?.clienteNombre || venta.cliente?.nombre || venta.cliente || "Consumidor Final";
  const dniCliente = venta.cabecera?.clienteDni || venta.cliente?.dni || "S/D";
  
  // ACÁ AGREGAMOS LA DIRECCIÓN (Según tu consola viene en clienteDir)
  const direccionCliente = venta.cabecera?.clienteDir || venta.cliente?.direccion || "Dirección no registrada";
  
  const total = venta.cabecera?.totalVenta ?? venta.total ?? 0;
  const fechaRaw = venta.cabecera?.fecha || venta.fecha;
  const fecha = fechaRaw ? new Date(fechaRaw).toLocaleDateString() : "-";
  
  // Rescatamos el porcentaje de interés para imprimirlo
  const interesSemanal = venta.cabecera?.interesSemanal || 0;

  const cuotas = venta.planCuotas || venta.listaCuotas || venta.cuotas || [];
  const productos = venta.items || venta.detallesVenta || [];

  /* =========================================================
     🖨️ FUNCIÓN DE IMPRESIÓN MEJORADA (AHORA CON CLÁUSULA)
     ========================================================= */
  const handleImprimir = () => {
    const pagado = cuotas.reduce((acc, c) => acc + (c.montoPagado || 0), 0);
    const restante = total - pagado;

    const ventana = window.open('', 'PRINT', 'height=800,width=1000');

    ventana.document.write(`
      <html>
        <head>
          <title>Estado de Cuenta - ${nombreCliente}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            
            /* LOGO EN BLANCO Y NEGRO */
            .logo-img { 
              height: 80px; 
              display: block; 
              margin: 0 auto 10px auto; 
              filter: grayscale(100%); 
            }

            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .empresa { font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .subtitulo { font-size: 14px; color: #666; margin-top: 5px; }
            
            .info-box { display: flex; justify-content: space-between; margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
            .col { width: 48%; }
            .label { font-weight: bold; font-size: 11px; color: #666; text-transform: uppercase; margin-top: 8px; }
            .val { font-size: 15px; margin-bottom: 5px; font-weight: 500; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            th { background-color: #f3f4f6; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            
            .badge-pagado { color: #000; font-weight: bold; border: 1px solid #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
            .badge-pendiente { color: #666; font-weight: normal; font-style: italic; }
            .recargo-text { color: #d97706; font-size: 10px; font-weight: bold; display: block; }

            .totales { float: right; width: 300px; margin-bottom: 40px; border: 1px solid #000; padding: 15px; }
            .fila-total { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
            .gran-total { font-weight: bold; font-size: 18px; border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }

            .clausula { clear: both; margin-top: 20px; border: 1px dashed #d97706; padding: 12px; color: #b45309; font-size: 12px; font-weight: bold; text-align: center; background-color: #fef3c7; border-radius: 4px;}

            .footer-firmas { display: flex; justify-content: space-between; margin-top: 100px; padding-top: 20px; }
            .firma-box { width: 40%; text-align: center; border-top: 1px solid #000; padding-top: 10px; font-weight: bold; font-size: 14px; }
            
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
              .clausula { -webkit-print-color-adjust: exact; color-adjust: exact; background-color: #fef3c7 !important; }
            }
          </style>
        </head>
        <body>
          
          <div class="header">
            <img src="/logo-bianchi.png" class="logo-img" alt="Logo" onerror="this.style.display='none'"/> 
            
            <div class="empresa">Bianchi Latina System</div>
            <div class="subtitulo">Estado de Cuenta y Plan de Pagos</div>
            <div class="subtitulo">Emisión: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="info-box">
            <div class="col">
              <div class="label">Cliente</div>
              <div class="val" style="font-size: 18px; font-weight: bold;">${nombreCliente}</div>
              
              <div class="label">DNI: </div>
              <div class="val">${dniCliente}</div>

              <div class="label">Dirección</div>
              <div class="val">${direccionCliente}</div>
            </div>

            <div class="col text-right">
              <div class="label">Venta Nro.</div>
              <div class="val" style="font-size: 18px;">#${venta.cabecera?.id || venta.id}</div>
              
              <div class="label">Fecha de Venta</div>
              <div class="val">${fecha}</div>
            </div>
          </div>

          <h3>Detalle de Cuotas</h3>
          <table>
            <thead>
              <tr>
                <th>Cuota #</th>
                <th>Vencimiento</th>
                <th class="text-right">Importe</th>
                <th class="text-right">Abonado</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${cuotas.map(c => `
                <tr>
                  <td>${c.numeroCuota}</td>
                  <td>${new Date(c.fechaVencimiento).toLocaleDateString()}</td>
                  <td class="text-right">
                    $${(c.montoCuota || c.montoBase || 0).toLocaleString()}
                    ${c.recargo > 0 ? `<span class="recargo-text">+ $${c.recargo.toLocaleString()} int.</span>` : ''}
                  </td>
                  <td class="text-right">$${(c.montoPagado || 0).toLocaleString()}</td>
                  <td class="text-center">
                    <span class="${c.montoPagado >= (c.montoCuota || c.montoBase) ? 'badge-pagado' : 'badge-pendiente'}">
                      ${c.montoPagado >= (c.montoCuota || c.montoBase) ? 'PAGADO' : 'PENDIENTE'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totales">
            <div class="fila-total">
              <span>Total Operación:</span>
              <span>$${total.toLocaleString()}</span>
            </div>
            <div class="fila-total">
              <span>Total Abonado:</span>
              <span>$${pagado.toLocaleString()}</span>
            </div>
            <div class="fila-total gran-total">
              <span>Saldo Pendiente:</span>
              <span>$${restante.toLocaleString()}</span>
            </div>
          </div>
          
          <div style="clear: both;"></div>

          ${interesSemanal > 0 ? `
            <div class="clausula">
              ⚠️ CONDICIÓN DE MORA: Se aplicará un recargo del ${interesSemanal}% semanal sobre el valor de cada cuota luego de 7 días de atraso.
            </div>
          ` : ''}

          <div class="footer-firmas">
            <div class="firma-box">
              Firma del Cliente
              <br>
              <span style="font-weight: normal; font-size: 11px;">Acepto conformidad de la deuda</span>
            </div>
            <div class="firma-box">
              Firma Responsable
              <br>
              <span style="font-weight: normal; font-size: 11px;">Bianchi Latina System</span>
            </div>
          </div>

        </body>
      </html>
    `);

    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 500);
  };

  /* ========================================================= */

  const abrirPagarCuota = (cuota) => {
    setCuotaSeleccionada(cuota);
    setMostrarPagarCuota(true);
  };

  const cerrarPagarCuota = () => {
    setCuotaSeleccionada(null);
    setMostrarPagarCuota(false);
  };

  const handleRecarga = () => {
    if (onUpdate) onUpdate();
    cerrarPagarCuota();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard size={24} className="text-blue-400"/> 
              Venta #{venta.cabecera?.id || venta.id}
            </h2>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleImprimir}
              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition flex items-center gap-2 px-4 shadow-lg"
              title="Imprimir Estado de Cuenta"
            >
              <Printer size={20} />
              <span className="text-sm font-bold hidden md:inline">Imprimir</span>
            </button>

            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-500 uppercase font-bold flex items-center gap-1">
                <User size={12}/> Cliente
              </p>
              <p className="text-lg font-bold text-gray-800">{nombreCliente}</p>
              <div className="flex items-start gap-1 mt-1">
                 <MapPin size={12} className="text-gray-400 mt-0.5" />
                 <p className="text-xs text-gray-500">{direccionCliente}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-xs text-green-600 uppercase font-bold flex items-center gap-1">
                 <DollarSign size={12}/> Total
              </p>
              <p className="text-2xl font-black text-green-700">${total.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1">
                <Calendar size={12}/> Fecha
              </p>
              <p className="text-lg font-bold text-gray-800">{fecha}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
               <h3 className="text-sm font-bold uppercase text-gray-500 mb-3 flex items-center gap-2">
                 <ShoppingBag size={16}/> Productos
               </h3>
               <div className="bg-gray-50 rounded-xl border overflow-hidden">
                 <table className="w-full text-sm">
                   <tbody className="divide-y">
                     {productos.length === 0 ? (
                       <tr><td className="p-4 text-center text-gray-400">Sin detalles</td></tr>
                     ) : (
                       productos.map((p, i) => (
                         <tr key={i}>
                           <td className="p-3">{p.nombre || p.nombreProducto || p.descripcion || "Producto"}</td>
                           <td className="p-3 text-right font-bold text-gray-600">
                             ${(p.precioUnitario || p.subtotal || p.precio || 0).toLocaleString()}
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase text-gray-500 mb-3 flex items-center gap-2">
                <CreditCard size={16}/> Plan de Pagos
              </h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-xs uppercase">
                    <tr>
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-right">Monto</th>
                      <th className="p-2 text-center">Estado</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cuotas.length === 0 ? (
                      <tr><td colSpan="4" className="p-4 text-center text-gray-400">Pago Contado / Sin Cuotas</td></tr>
                    ) : (
                      cuotas.map((cuota) => {
                        // Usamos montoCuota (que ya trae el recargo si lo calculó el backend) o montoBase
                        const montoExigible = cuota.montoCuota || cuota.montoBase || 0;
                        const pagadoTotal = (cuota.montoPagado || 0) >= montoExigible;
                        const esPagada = cuota.estado === "Pagada" || cuota.pagada || pagadoTotal;
                        
                        return (
                          <tr key={cuota.id || Math.random()} className="hover:bg-gray-50">
                            <td className="p-2 font-bold text-gray-500">{cuota.numeroCuota}</td>
                            
                            {/* ACÁ MOSTRAMOS EL MONTO Y EL RECARGO EN PANTALLA */}
                            <td className="p-2 text-right">
                              <div className="font-mono">${montoExigible.toLocaleString()}</div>
                              {cuota.recargo > 0 && (
                                <div className="text-[10px] text-orange-600 font-bold tracking-tighter uppercase">
                                  +${cuota.recargo.toLocaleString()} Mora
                                </div>
                              )}
                            </td>

                            <td className="p-2 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                esPagada ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {esPagada ? "Pagada" : "Pend."}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              {!esPagada && (
                                <button
                                  onClick={() => abrirPagarCuota(cuota)}
                                  className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                                >
                                  COBRAR
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 font-bold rounded-lg transition">
            Cerrar
          </button>
        </div>
      </div>

      {mostrarPagarCuota && cuotaSeleccionada && (
        <PagarCuotaModal
          venta={venta}
          cuota={cuotaSeleccionada} // Esta cuota ahora ya trae el recargo sumado desde el backend
          onClose={cerrarPagarCuota}
          reloadVentas={handleRecarga}
        />
      )}
    </div>
  );
};

export default VentaDetailModal;
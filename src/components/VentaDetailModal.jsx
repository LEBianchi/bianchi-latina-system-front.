import api from '../services/api';
import toast from 'react-hot-toast';
import {
  X,
  Calendar,
  User,
  DollarSign,
  Printer,
  Clock,
  MapPin
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function VentaDetailModal({ isOpen, onClose, venta, onUpdate }) {
  if (!isOpen || !venta) return null;

  
  const fechaActual = new Date().toLocaleDateString();

  const cliente = {
    nombre: venta.cabecera.clienteNombre,
    dni: venta.cabecera.clienteDni,
    localidad: venta.cabecera.clienteLocalidad || venta.cabecera.localidad || 'Monteros',
    direccion: venta.cabecera.clienteDireccion || venta.cabecera.direccion || '-'
  };

  const totalVenta = venta.cabecera.totalVenta;
  
  const saldoPendiente = venta.finanzas ? venta.finanzas.saldoRestante : 0;


  const handlePrint = () => {
    
    setTimeout(() => {
        window.print();
    }, 100);
  };

  return (
    <>
      {/*CSS DE IMPRESIÓN */}
      <style>{`
        @media print {
          /* 1. Configuración de la hoja física */
          @page {
            margin: 15mm;
            size: auto;
          }

          /* 2. Ocultamos la APP normal */
          body * {
            visibility: hidden;
          }

          /* 3. IMPORTANTE: Desbloquear el scroll para que salgan varias hojas */
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }

          /* 4. Mostrar solo el ticket y posicionarlo arriba a la izquierda */
          #printable-area, #printable-area * {
            visibility: visible;
          }

          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
            font-family: sans-serif;
          }

          /* 5. Tablas que fluyen entre páginas */
          table { width: 100%; border-collapse: collapse; }
          thead { display: table-header-group; } /* Repite el header en cada hoja */
          tr { page-break-inside: avoid; } /* No cortar filas por la mitad */
          
          /* Utilidades para impresión limpia */
          .no-print { display: none !important; }
          .print-border { border: 1px solid #000; }
          .print-border-b { border-bottom: 1px solid #000; }
        }
      `}</style>

      {/* MODAL EN PANTALLA  */}
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 print:hidden">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">

          {/* Header Modal */}
          <div className="bg-bianchi-blue p-4 text-white flex justify-between shrink-0">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <DollarSign /> Venta #{venta.cabecera.id}
              </h2>
              <p className="text-sm opacity-90">
                 {new Date(venta.cabecera.fecha).toLocaleDateString()} | {venta.cabecera.tipoVenta}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded flex items-center gap-2 transition">
                <Printer size={18} /> Imprimir
              </button>
              <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition"><X /></button>
            </div>
          </div>

          
          <div className="p-6 overflow-y-auto bg-gray-50 flex-1 space-y-6">
             {/* Tarjetas de Info */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-1"><User size={14}/> Cliente</h3>
                    <p className="font-bold text-lg">{cliente.nombre}</p>
                    <p className="text-sm text-gray-600">DNI: {cliente.dni}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin size={12}/> {cliente.direccion}, {cliente.localidad}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-1"><Clock size={14}/> Finanzas</h3>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-gray-400">Total</p>
                            <p className="font-bold text-xl">${totalVenta.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Pendiente</p>
                            <p className={`font-bold text-xl ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ${saldoPendiente.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
             </div>

             {/* Tabla Cuotas Modal */}
             {venta.cabecera.tipoVenta === "Cuotas" && (
                 <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
                    <div className="bg-gray-100 px-4 py-2 text-xs font-bold uppercase text-gray-600">Plan de Pagos</div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b">
                            <tr>
                                <th className="py-2 text-center">#</th>
                                <th className="py-2 text-left">Vencimiento</th>
                                <th className="py-2 text-right">Monto</th>
                                <th className="py-2 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {venta.planCuotas.map(c => (
                                <tr key={c.numeroCuota}>
                                    <td className="py-2 text-center font-bold text-gray-500">{c.numeroCuota}</td>
                                    <td className="py-2">{new Date(c.fechaVencimiento).toLocaleDateString()}</td>
                                    <td className="py-2 text-right font-medium">${c.montoCuota.toLocaleString()}</td>
                                    <td className="py-2 text-center">
                                        <span className={`text-[10px] px-2 py-1 rounded border ${c.estado === 'Pagada' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}`}>
                                            {c.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             )}
          </div>
        </div>
      </div>

      {/* ================= ÁREA DE IMPRESIÓN  ================= */}
      
      <div id="printable-area" className="hidden print:block">
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
            <div className="flex items-center gap-4">
                <img src={logo} alt="Logo" className="h-16 object-contain grayscale" />
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wider">BIANCHI LATINA</h1>
                    <p className="text-sm text-gray-600">Equipamientos Comerciales</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-bold uppercase">Estado de Cuenta</h2>
                <p className="text-sm">Venta #{venta.cabecera.id}</p>
                <p className="text-sm">Emisión: {fechaActual}</p>
            </div>
        </div>

        <div className="no-break">
  {/* datos del cliente */}
</div>
        <div className="mb-6 p-4 border border-black rounded-sm">
            <h3 className="font-bold text-xs uppercase border-b border-black mb-2 pb-1">Datos del Cliente</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                    <span className="font-bold">Cliente: </span> {cliente.nombre}
                </div>
                <div>
                    <span className="font-bold">DNI: </span> {cliente.dni}
                </div>
                <div>
                    <span className="font-bold">Dirección: </span> {cliente.direccion}
                </div>
                <div>
                    <span className="font-bold">Localidad: </span> {cliente.localidad}
                </div>
            </div>
        </div>

        {/* RESUMEN FINANCIERO */}
        <div className="mb-8 flex justify-between items-end">
            <div>
                <p className="text-xs uppercase font-bold text-gray-500">Total Venta</p>
                <p className="text-2xl font-bold">${totalVenta.toLocaleString()}</p>
            </div>
            <div className="text-right">
                <p className="text-xs uppercase font-bold text-gray-500">Saldo Pendiente</p>
                <p className="text-2xl font-bold border-b-2 border-black">${saldoPendiente.toLocaleString()}</p>
            </div>
        </div>

        {/* TABLA DE CUOTAS  */}
        {venta.planCuotas && venta.planCuotas.length > 0 && (
            <div className="mb-8">
                <h3 className="font-bold text-sm uppercase mb-2">Plan de Pagos</h3>
                <table className="w-full text-sm border-collapse border border-black">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-black p-1 text-center w-12">#</th>
                            <th className="border border-black p-1 text-left">Vencimiento</th>
                            <th className="border border-black p-1 text-right">Monto</th>
                            <th className="border border-black p-1 text-right">Pagado</th>
                            <th className="border border-black p-1 text-center w-24">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venta.planCuotas.map((c) => (
                            <tr key={c.numeroCuota}>
                                <td className="border border-black p-1 text-center">{c.numeroCuota}</td>
                                <td className="border border-black p-1">{new Date(c.fechaVencimiento).toLocaleDateString()}</td>
                                <td className="border border-black p-1 text-right">${c.montoCuota.toLocaleString()}</td>
                                <td className="border border-black p-1 text-right">
                                    {c.montoPagado > 0 ? `$${c.montoPagado.toLocaleString()}` : '-'}
                                </td>
                                <td className="border border-black p-1 text-center font-bold text-xs uppercase">
                                    {c.estado}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* FIRMAS */}
        <div className="mt-12 pt-8" style={{ pageBreakInside: 'avoid' }}>
            <div className="flex justify-between px-10">
                <div className="text-center w-1/3">
                    <div className="border-t border-black pt-2"></div>
                    <p className="text-xs font-bold uppercase">Firma del Cliente</p>
                </div>
                <div className="text-center w-1/3">
                    <div className="border-t border-black pt-2"></div>
                    <p className="text-xs font-bold uppercase">Bianchi Latina</p>
                </div>
            </div>
            <div className="text-center mt-8 text-[10px] text-gray-500">
                Documento generado electrónicamente - {fechaActual}
            </div>
        </div>

      </div>
    </>
  );
}
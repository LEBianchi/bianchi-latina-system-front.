import { Edit, Trash2, Phone, MapPin, User, FileText } from 'lucide-react';

export default function ClientTable({ clientes, onEdit, onDelete, onHistory }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
            <th className="p-4 font-semibold border-b">Cliente</th>
            <th className="p-4 font-semibold border-b">DNI</th>
            <th className="p-4 font-semibold border-b">Localidad</th>
            <th className="p-4 font-semibold border-b">Datos de Contacto</th>
            <th className="p-4 font-semibold border-b text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clientes.length === 0 ? (
            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay clientes.</td></tr> // Aumenté colSpan a 5
          ) : (
            clientes.map((cli) => (
              <tr key={cli.id} className="hover:bg-blue-50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3 text-bianchi-blue"><User size={20} /></div>
                    <span className="font-bold text-gray-800">{cli.nombre}</span>
                  </div>
                </td>
                <td className="p-4"><span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold tracking-wider">{cli.dni}</span></td>
                
                {/* DATO DE LOCALIDAD */}
                <td className="p-4 text-sm font-medium text-gray-500 uppercase">
                    {cli.localidad || "Monteros"}
                </td>

                <td className="p-4 text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2"><Phone size={14} className="text-green-600"/> {cli.telefono || <span className="text-gray-400 italic">Sin teléfono</span>}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-red-500"/> {cli.direccion || <span className="text-gray-400 italic">Sin dirección</span>}</div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center space-x-2">
                    
                    <button onClick={() => onHistory(cli.id)} title="Ver Estado de Cuenta" className="p-2 text-purple-600 hover:bg-purple-100 rounded transition bg-white border border-purple-200 shadow-sm">
                      <FileText size={18} />
                    </button>

                    <button onClick={() => onEdit(cli)} title="Editar" className="p-2 text-blue-600 hover:bg-blue-100 rounded transition bg-white border border-blue-200 shadow-sm">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => onDelete(cli.id)} title="Eliminar" className="p-2 text-red-600 hover:bg-red-100 rounded transition bg-white border border-red-200 shadow-sm">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
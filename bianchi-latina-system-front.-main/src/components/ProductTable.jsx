import { Edit, Trash2 } from 'lucide-react';

export default function ProductTable({ productos, loading, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
            <th className="p-4 font-semibold border-b">Nombre</th>
            <th className="p-4 font-semibold border-b">Categoría</th>
            <th className="p-4 font-semibold border-b text-right">Costo</th>
            <th className="p-4 font-semibold border-b text-right">Precio Venta</th>
            <th className="p-4 font-semibold border-b text-center">Stock</th>
            <th className="p-4 font-semibold border-b text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan="6" className="p-8 text-center text-gray-500 animate-pulse">Cargando inventario...</td></tr>
          ) : productos.length === 0 ? (
            <tr><td colSpan="6" className="p-8 text-center text-gray-500">No hay productos encontrados.</td></tr>
          ) : (
            productos.map((prod) => (
              <tr key={prod.id} className="hover:bg-blue-50 transition-colors group">
                <td className="p-4 font-medium text-gray-800">{prod.nombre}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold uppercase">
                    {prod.categoria}
                  </span>
                </td>
                <td className="p-4 text-right text-gray-500">${prod.precioCosto.toLocaleString()}</td>
                <td className="p-4 text-right font-bold text-bianchi-blue text-lg">${prod.precioVenta.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${prod.stockActual <= prod.stockMinimo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {prod.stockActual} u.
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(prod)} className="p-2 text-blue-600 hover:bg-blue-100 rounded transition">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => onDelete(prod.id)} className="p-2 text-red-600 hover:bg-red-100 rounded transition">
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
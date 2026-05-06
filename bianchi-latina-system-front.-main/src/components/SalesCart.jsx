import { Trash, ShoppingCart } from 'lucide-react';

export default function SalesCart({ carrito, onRemove }) {
  
  if (!carrito || carrito.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <ShoppingCart size={48} className="mb-2 opacity-50"/>
        <p className="font-medium">El carrito está vacío</p>
        <p className="text-xs">Agregá productos desde la lista</p>
      </div>
    );
  }

  
  const calcularTotal = () => {
      return carrito.reduce((acc, item) => {
          const precio = item.precioVenta || item.precio || 0;
          return acc + (precio * (item.cantidad || 1));
      }, 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full overflow-hidden">
        {/* Header del Carrito */}
        <div className="p-3 border-b bg-gray-100 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <ShoppingCart size={18} className="text-bianchi-blue"/> Carrito
            </h3>
            <span className="bg-bianchi-blue text-white text-xs px-2 py-1 rounded-full font-bold">
                {carrito.length} Items
            </span>
        </div>

        {/* Lista de Items */}
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {carrito.map((item, index) => {
                
                const precioUnitario = item.precioVenta || item.precio || 0;
                const subtotal = precioUnitario * (item.cantidad || 1);

                return (
                    <div key={item.id || index} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition group">
                        
                        {/* Info Producto */}
                        <div className="flex-1 overflow-hidden mr-3">
                            <div className="font-bold text-gray-800 text-sm truncate">{item.nombre || "Producto sin nombre"}</div>
                            <div className="text-xs text-gray-500 flex gap-2">
                                <span>${precioUnitario.toLocaleString()} x {item.cantidad}</span>
                            </div>
                        </div>

                        {/* Subtotal y Botón Borrar */}
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-800 text-sm">
                                ${subtotal.toLocaleString()}
                            </span>
                            <button 
                                onClick={() => onRemove(item.id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                                title="Quitar del carrito"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>

        
        <div className="p-4 bg-gray-50 border-t flex justify-end">
            <div className="text-sm text-gray-500 mr-2">Subtotal Lista:</div>
            <div className="font-black text-gray-800">
                ${calcularTotal().toLocaleString()}
            </div>
        </div>
    </div>
  );
}
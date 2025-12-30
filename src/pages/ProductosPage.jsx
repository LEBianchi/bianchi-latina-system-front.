import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Package, Plus, Search, Edit, Trash, PackagePlus, TrendingUp } from 'lucide-react';
import ProductModal from '../components/ProductModal';

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await api.get('/productos');
      setProductos(res.data);
    } catch (error) {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const handleReponerStock = async (prod) => {
    const cantidadStr = prompt(`Ingreso de Fabricación: ${prod.nombre}\n\n¿Cuántas unidades ingresan?`);
    
    if (!cantidadStr) return; 

    const cantidad = parseInt(cantidadStr);
    if (isNaN(cantidad) || cantidad <= 0) return toast.error("Cantidad inválida");

    const toastId = toast.loading("Actualizando stock...");

    try {
        const res = await api.post(`/productos/${prod.id}/sumar-stock`, cantidad, {
            headers: { 'Content-Type': 'application/json' }
        });

        
        setProductos(prev => prev.map(p => 
            p.id === prod.id ? { ...p, stock: res.data.nuevoStock, stockActual: res.data.nuevoStock } : p
        ));

        toast.dismiss(toastId);
        toast.success(res.data.mensaje || "Stock actualizado");

    } catch (error) {
        toast.dismiss(toastId);
        toast.error("Error al sumar stock");
    }
  };

  const handleGuardar = async (formData) => {

    const dataParaEnviar = {
        ...formData,

        Precio: formData.precioVenta, 
        PrecioVenta: formData.precioVenta,
        
        Costo: formData.precioCosto,
        PrecioCosto: formData.precioCosto,
        
        Stock: formData.stockActual,
        StockActual: formData.stockActual
    };

    try {
        if (productoAEditar) {
            await api.put(`/productos/${productoAEditar.id}`, dataParaEnviar);
            toast.success("Producto modificado");
        } else {
            await api.post('/productos', dataParaEnviar);
            toast.success("Producto creado");
        }
        setModalAbierto(false);
        setProductoAEditar(null);
        cargarProductos();
    } catch (error) {
        toast.error("Error al guardar");
    }
  };

  const abrirModalCrear = () => {
      setProductoAEditar(null);
      setModalAbierto(true);
  };

  const abrirModalEditar = (prod) => {
      
      const productoNormalizado = {
          ...prod,
          precioCosto: prod.costo !== undefined ? prod.costo : prod.precioCosto,
          precioVenta: prod.precio !== undefined ? prod.precio : prod.precioVenta,
          stockActual: prod.stock !== undefined ? prod.stock : prod.stockActual
      };
      
      setProductoAEditar(productoNormalizado);
      setModalAbierto(true);
  };

  const handleEliminar = async (id) => {
      if(!confirm("¿Seguro que querés borrar este producto?")) return;
      try {
          await api.delete(`/productos/${id}`);
          toast.success("Producto eliminado");
          cargarProductos();
      } catch (error) {
          toast.error("No se puede eliminar (probablemente tenga ventas)");
      }
  };

  const productosFiltrados = productos.filter(p => 
    (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-bianchi-blue"/> Inventario
          </h1>
          <p className="text-gray-500">Gestión de productos y costos</p>
        </div>
        <button onClick={abrirModalCrear} 
            className="bg-bianchi-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg transition">
            <Plus className="mr-2"/> Nuevo Producto
        </button>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type="text" placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-bianchi-blue"
                    value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
            </div>
            <div className="text-sm text-gray-400 font-bold">{productosFiltrados.length} Items</div>
        </div>
        
        <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 sticky top-0 uppercase text-xs">
                    <tr>
                        <th className="p-4">Producto</th>
                        <th className="p-4 text-right">Costo</th>
                        <th className="p-4 text-right">Venta</th>
                        <th className="p-4 text-right">Ganancia</th>
                        <th className="p-4 text-center">Stock</th>
                        <th className="p-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? <tr><td colSpan="6" className="p-10 text-center">Cargando...</td></tr> : 
                     productosFiltrados.map(p => {
                        
                        const costo = p.costo !== undefined ? p.costo : (p.precioCosto || 0);
                    
                        const precio = p.precio !== undefined ? p.precio : (p.precioVenta || 0);
                    
                        const stock = p.stock !== undefined ? p.stock : (p.stockActual || 0);
                        
                        const ganancia = precio - costo;

                        return (
                        <tr key={p.id} className="hover:bg-blue-50 transition group border-b border-gray-50 last:border-none">
                            
                            <td className="p-4 align-top">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-base mb-1">{p.nombre}</span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {p.categoria && (
                                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                                {p.categoria}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500 italic truncate max-w-xs" title={p.descripcion}>
                                            {p.descripcion || "Sin descripción"}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            
                            <td className="p-4 text-right align-middle font-medium text-gray-500 text-sm">
                                ${costo.toLocaleString()}
                            </td>
                            
                            <td className="p-4 text-right align-middle font-bold text-gray-800 text-lg">
                                ${precio.toLocaleString()}
                            </td>

                            <td className="p-4 text-right align-middle">
                                <div className={`font-bold flex items-center justify-end gap-1 ${ganancia > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    <TrendingUp size={14}/> ${ganancia.toLocaleString()}
                                </div>
                            </td>
                            
                            <td className="p-4 text-center align-middle">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stock > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {stock} u.
                                </span>
                            </td>

                            <td className="p-4 align-middle">
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => handleReponerStock(p)} className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition shadow-sm" title="Reponer Stock">
                                        <PackagePlus size={18}/>
                                    </button>
                                    <button onClick={() => abrirModalEditar(p)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 p-2 rounded-lg transition shadow-sm">
                                        <Edit size={18}/>
                                    </button>
                                    <button onClick={() => handleEliminar(p.id)} className="bg-white border border-red-100 hover:bg-red-50 text-red-500 p-2 rounded-lg transition shadow-sm">
                                        <Trash size={18}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                     )})}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODAL NUEVO */}
      <ProductModal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        onSave={handleGuardar} 
        productoInicial={productoAEditar}
      />
    </div>
  );
}
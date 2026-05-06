import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash,
  PackagePlus,
  TrendingUp
} from 'lucide-react';
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

  // =========================
  // CARGAR PRODUCTOS (FIX)
  // =========================
  const cargarProductos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/productos');

      const lista = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.productos)
          ? res.data.productos
          : [];

      setProductos(lista);
    } catch (error) {
      toast.error("Error al cargar productos");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REPONER STOCK
  // =========================
  const handleReponerStock = async (prod) => {
    const cantidadStr = prompt(
      `Ingreso de Fabricación: ${prod.nombre}\n\n¿Cuántas unidades ingresan?`
    );

    if (!cantidadStr) return;

    const cantidad = parseInt(cantidadStr);
    if (isNaN(cantidad) || cantidad <= 0) {
      return toast.error("Cantidad inválida");
    }

    const toastId = toast.loading("Actualizando stock...");

    try {
      const res = await api.post(
        `/productos/${prod.id}/sumar-stock`,
        cantidad,
        { headers: { 'Content-Type': 'application/json' } }
      );

      setProductos(prev =>
        prev.map(p =>
          p.id === prod.id
            ? {
                ...p,
                stock: res.data?.nuevoStock ?? p.stock,
                stockActual: res.data?.nuevoStock ?? p.stockActual
              }
            : p
        )
      );

      toast.dismiss(toastId);
      toast.success(res.data?.mensaje || "Stock actualizado");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Error al sumar stock");
    }
  };

  // =========================
  // GUARDAR / EDITAR (CON SEGURIDAD)
  // =========================
  const handleGuardar = async (formData) => {
    
    // --- BARRERA DE SEGURIDAD PARA REDUCCIÓN DE STOCK ---
    if (productoAEditar) {
      // Rescatamos el stock viejo (puede venir como stock o stockActual)
      const stockViejo = productoAEditar.stockActual ?? productoAEditar.stock ?? 0;
      const stockNuevo = parseInt(formData.stockActual) || 0;

      // Si el nuevo stock es MENOR al viejo, salta la alarma
      if (stockNuevo < stockViejo) {
        const clave = window.prompt("⚠️ ALERTA DE SEGURIDAD ⚠️\n\nEstás intentando disminuir el stock manualmente.\nIngresá la contraseña de administrador para autorizar:");
        
        // ACÁ ESTÁ TU CLAVE HARCODEADA
        if (clave !== "Bianchi2026.") {
          toast.error("Contraseña incorrecta. Operación cancelada.");
          return; // CORTAMOS LA FUNCIÓN: NO SE GUARDA NADA
        }
      }
    }
    // ----------------------------------------------------

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
        toast.success("Producto modificado correctamente");
      } else {
        await api.post('/productos', dataParaEnviar);
        toast.success("Producto creado correctamente");
      }

      setModalAbierto(false);
      setProductoAEditar(null);
      cargarProductos();
    } catch (error) {
      toast.error("Error al guardar los cambios");
    }
  };

  // =========================
  // ELIMINAR
  // =========================
  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que querés borrar este producto?")) return;

    try {
      await api.delete(`/productos/${id}`);
      toast.success("Producto eliminado");
      cargarProductos();
    } catch (error) {
      toast.error("No se puede eliminar (probablemente tenga ventas)");
    }
  };

  // =========================
  // FILTRADO (BLINDADO)
  // =========================
  const productosFiltrados = Array.isArray(productos)
    ? productos.filter(p =>
        (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  // =========================
  // RENDER
  // =========================
  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-bianchi-blue" /> Inventario
          </h1>
          <p className="text-gray-500">Gestión de productos y costos</p>
        </div>
        <button
          onClick={() => {
            setProductoAEditar(null);
            setModalAbierto(true);
          }}
          className="bg-bianchi-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg transition"
        >
          <Plus className="mr-2" /> Nuevo Producto
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-md border flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-bianchi-blue"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-400 font-bold">
            {productosFiltrados.length} Items
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 text-xs uppercase">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4 text-right">Costo</th>
                <th className="p-4 text-right">Venta</th>
                <th className="p-4 text-right">Ganancia</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">Cargando...</td>
                </tr>
              ) : (
                productosFiltrados.map(p => {
                  const costo = p.costo ?? p.precioCosto ?? 0;
                  const precio = p.precio ?? p.precioVenta ?? 0;
                  const stock = p.stock ?? p.stockActual ?? 0;
                  const ganancia = precio - costo;

                  return (
                    <tr key={p.id} className="hover:bg-blue-50">
                      <td className="p-4 font-bold">{p.nombre}</td>
                      <td className="p-4 text-right">${costo.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold">${precio.toLocaleString()}</td>
                      <td className="p-4 text-right text-green-600">
                        <TrendingUp size={14} className="inline" /> ${ganancia.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">{stock} u.</td>
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => handleReponerStock(p)} className="p-2 bg-green-100 rounded">
                          <PackagePlus size={18} />
                        </button>
                        <button onClick={() => {
                          setProductoAEditar(p);
                          setModalAbierto(true);
                        }} className="p-2 border rounded">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleEliminar(p.id)} className="p-2 border rounded text-red-500">
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={handleGuardar}
        productoInicial={productoAEditar}
      />
    </div>
  );
}

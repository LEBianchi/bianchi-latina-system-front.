import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Store, Settings } from 'lucide-react';
import SalesCart from '../components/SalesCart';
import SalesForm from '../components/SalesForm';

export default function VentasPage() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  
  // NUEVO: Estado para la caja seleccionada (1 por defecto)
  const [cajaSeleccionada, setCajaSeleccionada] = useState(1);

  useEffect(() => {
    cargarDatos();
  }, []);

  /* ===============================
      CARGA DE DATOS (BLINDADA)
  =============================== */
  const cargarDatos = async () => {
    try {
      const [prodRes, cliRes] = await Promise.all([
        api.get('/productos'),
        api.get('/clientes')
      ]);

      // 🔒 NORMALIZACIÓN A PRUEBA DE PRODUCCIÓN
      const productosData = Array.isArray(prodRes.data)
        ? prodRes.data
        : (prodRes.data?.productos ?? []);

      const clientesData = Array.isArray(cliRes.data)
        ? cliRes.data
        : (cliRes.data?.clientes ?? []);

      setProductos(productosData);
      setClientes(clientesData);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando datos del sistema");
      setProductos([]);
      setClientes([]);
    }
  };

  /* ===============================
      CARRITO
  =============================== */
  const agregarAlCarrito = (prod) => {
    const stockReal = prod.stockActual !== undefined
      ? prod.stockActual
      : (prod.stock || 0);

    if (stockReal <= 0) return toast.error("Sin Stock");

    const existe = carrito.find(item => item.id === prod.id);

    if (existe) {
      if (existe.cantidad >= stockReal) return toast.error("Stock insuficiente");

      setCarrito(carrito.map(item =>
        item.id === prod.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...prod, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotalLista = () =>
    carrito.reduce((acc, item) => {
      const precio = item.precioVenta || item.precio || 0;
      return acc + precio * item.cantidad;
    }, 0);

  /* ===============================
      PROCESAR VENTA
  =============================== */
  const procesarVenta = async (ventaData) => {
    const dto = {
      ...ventaData,
      items: carrito.map(i => ({
        productoId: i.id,
        cantidad: i.cantidad
      })),
      // 👇 ACÁ MANDAMOS LA CAJA SELECCIONADA
      numeroCaja: cajaSeleccionada 
    };

    try {
      const loadingToast = toast.loading("Procesando venta...");
      await api.post('/ventas', dto);

      toast.dismiss(loadingToast);
      toast.success(`¡Venta registrada en Caja ${cajaSeleccionada}!`);

      setCarrito([]);
      cargarDatos(); // Recargamos para actualizar stock
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error(error.response?.data?.mensaje || "Error al procesar la venta");
    }
  };

  /* ===============================
      FILTRO SEGURO
  =============================== */
  const productosFiltrados = Array.isArray(productos)
    ? productos.filter(p =>
        (p.nombre || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      )
    : [];

  return (
    <div className="flex h-full gap-6 animate-fade-in">

      {/* COLUMNA IZQUIERDA (BUSCADOR Y PRODUCTOS) */}
      <div className="w-2/3 flex flex-col gap-6">

        {/* BUSCADOR + PRODUCTOS */}
        <div className="bg-white p-4 rounded-xl shadow-md flex-1 flex flex-col max-h-[60vh]">
          
          {/* INPUT DE BÚSQUEDA */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar producto..."
              autoFocus
              className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-bianchi-blue outline-none"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          {/* LISTA DE PRODUCTOS */}
          <div className="overflow-y-auto flex-1 grid grid-cols-2 gap-3 pr-2 content-start">
            {productosFiltrados.map(prod => {
              const precioMostrar = prod.precioVenta || prod.precio || 0;
              const stockMostrar = prod.stockActual !== undefined
                ? prod.stockActual
                : (prod.stock || 0);

              return (
                <button
                  key={prod.id}
                  onClick={() => agregarAlCarrito(prod)}
                  disabled={stockMostrar <= 0}
                  className={`flex justify-between items-center p-3 border rounded-lg text-left transition group
                    ${stockMostrar > 0 
                      ? 'hover:bg-blue-50 hover:border-blue-300 cursor-pointer' 
                      : 'opacity-60 bg-gray-50 cursor-not-allowed'}`}
                >
                  <div className="overflow-hidden">
                    <div className="font-bold text-gray-800 truncate">
                      {prod.nombre}
                    </div>
                    <div className="text-sm text-gray-500 font-bold">
                      ${precioMostrar.toLocaleString()}
                    </div>
                  </div>

                  {stockMostrar > 0 ? (
                    <Plus size={20} className="text-bianchi-blue opacity-50 group-hover:opacity-100" />
                  ) : (
                    <span className="text-[10px] text-red-500 font-bold bg-red-100 px-2 py-1 rounded">
                      SIN STOCK
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CARRITO VISUAL */}
        <div className="h-[30vh]">
          <SalesCart carrito={carrito} onRemove={eliminarDelCarrito} />
        </div>
      </div>

      {/* COLUMNA DERECHA (CAJA Y FORMULARIO DE COBRO) */}
      <div className="w-1/3 flex flex-col gap-4">
        
        {/* === SELECTOR DE CAJA === */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Seleccionar Caja Destino</p>
          <div className="grid grid-cols-2 gap-3">
             
             {/* OPCIÓN CAJA 1 */}
             <button
                onClick={() => setCajaSeleccionada(1)}
                className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all
                   ${cajaSeleccionada === 1 
                     ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                     : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
             >
                <Store size={24} />
                <div className="text-center leading-tight">
                   <p className="font-bold text-sm">Caja 1</p>
                   <p className="text-[10px] opacity-80">Mostrador</p>
                </div>
             </button>

             {/* OPCIÓN CAJA 2 */}
             <button
                onClick={() => setCajaSeleccionada(2)}
                className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all
                   ${cajaSeleccionada === 2 
                     ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' 
                     : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
             >
                <Settings size={24} />
                <div className="text-center leading-tight">
                   <p className="font-bold text-sm">Caja 2</p>
                   <p className="text-[10px] opacity-80">Repuestos</p>
                </div>
             </button>
          </div>
        </div>

        {/* FORMULARIO DE COBRO */}
        <div className="flex-1">
            <SalesForm
              clientes={clientes}
              totalLista={calcularTotalLista()}
              onSubmit={procesarVenta}
            />
        </div>
      </div>

    </div>
  );
}
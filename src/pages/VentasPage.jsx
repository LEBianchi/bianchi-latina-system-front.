import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';
import SalesCart from '../components/SalesCart';
import SalesForm from '../components/SalesForm';

export default function VentasPage() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prodRes, cliRes] = await Promise.all([
        api.get('/productos'),
        api.get('/clientes')
      ]);
      setProductos(prodRes.data);
      setClientes(cliRes.data);
    } catch (error) {
      toast.error("Error cargando datos del sistema");
    }
  };

  
  const agregarAlCarrito = (prod) => {
    
    const stockReal = prod.stockActual !== undefined ? prod.stockActual : (prod.stock || 0);
    
    if (stockReal <= 0) return toast.error("Sin Stock");
    
    const existe = carrito.find(item => item.id === prod.id);
    if (existe) {
      if (existe.cantidad >= stockReal) return toast.error("Stock insuficiente");
      setCarrito(carrito.map(item => item.id === prod.id ? {...item, cantidad: item.cantidad + 1} : item));
    } else {
      setCarrito([...carrito, { ...prod, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotalLista = () => carrito.reduce((acc, item) => {
      
      const precio = item.precioVenta || item.precio || 0;
      return acc + (precio * item.cantidad);
  }, 0);

  
  const procesarVenta = async (ventaData) => {
    const dto = {
      ...ventaData,
      items: carrito.map(i => ({ productoId: i.id, cantidad: i.cantidad }))
    };

    try {
      const loadingToast = toast.loading("Procesando venta...");
      await api.post('/ventas', dto);
      
      toast.dismiss(loadingToast);
      toast.success("¡Venta registrada con éxito!");
      
      
      setCarrito([]);
      cargarDatos(); 
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.mensaje || "Error al procesar la venta");
    }
  };

  
  const productosFiltrados = productos.filter(p => 
    (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex h-full gap-6 animate-fade-in">
      
      {/* COLUMNA IZQUIERDA: PRODUCTOS Y CARRITO*/}
      <div className="w-2/3 flex flex-col gap-6">
        
        {/* BUSCADOR Y LISTA DE PRODUCTOS */}
        <div className="bg-white p-4 rounded-xl shadow-md flex-1 flex flex-col max-h-[50vh]">
          <div className="relative mb-4">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
             <input type="text" placeholder="Buscar producto..." autoFocus
               className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-bianchi-blue outline-none"
               value={busqueda} onChange={e => setBusqueda(e.target.value)}
             />
          </div>
          
          <div className="overflow-y-auto flex-1 grid grid-cols-2 gap-3 pr-2">
            {productosFiltrados.map(prod => {
                
                const precioMostrar = prod.precioVenta || prod.precio || 0;
                const stockMostrar = prod.stockActual !== undefined ? prod.stockActual : (prod.stock || 0);

                return (
                  <button key={prod.id} onClick={() => agregarAlCarrito(prod)} 
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left transition group">
                    <div className="overflow-hidden">
                      <div className="font-bold text-gray-800 truncate">{prod.nombre}</div>
                      <div className="text-sm text-gray-500 font-bold">${precioMostrar.toLocaleString()}</div>
                    </div>
                    {stockMostrar > 0 ? (
                      <Plus size={20} className="text-bianchi-blue opacity-50 group-hover:opacity-100"/>
                    ) : (
                      <span className="text-xs text-red-500 font-bold bg-red-100 px-2 py-1 rounded">SIN STOCK</span>
                    )}
                  </button>
                );
            })}
          </div>
        </div>

        {/* CARRITO */}
        <div className="h-[40vh]">
           <SalesCart carrito={carrito} onRemove={eliminarDelCarrito} />
        </div>
      </div>

      {/* COLUMNA DERECHA:  */}
      <div className="w-1/3">
        <SalesForm 
          clientes={clientes} 
          totalLista={calcularTotalLista()} 
          onSubmit={procesarVenta}
        />
      </div>

    </div>
  );
}
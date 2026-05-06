import { useState, useEffect } from 'react';
import { Save, X, Package, FileText, DollarSign, Layers, Hash, Edit, Plus } from 'lucide-react';


const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder, required = false, autoFocus = false }) => (
  <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-bianchi-blue focus-within:border-transparent focus-within:bg-white transition-all duration-200 group">
          <div className="pl-3 text-gray-400 group-focus-within:text-bianchi-blue transition-colors">
              <Icon size={18}/>
          </div>
          <input
              required={required}
              autoFocus={autoFocus}
              type={type}
              placeholder={placeholder}
              className="w-full py-3 px-3 bg-transparent outline-none text-gray-800 font-medium placeholder-gray-400 rounded-xl"
              value={value}
              onChange={onChange}
          />
      </div>
  </div>
);

export default function ProductModal({ isOpen, onClose, onSave, productoInicial }) {
  const [form, setForm] = useState({
    nombre: '', 
    categoria: '', 
    descripcion: '', 
    precioCosto: '', 
    precioVenta: '', 
    stockActual: ''
  });

 useEffect(() => {
    if (productoInicial) {
      // ACÁ ESTABA EL ERROR: El backend a veces manda 'costo' en vez de 'precioCosto'
      setForm({
        nombre: productoInicial.nombre || '',
        categoria: productoInicial.categoria || '',
        descripcion: productoInicial.descripcion || '',
        precioCosto: productoInicial.precioCosto ?? productoInicial.costo ?? 0,
        precioVenta: productoInicial.precioVenta ?? productoInicial.precio ?? 0,
        stockActual: productoInicial.stockActual ?? productoInicial.stock ?? 0
      });
    } else {
      setForm({ nombre: '', categoria: '', descripcion: '', precioCosto: '', precioVenta: '', stockActual: '' });
    }
  }, [productoInicial, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSave({
        ...form,
        precioCosto: parseFloat(form.precioCosto) || 0,
        precioVenta: parseFloat(form.precioVenta) || 0,
        stockActual: parseInt(form.stockActual) || 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end md:items-center z-50 backdrop-blur-sm p-4 transition-all animate-fade-in">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-5 flex justify-between items-center shrink-0">
          <div className="text-white">
            <h2 className="text-xl font-black flex items-center tracking-tight">
               {productoInicial ? <Edit className="mr-2 opacity-80"/> : <Plus className="mr-2 opacity-80"/>}
               {productoInicial ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-blue-100 text-xs mt-1">Gestión de inventario y precios</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-sm">
            <X size={20} />
          </button>
        </div>
        
        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          {/* Fila 1: Nombre y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                  <InputField 
                    label="Nombre del Producto" 
                    icon={Package} 
                    value={form.nombre} 
                    onChange={e => setForm({...form, nombre: e.target.value})}
                    placeholder="Ej: Mostrador Vidriado 2m"
                    required
                    autoFocus
                  />
              </div>
              <div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Categoría</label>
                    <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-bianchi-blue focus-within:bg-white group">
                        <div className="pl-3 text-gray-400 group-focus-within:text-bianchi-blue"><Layers size={18}/></div>
                        <select 
                            className="w-full py-3 px-3 bg-transparent outline-none text-gray-800 font-medium rounded-xl appearance-none cursor-pointer"
                            value={form.categoria} 
                            onChange={e => setForm({...form, categoria: e.target.value})}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Refrigeración">Refrigeración</option>
                            <option value="Estanterías">Estanterías</option>
                            <option value="Muebles Caja">Muebles Caja</option>
                            <option value="Panadería">Panadería</option>
                            <option value="Carnicería">Carnicería</option>
                            <option value="Varios">Varios</option>
                        </select>
                    </div>
                  </div>
              </div>
          </div>

          {/* Fila 2: Descripción */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Descripción</label>
            <div className="relative flex bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-bianchi-blue focus-within:bg-white group">
                <div className="pl-3 pt-3 text-gray-400 group-focus-within:text-bianchi-blue"><FileText size={18}/></div>
                <textarea 
                    className="w-full py-3 px-3 bg-transparent outline-none text-gray-800 font-medium rounded-xl resize-none h-20"
                    placeholder="Detalles técnicos, medidas, color..."
                    value={form.descripcion}
                    onChange={e => setForm({...form, descripcion: e.target.value})}
                />
            </div>
          </div>

          {/* Fila 3: Precios y Stock*/}
          <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
             <InputField 
                label="Costo ($)" 
                icon={DollarSign} 
                type="number"
                value={form.precioCosto} 
                onChange={e => setForm({...form, precioCosto: e.target.value})}
                placeholder="0.00"
             />
             <InputField 
                label="Venta ($)" 
                icon={DollarSign} 
                type="number"
                value={form.precioVenta} 
                onChange={e => setForm({...form, precioVenta: e.target.value})}
                placeholder="0.00"
                required
             />
             <InputField 
                label="Stock Inicial" 
                icon={Hash} 
                type="number"
                value={form.stockActual} 
                onChange={e => setForm({...form, stockActual: e.target.value})}
                placeholder="0"
                required
             />
          </div>

          {/*  Botones */}
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">
                Cancelar
            </button>
            <button type="submit" className="flex-[2] py-3.5 bg-bianchi-blue text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 transform active:scale-95">
              <Save size={20} /> Guardar Producto
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
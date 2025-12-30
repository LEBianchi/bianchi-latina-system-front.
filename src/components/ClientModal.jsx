import { useState, useEffect } from 'react';
import { Save, X, User, CreditCard, Phone, MapPin, UserPlus } from 'lucide-react';


const InputField = ({ label, icon: Icon, value, onChange, placeholder, autoFocus = false }) => (
  <div className="space-y-1.5">
      <label className="block text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-bianchi-blue focus-within:border-transparent focus-within:bg-white transition-all duration-200 group">
          <div className="pl-4 text-gray-400 group-focus-within:text-bianchi-blue transition-colors">
              <Icon size={20}/>
          </div>
          <input
              required={label !== 'Teléfono / WhatsApp' && label !== 'Dirección'}               autoFocus={autoFocus}
              type="text"
              placeholder={placeholder}
              className="w-full py-3 px-3 bg-transparent outline-none text-gray-800 font-medium placeholder-gray-400 rounded-xl"
              value={value}
              onChange={onChange}
          />
      </div>
  </div>
);

export default function ClientModal({ isOpen, onClose, onSave, clienteInicial }) {
  
  const [form, setForm] = useState({ 
    nombre: '', 
    dni: '', 
    telefono: '', 
    localidad: '',
    direccion: '' 
  });

  
  useEffect(() => {
    if (clienteInicial) {
      setForm({
        nombre: clienteInicial.nombre || '',
        dni: clienteInicial.dni || '',
        telefono: clienteInicial.telefono || '',
        localidad: clienteInicial.localidad || 'Monteros',
        direccion: clienteInicial.direccion || ''
      });
    } else {
      
      setForm({ nombre: '', dni: '', telefono: '', localidad: 'Monteros', direccion: '' });
    }
  }, [clienteInicial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end md:items-center z-50 backdrop-blur-sm p-4 transition-all animate-fade-in">
      
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-5 flex justify-between items-center shrink-0">
          <div className="text-white">
            <h2 className="text-xl font-black flex items-center tracking-tight">
               <UserPlus className="mr-2 opacity-80" size={24}/> 
               {clienteInicial ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="text-blue-100 text-xs mt-1">Completa la ficha técnica del cliente</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-sm">
            <X size={20} />
          </button>
        </div>
        
        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          <InputField 
            label="Nombre Completo" 
            icon={User} 
            value={form.nombre} 
            onChange={e => setForm({...form, nombre: e.target.value})}
            placeholder="Ej: Lisandro Bianchi"
            autoFocus
          />

          <InputField 
            label="DNI / CUIT" 
            icon={CreditCard} 
            value={form.dni} 
            onChange={e => setForm({...form, dni: e.target.value})}
            placeholder="Ej: 20123456789"
          />

          <div className="grid grid-cols-1 gap-5 pt-2">
             <InputField 
                label="Teléfono / WhatsApp" 
                icon={Phone} 
                value={form.telefono} 
                onChange={e => setForm({...form, telefono: e.target.value})}
                placeholder="Ej: 381 155..."
             />

             
             <div className="grid grid-cols-2 gap-3">
                 <InputField 
                    label="Dirección" 
                    icon={MapPin} 
                    value={form.direccion} 
                    onChange={e => setForm({...form, direccion: e.target.value})}
                    placeholder="Calle 123"
                 />
                 <InputField 
                    label="Localidad" 
                    icon={MapPin} 
                    value={form.localidad} 
                    onChange={e => setForm({...form, localidad: e.target.value})}
                    placeholder="Monteros"
                 />
             </div>
             
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">
                Cancelar
            </button>
            <button type="submit" className="flex-[2] py-3.5 bg-bianchi-blue text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 transform active:scale-95">
              <Save size={20} /> Guardar Ficha
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
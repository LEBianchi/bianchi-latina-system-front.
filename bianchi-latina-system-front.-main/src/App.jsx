import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';

// Importación de Páginas
import ProductosPage from './pages/ProductosPage';
import ClientesPage from './pages/ClientesPage';
import VentasPage from './pages/VentasPage';
import DashboardPage from './pages/DashboardPage';
import CajaPage from './pages/CajaPage';
import DeudoresPage from './pages/DeudoresPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-full bg-gray-100 font-sans">
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '10px',
          }
        }}/>
        
        {/* Barra Lateral Fija */}
        <Sidebar />

        {/* Área de Contenido Principal */}
        <main className="flex-1 overflow-auto p-8 relative">
          <Routes>
            {/* Redirección: Si entran a la raíz "/", los mandamos al Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* RUTAS DEL SISTEMA */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/ventas" element={<VentasPage />} />
            <Route path="/caja" element={<CajaPage />} />
            <Route path="/deudores" element={<DeudoresPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
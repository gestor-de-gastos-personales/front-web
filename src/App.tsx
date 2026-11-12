import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from './state/auth.store.js';
import { Layout } from './components/Layout.js';
import { RutaProtegida } from './components/RutaProtegida.js';
import { LoginView } from './views/LoginView.js';
import { RegisterView } from './views/RegisterView.js';
import { DashboardView } from './views/DashboardView.js';
import { GastosView } from './views/GastosView.js';
import { CategoriasView } from './views/CategoriasView.js';
import { PresupuestosView } from './views/PresupuestosView.js';
import { PerfilView } from './views/PerfilView.js';
import { NotFoundView } from './views/NotFoundView.js';
import { AsistenteView } from './views/AsistenteView.js';

export function App() {
  const cargarPerfil = useAuth((estado) => estado.cargarPerfil);

  useEffect(() => {
    void cargarPerfil();
  }, [cargarPerfil]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        <Route element={<RutaProtegida />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardView />} />
            <Route path="gastos" element={<GastosView />} />
            <Route path="categorias" element={<CategoriasView />} />
            <Route path="presupuestos" element={<PresupuestosView />} />
            <Route path="asistente" element={<AsistenteView />} />
            <Route path="perfil" element={<PerfilView />} />
            <Route path="*" element={<NotFoundView />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

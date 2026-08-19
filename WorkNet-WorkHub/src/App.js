/**
 * COMPONENTE APP (Raíz)
 *
 * Responsabilidad única: mostrar la página de inicio y delegar
 * a los dos sub-apps según la ruta elegida por el usuario.
 *
 *  - 'inicio'                    → <Inicio>
 *  - 'chat'                      → <AppChat>
 *  - 'colaborar' / 'login-colaborar' → <AppColaborar>
 */

import React, { useState } from 'react';
import Inicio from './Componentes/Inicio';
import AppChat from './AppChat';
import AppColaborar from './AppColaborar';

function App() {
  const [vista, setVista] = useState('inicio');

  if (vista === 'chat') return <AppChat onVolverInicio={() => setVista('inicio')} />;
  if (vista === 'colaborar' || vista === 'login-colaborar') return <AppColaborar onVolverInicio={() => setVista('inicio')} />;

  return <Inicio onCambiarVista={setVista} />;
}

export default App;
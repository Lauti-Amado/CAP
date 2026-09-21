import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BuscarCorredor from './Pantallas/entregaKits/BuscarCorredor'
import Carreras from './Pantallas/carreras/Carreras'
import DetalleCarrera from './Pantallas/carreras/DetalleCarrera'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/carreras" element={<Carreras />} />
        <Route path="/carreras/:id" element={<DetalleCarrera />} />
        {/* Nueva ruta integrada de la rama feature/entrega-kits */}
        <Route path="/entrega-kits" element={<BuscarCorredor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
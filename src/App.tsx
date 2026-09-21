import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Carreras from './Pantallas/carreras/Carreras'
import DetalleCarrera from './Pantallas/carreras/DetalleCarrera'

function App() {
  return (
  <BrowserRouter>
      <Routes>
        <Route path="/carreras" element={<Carreras />} />
        <Route path="/carreras/:id" element={<DetalleCarrera />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
import { BrowserRouter } from 'react-router-dom';
import { ProveedorAutenticacion } from './contexto/ContextoAutenticacion';
import { RutasAplicacion } from './rutas/RutasAplicacion';
export default function App() { return <BrowserRouter><ProveedorAutenticacion><RutasAplicacion /></ProveedorAutenticacion></BrowserRouter>; }

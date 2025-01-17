// App.js
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Registrar from './fragment/Registrar';
import Main from './fragment/Main';
import Perfil from './fragment/Perfil';
import CasoPrueba from './fragment/CasoPrueba';
import ListaProyectos from './fragment/ListaProyectos';
import ListaCasoPrueba from './fragment/ListaCasoPrueba';
import ListaUsuarios from './fragment/ListaUsuarios';
import NuevoProyecto from './fragment/NuevoProyecto';
import UsuarioProyecto from './fragment/UsuarioProyecto';
import RolMenu from './fragment/RolMenu';
import AsignarCasosPrueba from './fragment/AsignarCasosPrueba';
import ListaCasosAsignados from './fragment/ListaCasosAsignados';
import LayoutComponent from './fragment/LayoutComponent';
import VerCasoPrueba from './fragment/VerCasoPrueba';
import CasoPruebaAsignado from './fragment/CasoPruebaAsignado';
import PresentacionProyecto from './fragment/PresentacionProyecto';
import VerPeticion from './fragment/VerPeticion';
import VerPeticionesClave from './fragment/VerPeticionesClave';
import Principal from './fragment/Principal';
import OlvidoClave from './fragment/OlvidoClave';
import CambioClave from './fragment/CambioClave';
import AgregarErrores from './fragment/AgregarErrores';
import { getToken } from './utilities/Sessionutil';
import VerError from './fragment/VerError';
import AsignarErrores from './fragment/AsignarErrores';
import ListaErroresAsigados from './fragment/ListaErroresAsigados';

function App() {
  const MiddewareSesion = ({ children }) => {
    const autenticado = getToken();
    if (autenticado) {
      return children;
    } else {
      return <Navigate to='/login' />;
    }
  };

  return (
    <div className="App">
      <Routes>
        <Route path='*' element={<Navigate to='/login' />} />  
        <Route path='/' element={<Principal />} />
        <Route path='/login' element={<Login />} />
        <Route path='/registrarse' element={<Registrar />} />
        <Route path='/olvidar/clave' element={<OlvidoClave />} />
        <Route path='/cambio/clave/restablecer/:external_id/:token' element={<CambioClave />} />
        <Route element={<LayoutComponent />}>
          <Route path='/presentacion/:external_id' element={<MiddewareSesion><PresentacionProyecto /></MiddewareSesion>} />
          <Route path='/usuarios' element={<MiddewareSesion><ListaUsuarios /></MiddewareSesion>} />
          <Route path='/peticiones/registro' element={<MiddewareSesion><VerPeticion /></MiddewareSesion>} />
          <Route path='/peticiones/clave' element={<MiddewareSesion><VerPeticionesClave /></MiddewareSesion>} />
          <Route path='/registrar/caso/prueba/:external_id_proyecto' element={<MiddewareSesion><CasoPrueba /></MiddewareSesion>} />
          <Route path='/editar/caso/prueba/:external_id_proyecto/:external_id' element={<CasoPrueba />} />
          <Route path='/proyecto/nuevo' element={<MiddewareSesion><NuevoProyecto /></MiddewareSesion>} />
          <Route path='/proyectos' element={<MiddewareSesion><ListaProyectos /></MiddewareSesion>} />
          <Route path='/casos/prueba/:external_id_proyecto' element={<MiddewareSesion><ListaCasoPrueba /></MiddewareSesion>} />
          <Route path='/caso-prueba/:external_id_proyecto/:external_id' element={<MiddewareSesion><VerCasoPrueba /></MiddewareSesion>} />
          <Route path='/perfil' element={<MiddewareSesion><Perfil /></MiddewareSesion>} />
          <Route path='/proyecto/usuarios/:external_id_proyecto' element={<MiddewareSesion><UsuarioProyecto /></MiddewareSesion>} />
          <Route path="/proyecto/:external_id" element={<MiddewareSesion><RolMenu /></MiddewareSesion>} />
          <Route path='/asignar/tester/:external_id_proyecto' element={<MiddewareSesion><AsignarCasosPrueba /></MiddewareSesion>} />
          <Route path='/asignar/desarrollador/:external_id_proyecto' element={<MiddewareSesion><AsignarErrores /></MiddewareSesion>} />
          <Route path='/casos/prueba/asignados/:external_id_proyecto' element={<MiddewareSesion><ListaCasosAsignados /></MiddewareSesion>} />
          <Route path='/casos/prueba-asignado/:external_id_proyecto/:external_id' element={<MiddewareSesion><CasoPruebaAsignado /></MiddewareSesion>} />
          <Route path='/cambio/clave' element={<MiddewareSesion><CambioClave /></MiddewareSesion>} />
          <Route path='/error/:external_id_proyecto/:external_id' element={<MiddewareSesion><AgregarErrores/></MiddewareSesion>} />
          <Route path='/error/editar/:external_id_proyecto/:external_id/:external_id_error' element={<MiddewareSesion><AgregarErrores/></MiddewareSesion>} />
          <Route path='/errores/asignados/:external_id_proyecto' element={<MiddewareSesion><ListaErroresAsigados/></MiddewareSesion>} />
          <Route path='/error/visualizar/:external_id_proyecto/:external_id/:external_id_error' element={<MiddewareSesion><VerError/></MiddewareSesion>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
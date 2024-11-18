// App.js
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Registrar from './fragment/Registrar';
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
import Principal from './fragment/Principal'; 

function App() {
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
          <Route path='/caso/prueba' element={<MiddewareSesion><CasoPrueba /></MiddewareSesion>} />
          <Route path='/proyecto/nuevo' element={<MiddewareSesion><NuevoProyecto /></MiddewareSesion>} />
          <Route path='/proyectos' element={<MiddewareSesion><ListaProyectos /></MiddewareSesion>} />
          <Route path='/casos/prueba/:external_id' element={<MiddewareSesion><ListaCasoPrueba /></MiddewareSesion>} />
          <Route path='/caso-prueba/:external_id' element={<MiddewareSesion><VerCasoPrueba /></MiddewareSesion>} />
          <Route path='/perfil' element={<MiddewareSesion><Perfil /></MiddewareSesion>} />
          <Route path='/proyecto/usuarios/:external_id' element={<MiddewareSesion><UsuarioProyecto /></MiddewareSesion>} />
          <Route path="/proyecto/:external_id" element={<MiddewareSesion><RolMenu /></MiddewareSesion>} />
          <Route path='/asignar/tester/:external_id' element={<MiddewareSesion><AsignarCasosPrueba /></MiddewareSesion>} />
          <Route path='/casos/prueba/asignados/:external_id' element={<MiddewareSesion><ListaCasosAsignados /></MiddewareSesion>} />
          <Route path='/casos/prueba-asignado/:external_id' element={<MiddewareSesion><CasoPruebaAsignado /></MiddewareSesion>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
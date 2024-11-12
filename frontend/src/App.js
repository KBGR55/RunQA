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
import Principal from './fragment/Principal'; 

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='*' element={<Navigate to='/login' />} />  
        <Route path='/' element={<Principal />} />
        <Route path='/login' element={<Login />} />
        <Route path='/registrarse' element={<Registrar />} />
        <Route element={<LayoutComponent />}>
          <Route path='/presentacion/:external_id' element={<PresentacionProyecto />} />
          <Route path='/usuarios' element={<ListaUsuarios />} />
          <Route path='/peticiones' element={<VerPeticion />} />
          <Route path='/registrar/caso/prueba' element={<CasoPrueba />} />
          <Route path='/proyecto/nuevo' element={<NuevoProyecto />} />
          <Route path='/proyectos' element={<ListaProyectos />} />
          <Route path='/casos/prueba/:external_id' element={<ListaCasoPrueba />} />
          <Route path='/caso-prueba/:external_id' element={<VerCasoPrueba />} />
          <Route path='/perfil' element={<Perfil />} />
          <Route path='/proyecto/usuarios/:external_id' element={<UsuarioProyecto />} />
          <Route path="/proyecto/:external_id" element={<RolMenu />} />
          <Route path='/asignar/tester/:external_id' element={<AsignarCasosPrueba />} />
          <Route path='/casos/prueba/asignados/:external_id_proyecto' element={<ListaCasosAsignados />} />
          <Route path='/casos/prueba-asignado/:external_id_proyecto/:external_id' element={<CasoPruebaAsignado />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

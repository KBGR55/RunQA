import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Main from './fragment/Main';
import CasoPrueba from './fragment/CasoPrueba';
import ListaProyectos from './fragment/ListaProyectos';
import Perfil from './fragment/Perfil';
import ListaUsuarios from './fragment/ListaUsuarios';
import Actualizar from './fragment/Actualizar';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/caso/prueba' element={<CasoPrueba/>} />
        <Route path='/proyectos' element={<ListaProyectos/>} />
        <Route path='/perfil' element={<Perfil/>} />
        <Route path='/usuarios' element={<ListaUsuarios/>} />
        <Route path='/actualizar' element={<Actualizar />} />
        <Route path='*' element={<Navigate to='/login' />} />
      </Routes>
    </div>
  );
}

export default App;

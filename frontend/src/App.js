import React from 'react';
import {Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Main from './fragment/Main';
import Perfil from './fragment/Perfil';
import Actualizar from './fragment/Actualizar';
import ListaProyectos from './fragment/ListaProyectos';
import ListaCasoPrueba from './fragment/ListaCasoPrueba';
import ListaUsuarios from './fragment/ListaUsuarios';

function App() {
  return (
    <div className="App">
      <Routes>
      <Route path='*' element={<Navigate to='/login' />}/>
        <Route path='/login' element={<Login />} />
        <Route path='/main' element={<Main/>} />
        <Route path='/proyectos' element={<ListaProyectos/>} />
        <Route path='/casos-prueba/:id' element={<ListaCasoPrueba/>}/>
        <Route path='/perfil' element={<Perfil/>} />
        <Route path='/usuarios' element={<ListaUsuarios/>} />
        <Route path='/actualizar' element={<Actualizar />} />
      </Routes>
    </div>
  );
}

export default App;

import React from 'react';
import {Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Main from './fragment/Main';
import ListaProyectos from './fragment/ListaProyectos';
import ListaCasoPrueba from './fragment/ListaCasoPrueba';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/main' element={<Main/>} />
        <Route path='/proyectos' element={<ListaProyectos/>} />
        <Route path='/casos-prueba/:id' element={<ListaCasoPrueba/>}/>
      </Routes>
    </div>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Main from './fragment/Main';
import CasoPrueba from './fragment/CasoPrueba';
import ListaProyectos from './fragment/ListaProyectos';

function App() {
  return (
<<<<<<< HEAD
    <BrowserRouter> 
     <Routes> 
        <Route path='/' element={<Main />} />
        <Route path='/caso/prueba' element={<CasoPrueba/>} />
        <Route path='/proyectos' element={<ListaProyectos/>} />
=======
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/main' element={<Main/>} />
        <Route path='*' element={<Navigate to='/login' />} />
>>>>>>> origin/Feature/InicioSesion
      </Routes>
    </div>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Main from './fragment/Main';
import CasoPrueba from './fragment/CasoPrueba';
import ListaProyectos from './fragment/ListaProyectos';
import NewProyect from './fragment/NewProyect';

function App() {
  return (
    <BrowserRouter> 
     <Routes> 
        <Route path='/' element={<Main />} />
        <Route path='/caso/prueba' element={<CasoPrueba/>} />
        <Route path='/proyectos' element={<ListaProyectos/>} />
        <Route path='/newproyect' element={<NewProyect/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

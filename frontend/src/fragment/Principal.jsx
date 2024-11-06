import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Principal_Style.css';

const Principal = () => {
    const navigate = useNavigate();
    const [slideOut, setSlideOut] = useState(false);

    const handleStartClick = () => {
        setSlideOut(true); 
        setTimeout(() => {
            navigate('/login'); 
        }, 500); 
    };
    return (
        <div className={`home-container ${slideOut ? 'slide-out' : ''}`}>
            <div className="logo-space">
                <img src="/logo192.png" alt="Logo" className="logo" />
            </div>

            <div className="text-overlay">
                <h1>RUNQA</h1>
                <h2>Sistema de Gestión de Pruebas de Software</h2>
                <p>Proyecto realizado por estudiantes de la asignatura Software Quality perteneciente al itinerario de Ingeniería de Software en la carrera de Computación de la Universidad Nacional de Loja.</p>
                <button onClick={handleStartClick} className="start-button">Empezar</button>
            </div>
        </div>
    );
};

export default Principal;

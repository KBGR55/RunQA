import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarComponent from './MenuBar';
import SidebarComponent from './RolMenu';

const LayoutComponent = () => {
    return (
        <div>
            {/* Navbar siempre visible */}
            <NavbarComponent />

            {/* Contenedor con flexbox para que Sidebar y contenido principal se adapten */}
            <div style={{ marginTop: '56px', display: 'flex', height: 'calc(100vh - 56px)' }}>
                {/* Sidebar tiene un ancho fijo */}
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <SidebarComponent />
                </div>

                {/* Contenedor principal (parte blanca) ocupa el resto del espacio */}
                <div style={{ flexGrow: 1, padding: '50px', overflowY: 'auto' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default LayoutComponent;

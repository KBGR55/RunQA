import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarComponent from './MenuBar';
import SidebarComponent from './RolMenu';

const LayoutComponent = () => {
    return (
        <div>
            <NavbarComponent />
            <div style={{ marginTop: '56px', display: 'flex', height: 'calc(100vh - 56px)' }}>
                {/* Sidebar tiene un ancho fijo */}
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <SidebarComponent />
                </div>

                <div style={{ flexGrow: 1, padding: '50px', overflowY: 'auto' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default LayoutComponent;

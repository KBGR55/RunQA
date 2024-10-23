import React from 'react';
import NavbarComponent from './MenuBar';
import SidebarComponent from './RolMenu';

const NavbarComplet = ({ children }) => {
    return (
        <div>
            <NavbarComponent />
            <div style={{ marginTop: '56px', display: 'flex' }}>
                <div style={{ flex: '1', padding: '20px' }}>
                    {children}
                </div>
                <SidebarComponent />
            </div>
        </div>
    );
};

export default NavbarComplet;

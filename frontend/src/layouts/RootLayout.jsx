
import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../Components/Navbar/Navbar';

const RootLayout = () => {
    return (
        <div className="min-h-screen bg-[#F7F4EE] text-[#241942]">
            <Navbar />
            <Outlet />
        </div>
    );
};

export default RootLayout;

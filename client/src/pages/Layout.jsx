import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useUser ,SignIn } from '@clerk/clerk-react';

function Layout() {

    const {user} =useUser();
    const navigate = useNavigate()
    const [sidebar, setSidebar] = useState(false)


    return  user ?(
        <div className='flex flex-col items-start justify-start h-screen'>
            <nav>
                <img src={assets.logo} alt="" className='sm:w-44 h-10 sm:h-16 w-32 object-contain cursor-pointer' onClick={() => navigate('/')} />
                {
                    sidebar ? <X onClick={() => setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden' />
                        : <Menu onClick={() => setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden' />
                }
            </nav>
            <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
                <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
                <div className='flex-1 bg-[#F4F7FB]'>
                    <Outlet />
                </div>

            </div>


        </div>
    ): (
        <div className='flex items-center justify-center h-screen'>
            <SignIn/>
        </div>
    )
}

export default Layout;
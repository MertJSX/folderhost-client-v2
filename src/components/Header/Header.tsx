import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { MdExplore, MdMiscellaneousServices } from "react-icons/md";
import { FaUserFriends, FaPencilAlt, FaFolder, FaUser } from "react-icons/fa"
import { FaArrowRotateLeft } from "react-icons/fa6"
import { useCallback, useLayoutEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../utils/axiosInstance';

const Header = () => {
    let navigate = useNavigate();
    const [username, setUsername] = useState<string>(Cookies.get("username") as string);

    useLayoutEffect(() => {
        if (Cookies.get("username")) return

        fetchUserInfo()
    }, []);

    const fetchUserInfo = useCallback(() => {
        axiosInstance.get('/user-info'
        ).then((response) => {
            if (response.data.username) {
                setUsername(response.data.username);
            }
        }).catch((err) => {
            console.error('Failed to fetch user info:', err);
        });
    }, [])

    return (
        <div className='flex flex-col items-center justify-center bg-slate-800 sticky left-0 right-0 top-0 w-full border-b-2 border-slate-700 shadow-lg z-50'>
            <section className='flex flex-row items-center justify-between w-full px-6 py-2'>
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                        <FaFolder className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="font-extrabold text-2xl italic select-none text-white">
                        FolderHost
                    </h1>
                </div>

                {/* User Info Section */}
                <div className="flex items-center gap-3 bg-slate-700 px-4 py-3 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500 rounded-full">
                            <FaUser className="w-3.5 h-3.5 text-sky-400" />
                        </div>
                        <span className="text-white font-medium">{username}</span>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    className='bg-slate-700 px-5 py-2 rounded-lg border border-slate-600 hover:border-sky-500 hover:bg-slate-600 active:bg-slate-700 font-semibold transition-all text-white'
                    onClick={() => {
                        Cookies.remove("token");
                        navigate("/login");
                    }}
                >
                    Logout
                </button>
            </section>

            {/* Navigation */}
            <nav className='flex flex-row justify-center items-center gap-1 w-full border-t border-slate-700/50'>
                <Link
                    className='text-base flex items-center gap-2 px-5 py-3 transition-all hover:bg-slate-700 hover:text-sky-400 border-b-2 border-transparent hover:border-sky-500'
                    to={"/explorer/.%2F"}>
                    <MdExplore className="w-5 h-5" />
                    Explorer
                </Link>
                <Link
                    className='text-base flex items-center gap-2 px-5 py-3 transition-all hover:bg-slate-700 hover:text-sky-400 border-b-2 border-transparent hover:border-sky-500'
                    to={"/services"}>
                    <MdMiscellaneousServices className="w-5 h-5" />
                    Services
                </Link>
                <Link
                    className='text-base flex items-center gap-2 px-5 py-3 transition-all hover:bg-slate-700 hover:text-sky-400 border-b-2 border-transparent hover:border-sky-500'
                    to={"/recovery"}>
                    <FaArrowRotateLeft className="w-4 h-4" />
                    Recovery
                </Link>
                <Link
                    className='text-base flex items-center gap-2 px-5 py-3 transition-all hover:bg-slate-700 hover:text-sky-400 border-b-2 border-transparent hover:border-sky-500'
                    to={"/users"}>
                    <FaUserFriends className="w-5 h-5" />
                    Users
                </Link>
                <Link
                    className='text-base flex items-center gap-2 px-5 py-3 transition-all hover:bg-slate-700 hover:text-sky-400 border-b-2 border-transparent hover:border-sky-500'
                    to={"/logs"}>
                    <FaPencilAlt className="w-4 h-4" />
                    Logs
                </Link>
            </nav>
        </div>
    )
}

export default Header
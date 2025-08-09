import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Header = (props) => {
    let navigate = useNavigate();
    return (
        <div className='header-container flex flex-row items-center justify-center gap-5 bg-slate-800 p-2 fixed top-0 w-full border-b-2'>
            <h1 className="text-left font-black text-2xl italic select-none">
                Folder Host
            </h1>
            <input
                type="text"
                className='bg-slate-600 rounded-xl text-center w-1/5 text-gray-400'
                placeholder='IP'
                value={Cookies.get("ip")}
            readOnly/>
            <button
                className='bg-slate-600 px-4 rounded-xl border-2 border-sky-600 hover:border-sky-700 active:bg-slate-700 font-bold'
                onClick={() => {
                    Cookies.remove("ip");
                    Cookies.remove("username");
                    Cookies.remove("password");
                    navigate("/login");
                }}
            >
                Logout
            </button>
        </div>
    )
}

export default Header
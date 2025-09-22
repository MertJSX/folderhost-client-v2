import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { MdExplore, MdMiscellaneousServices } from "react-icons/md";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { FaUserFriends, FaPencilAlt } from "react-icons/fa"

const Header = () => {
    let navigate = useNavigate();
    return (
        <div className='flex flex-col items-center justify-center bg-slate-800 sticky left-0 right-0 top-0 w-full border-b-2 z-50'>
            <section className='flex flex-row items-center justify-center w-full gap-5 p-2'>
                <h1 className="text-left font-black text-2xl italic select-none">
                    FolderHost
                </h1>
                <input
                    type="text"
                    className='bg-slate-600 rounded-xl text-center w-1/5 text-gray-400'
                    value={import.meta.env.VITE_API_BASE_URL}
                    readOnly />
                <button
                    className='bg-slate-600 px-4 rounded-xl border-2 border-sky-600 hover:border-sky-700 active:bg-slate-700 font-bold'
                    onClick={() => {
                        Cookies.remove("token");
                        navigate("/login");
                    }}
                >
                    Logout
                </button>
            </section>
            <nav className='flex flex-row justify-center items-center gap-5'>
                <Link className='text-xl flex items-center gap-1 p-2 transition-all hover:-translate-y-0.5' to={"/explorer/.%2F"}><MdExplore />Explorer</Link>
                <Link className='text-xl flex items-center gap-1 p-2 transition-all hover:-translate-y-0.5' to={"/explorer"}><MdMiscellaneousServices />Services</Link>
                <Link className='text-xl flex items-center gap-1 p-2 transition-all hover:-translate-y-0.5' to={"/explorer"}><FaArrowRotateLeft />Recovery</Link>
                <Link className='text-xl flex items-center gap-1 p-2 transition-all hover:-translate-y-0.5' to={"/explorer"}><FaUserFriends />Users</Link>
                <Link className='text-xl flex items-center gap-1 p-2 transition-all hover:-translate-y-0.5' to={"/explorer"}><FaPencilAlt />Logs</Link>
            </nav>
        </div>
    )
}

export default Header
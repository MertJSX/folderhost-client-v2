import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AllOptions from './AllOptions.jsx';
import { IoMdSettings } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
import ExplorerContext from '../../utils/ExplorerContext';
import { type ExplorerContextType } from '../../types/ExplorerContextType';


const OptionsBar = () => {
    const [settings, setSettings] = useState<boolean>(false);
    const navigate = useNavigate();
    const buttonSize = 20;
    const {
        path, setPath, readDir, setShowDisabled
    } = useContext<ExplorerContextType>(ExplorerContext)
    return (
        <div className='flex flex-col justify-center w-11/12 mx-auto pt-5 gap-5 p-2'>
            <div className='flex w-full justify-center'>
                <input
                    type="text"
                    spellCheck={false}
                    className='w-1/2 bg-slate-700 text-base min-w-[300px] font-bold font-sans rounded-t-lg rounded-l-lg rounded-b-lg rounded-r-none rounded-tr-none px-2'
                    placeholder='Path'
                    value={path}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            navigate(`/explorer/${encodeURIComponent(path)}`, { replace: true });
                            readDir()
                        }
                        if (e.key === "Backspace" && path === "./") {
                            e.preventDefault()
                        }
                        if (e.key === "/" && path.slice(-1) === "/") {
                            e.preventDefault()
                        }
                    }}
                    onChange={(e) => {
                        setPath(e.target.value)
                    }}
                />
                <button
                    className="bg-sky-600 px-5 active:bg-sky-600 hover:bg-sky-700"
                    onClick={() => {
                        readDir()
                    }}
                >Refresh</button>
                <button
                    className='ml-5 inline-flex justify-between items-center w-48 px-3 py-2 text-left text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none'
                    onClick={() => { setSettings(!settings) }}>
                    <IoMdSettings size={buttonSize} />
                    Options
                    {settings ? <FaArrowDown size={buttonSize - 5} /> : <FaArrowLeft size={buttonSize - 5} />}
                </button>
            </div>
            <AllOptions isOpen={settings} setShowDisabled={setShowDisabled} />
        </div>
    )
}

export default OptionsBar
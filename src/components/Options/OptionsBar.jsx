import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AllOptions from './AllOptions';
import { IoMdSettings } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";


const OptionsBar = ({path, setPath, readDir, error, response, setShowDisabled}) => {
    const [settings, setSettings] = useState(false);
    const navigate = useNavigate();
    const buttonSize = 20;
    return (
        <div className='flex bg-slate-800 flex-col justify-center w-full mt-14 gap-5 p-2'>
            <div className='flex w-full justify-center'>
                <input
                    type="text"
                    className='w-1/2 bg-slate-600 text-lg min-w-[300px] font-bold font-mono rounded-t-lg rounded-l-lg rounded-b-lg rounded-r-none rounded-tr-none px-2'
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
                    className='ml-5 inline-flex justify-between items-center w-48 px-3 py-2 text-left text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none'
                    onClick={() => { setSettings(!settings) }}>
                    <IoMdSettings size={buttonSize} />
                    Options
                    {settings ? <FaArrowDown size={buttonSize - 5} /> : <FaArrowLeft size={buttonSize - 5} />}
                </button>
            </div>
            <AllOptions isOpen={settings} setShowDisabled={setShowDisabled} />
            {response ?
                <h1 className='text-emerald-400 text-2xl text-center'>{response}</h1>
                : error ? <h1 className='text-red-500 text-2xl text-center'>{error}</h1> : null
            }
        </div>
    )
}

export default OptionsBar
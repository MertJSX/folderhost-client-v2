import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Login = () => {
    const [ip, setIp] = useState(window.location.origin);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("")
    const navigate = useNavigate();

    function verifyPassword() {
        axios.post(ip + `/api/verify-password`, {
            username: username,
            password: password
        }).then((data) => {
            console.log(data);
            if (data.data.res) {
                Cookies.set("ip", ip);
                Cookies.set("token", data.data.token);
                // navigate(`/explorer/${encodeURIComponent("./")}`); // useless for now
                navigate('/');
            }
        }).catch((err) => {
            if (err.response) {
                console.error(err.response.data.err);
                setErr(err.response.data.err)
                setTimeout(() => {
                    setErr("")
                }, 5000);
            } else {
                console.log(err);
                setErr("Cannot connect to the server!")
            }
        })
    }

    useEffect((() => {
        console.log(window.location.origin);
    }), [])

    return (
        <div>
            <div className="flex bg-slate-800 items-center justify-center flex-col m-auto mt-[10%] p-2 gap-4 rounded-lg min-w-[370px] w-1/3 h-[40vh]">
                <h1 className="text-left font-extrabold text-5xl italic select-none">
                    FolderHost
                </h1>
                <input
                    type="text"
                    className='bg-slate-600 rounded w-2/3 text-center m-1 text-2xl min-w-[300px]'
                    placeholder='IP'
                    value={ip}
                    onChange={(e) => {
                        setIp(e.target.value)
                    }}
                />
                <input
                    type="text"
                    className='bg-slate-600 rounded w-2/3 text-center m-1 text-2xl min-w-[300px]'
                    placeholder='Username'
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value)
                    }}
                />
                <input
                    type="password"
                    className='bg-slate-600 rounded w-2/3 text-center m-1 text-2xl min-w-[300px]'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                />
                <button
                    className='bg-slate-600 w-2/3 px-4 rounded-lg border-2 m-1 mt-2 border-sky-600 hover:border-sky-700 active:bg-slate-700 font-bold text-2xl min-w-[300px]'
                    onClick={() => {
                        verifyPassword();
                    }}
                >
                    LOGIN
                </button>
                <h1 className='text-center text-2xl text-red-400'>{err}</h1>
            </div>
        </div>
    )
}

export default Login
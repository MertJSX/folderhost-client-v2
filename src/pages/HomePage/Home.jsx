import { Link } from 'react-router-dom'
import { FaHome } from "react-icons/fa";
import Cookies from 'js-cookie';
import { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    console.log(Cookies.get("password"));
    
  }, [])
  return (
    <div>
        <div className="flex flex-col justify-center items-center bg-gray-700 w-1/2 mx-auto rounded-lg p-5 gap-4 mt-20">
                <FaHome size={65} />
                {
                  !Cookies.get("token") ?
                  (
                    <h1 className='text-2xl text-center'>Please login to get access!</h1>
                  ) : (
                    <h1 className='text-2xl text-center'>Welcome!</h1>
                  )
                }
                
                {
                  !Cookies.get("token") ? (
                    <div className='w-full flex flex-col'>
                      <Link className='text-center font-bold text-2xl bg-sky-700 w-1/2 mx-auto rounded-xl m-4 border-2 border-sky-500' to="/login">Login</Link>
                    </div>
                  ) : (
                    <div className='w-full flex flex-col'>
                      <Link 
                      className='transition-all text-center font-bold text-2xl bg-sky-700 hover:bg-sky-600 w-1/2 mx-auto rounded-xl m-4' 
                      to={`/explorer/${encodeURIComponent("./")}`}>Explorer</Link>
                    </div>
                  )
                }
          </div>
    </div>
  )
}

export default Home
import { useCallback, useEffect, useState } from "react"
import Header from "../../components/Header/Header"
import axiosInstance from "../../utils/axiosInstance"
import MessageBox from "../../components/MessageBox/MessageBox";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import type { Account } from "../../types/Account";
import { FaUserFriends, FaUserPlus, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Users: React.FC = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<Array<Account>>([]);
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    getUsersData()
  }, [])

  const getUsersData = useCallback(() => {
    setSelectedUser(null);
    setUsers([])
    setIsLoading(true)
    axiosInstance.get(`/users`).then((data) => {
      console.log(data);

      setIsLoading(false)
      if (!data.data.users) {
        setIsEmpty(true)
        setUsers([])
        return
      }
      setUsers(data.data.users)
    }).catch((error) => {
      setIsLoading(false)
      setIsError(true)
      console.log(error);

      if (error.response.data.err) {
        setMessage(error.response.data.err)
        return
      }
      setMessage("Unknown error while trying to recover a record.")
    })
  }, [])

  const handleSaveAll = useCallback(() => {
    console.log("Not implemented yet");

  }, [])

  const handleDeleteAccount = useCallback(() => {
    console.log("Not implemented yet");

  }, [])

  return (
    <div className="min-h-screen bg-zinc-800">
      <Header />
      <MessageBox message={message} isErr={isError} setMessage={setMessage} />
      <main className="mt-10">
        <div className="flex flex-row">
          <section className="flex flex-col resize overflow-auto bg-gray-700 gap-3 w-3/5 mx-auto p-4 min-w-[600px] min-h-[600px] h-[700px] max-h-[800px] shadow-2xl">
            <div className="flex justify-between items-center">
              <h1 className="flex text-2xl items-center gap-2"><FaUserFriends /> Users</h1>
              {/* <span className="text-base text-gray-400">Found: {users.length}</span> */}
              <Link
                to="/users/new"
                className="bg-green-600 hover:bg-green-500 w-14 rounded-xl flex items-center gap-2 p-2 justify-center"
              ><FaUserPlus size={22} /></Link>
            </div>
            <hr />
            <section className="flex flex-col gap-2 overflow-hidden overflow-y-auto h-[100%]">
              {
                users[0] ? users.map((user, index) => (
                  <article
                    onClick={() => {
                      navigate(`/users/${user.username}`)
                    }}
                    key={index}
                    className="flex flex-row items-center p-2 gap-2 bg-gray-600 border-gray-600 border-2 hover:border-sky-300 cursor-pointer transition-all hover:translate-x-1"
                  >
                    <FaUser className="ml-10" />
                    <div className="w-1/3 text-lg text-center text-sky-300">{user.username}</div>
                    <div className="w-2/3 text-sm text-center text-gray-400">{user.email}</div>
                  </article>
                )) : null
              }
              {
                isEmpty && !isLoading ?
                  <h1 className="text-lg text-center">No users were found</h1> : isLoading ?
                    <LoadingComponent /> : null
              }
            </section>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Users
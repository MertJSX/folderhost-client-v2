import { FaFolder, FaFileAlt } from "react-icons/fa"
import moment from "moment";
import { type RecoveryRecord } from "../../types/RecoveryRecord";
import type { Account } from "../../types/Account";
import { FaUser } from "react-icons/fa6";

interface UserDataPanelProps {
    userData: Account,
    handleSaveAll: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    handleDeleteAccount: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const UserDataPanel: React.FC<UserDataPanelProps> = ({ userData, handleSaveAll: handleSaveAll, handleDeleteAccount }) => {
    const logoSize = 70;
    return userData && (
        <article className="flex flex-col items-center justify-center w-1/3 mx-auto min-w-[320px] max-w-[30%] min-h-[600px] h-[700px] max-h-[800px]">
            <div className="flex flex-col bg-gray-700 items-center justify-center gap-3 rounded-xl shadow-2xl w-full h-auto p-4 min-h-[350px]">
                <FaUser size={logoSize} className='mx-2' />
                <h1 className="text-2xl font-bold text-sky-300">{userData.username}</h1>
                <h1 className="text-lg text-green-300">
                    <span className="text-gray-300">Email:</span> {userData.email}
                </h1>
                <div className="flex flex-col gap-2 items-center w-full">
                    <button
                        onClick={handleSaveAll}
                        className="w-full rounded-full bg-sky-600 hover:bg-sky-700 font-bold transition-all">Edit</button>
                    <button
                        onDoubleClick={handleDeleteAccount}
                        className="w-full rounded-full bg-red-500 hover:bg-red-600 font-bold transition-all">Remove</button>
                </div>
            </div>
        </article>
    )
}

export default UserDataPanel
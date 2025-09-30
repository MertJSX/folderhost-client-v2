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
            <div className="flex flex-col bg-gray-700 items-center justify-center gap-3 rounded-xl shadow-2xl w-full h-auto p-4 min-h-[400px]">
                <FaUser size={logoSize} className='mx-2' />
                <h1 className="text-2xl font-bold text-sky-300">{userData.username}</h1>
                <h1 className="text-lg text-green-300">
                    {userData.email}
                </h1>
                <section className="flex items-center justify-center flex-wrap gap-2">
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Read dirs:
                        <input type="checkbox" checked={userData.permissions.read_directories} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Read files:
                        <input type="checkbox" checked={userData.permissions.read_files} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Create items:
                        <input type="checkbox" checked={userData.permissions.create} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Change items:
                        <input type="checkbox" checked={userData.permissions.change} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Delete items:
                        <input type="checkbox" checked={userData.permissions.delete} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Move items:
                        <input type="checkbox" checked={userData.permissions.move} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Download files:
                        <input type="checkbox" checked={userData.permissions.download} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Upload files:
                        <input type="checkbox" checked={userData.permissions.upload} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Rename items:
                        <input type="checkbox" checked={userData.permissions.rename} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Extract files:
                        <input type="checkbox" checked={userData.permissions.extract} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Copy items:
                        <input type="checkbox" checked={userData.permissions.copy} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Read Recovery:
                        <input type="checkbox" checked={userData.permissions.read_recovery} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Use Recovery:
                        <input type="checkbox" checked={userData.permissions.use_recovery} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Read Users:
                        <input type="checkbox" checked={userData.permissions.read_users} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Edit Users:
                        <input type="checkbox" checked={userData.permissions.edit_users} />
                    </h1>
                    <h1 className="flex items-center text-base text-gray-300 gap-1">Read Logs:
                        <input type="checkbox" checked={userData.permissions.read_logs} />
                    </h1>
                </section>
                <div className="flex items-center w-full">
                    <button
                        onClick={handleSaveAll}
                        className="w-2/3 bg-green-600 hover:bg-green-700 font-bold transition-all">Save all</button>
                    <button
                        onDoubleClick={handleDeleteAccount}
                        className="w-1/3 bg-red-500 hover:bg-red-600 font-bold transition-all">Remove</button>

                </div>
            </div>
        </article>
    )
}

export default UserDataPanel
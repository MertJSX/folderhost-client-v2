import { FaFolder, FaFileAlt } from "react-icons/fa"
import moment from "moment";

const RecoveryRecordInfo = ({ recordInfo }) => {
    const logoSize = 70;
    return recordInfo && (
        <article className="flex flex-col items-center justify-center w-1/3 mx-auto min-w-[320px] max-w-[30%] min-h-[600px] h-[700px] max-h-[800px]">
            <div className="flex flex-col bg-gray-700 items-center justify-center gap-3 rounded-xl shadow-2xl w-full h-auto p-4 min-h-[400px]">
                {recordInfo.isDirectory ?
                    <FaFolder size={logoSize} className='mx-2' /> : <FaFileAlt size={logoSize} className='mx-2' />
                }
                <h1 className="text-xl text-yellow-200">{recordInfo.oldLocation}</h1>
                <h1 className="text-lg text-green-300">
                    {recordInfo.sizeDisplay}
                </h1>
                <h1 className="text-sm text-gray-300">Location: 
                    <span className="text-yellow-200"> {recordInfo.binLocation}</span>
                </h1>
                <h1 className="text-sm text-gray-300">Deleted by:
                    <span className="text-green-300"> {recordInfo.username}</span>
                </h1>
                <h1 className="text-base text-gray-400">
                    {moment(recordInfo.created_at).format("Do MMMM YYYY HH:mm")}
                </h1>
                <button className="w-full rounded-2xl bg-green-600 hover:bg-green-500 font-bold transition-all">Recover item</button>
            </div>
        </article>
    )
}

export default RecoveryRecordInfo
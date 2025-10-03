import { useCallback, useEffect, useState, useRef } from "react"
import Header from "../../components/Header/Header"
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance"
import { FaFolder, FaFileAlt, FaTrash, FaSync } from "react-icons/fa";
import RecoveryRecordInfo from "../../components/Recovery/RecoveryRecordInfo";
import { type RecoveryRecord } from "../../types/RecoveryRecord";
import MessageBox from "../../components/MessageBox/MessageBox";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { FaArrowRotateLeft } from "react-icons/fa6";

const Recovery: React.FC = () => {
    const [recoveryRecords, setRecoveryRecords] = useState<Array<RecoveryRecord>>([]);
    const [recordInfo, setRecordInfo] = useState<RecoveryRecord | null>(null);
    const [loadIndex, setLoadIndex] = useState<number>(1);
    const [isError, setIsError] = useState<boolean>(false);
    const [isEmpty, setIsEmpty] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("")
    const logoSize = 20;

    useEffect(() => {
        getRecoveryRecords()
    }, [])

    const getRecoveryRecords = useCallback((reset: boolean = false) => {
        let page: number = reset ? 1 : loadIndex;
        if (loadIndex == 0 && !reset) {
            return
        }
        setRecordInfo(null);
        if (reset) {
            setRecoveryRecords([])
        }
        setIsLoading(true)
        axiosInstance.get(`/recovery?page=${page}`).then((data) => {
            setIsLoading(false)
            if (!data.data.records) {
                setIsEmpty(true)
                setRecoveryRecords([])
                return
            }
            if (data.data.isLast != true) {
                setLoadIndex(loadIndex + 1)
            } else {
                setLoadIndex(0)
            }
            if (!reset) {
                setRecoveryRecords(prev => [...prev, ...data.data.records])
            } else {
                setRecoveryRecords(data.data.records)
            }
        }).catch((error) => {
            setIsLoading(false)
            setIsError(true)
            setLoadIndex(0)
            console.log(error);
            
            if (error.response.data.err) {
                setMessage(error.response.data.err)
                return
            }
            setMessage("Unknown error while trying to recover a record.")
        })
    }, [loadIndex])

    const handleRecoverRecord = useCallback(() => {
        setIsLoading(true)
        axiosInstance.put(`/recovery/recover?id=${recordInfo?.id}`).then((data) => {
            setIsLoading(false)
            setIsError(false)
            setMessage(data.data.res)
            getRecoveryRecords(true)
        }).catch((error) => {
            setIsLoading(false)
            setIsError(true)
            if (error.response.data.err) {
                setMessage(error.response.data.err)
                return
            }
            setMessage("Unknown error while trying to recover a record.")
        })
    }, [recordInfo])

    const handleRemoveRecord = useCallback(() => {
        setIsLoading(true)
        axiosInstance.delete(`/recovery/remove?id=${recordInfo?.id}`).then((data) => {
            setIsLoading(false)
            setIsError(false)
            setMessage(data.data.res)
            getRecoveryRecords(true)
        }).catch((error) => {
            setIsLoading(false)
            setIsError(true)
            setIsEmpty(true)
            if (error.response.data.err) {
                setMessage(error.response.data.err)
                return
            }
            setMessage("Unknown error while trying to recover a record.")
        })
    }, [recordInfo])

    const handleClearRecords = useCallback(() => {
        if (!window.confirm("Are you sure you want to clear all recovery records? This action cannot be undone.")) {
            return;
        }
        setIsLoading(true)
        axiosInstance.delete("/recovery/clear").then((data) => {
            setIsLoading(false)
            setIsError(false)
            setMessage(data.data.res)
            getRecoveryRecords(true)
        }).catch((error) => {
            setIsLoading(false)
            setIsError(true)
            if (error.response.data.err) {
                setMessage(error.response.data.err)
                return
            }
            setMessage("Unknown error while trying to recover a record.")
        })
    }, [recordInfo])

    return (
        <div>
            <Header />
            <MessageBox message={message} isErr={isError} setMessage={setMessage} />
            <main className="mt-10">
                <div className="flex flex-row justify-center gap-6 px-6">
                    <section className="flex flex-col bg-gray-700 gap-4 w-3/5 max-w-4xl p-6 min-w-[600px] min-h-[600px] h-[700px] max-h-[800px] shadow-2xl rounded-lg">
                        {/* Header Section */}
                        <div className="flex justify-between items-center">
                            <h1 className="flex text-2xl items-center gap-2">
                                <FaArrowRotateLeft className="text-blue-400" /> 
                                Recovery Bin
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="text-base text-gray-400">
                                    Records: {recoveryRecords.length}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <section className="flex gap-3">
                            <button
                                onClick={handleClearRecords}
                                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors flex-1 min-w-[120px]"
                                title="Clear all recovery records"
                                disabled={recoveryRecords.length === 0}
                            >
                                <FaTrash className="text-sm" />
                                Clear All
                            </button>
                            <button
                                onClick={() => getRecoveryRecords(true)}
                                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded transition-colors flex-1 min-w-[120px]"
                                title="Refresh recovery records"
                            >
                                <FaSync className="text-sm" />
                                Refresh
                            </button>
                        </section>

                        <hr className="border-gray-600" />

                        {/* Records List */}
                        <section className="flex flex-col gap-3 overflow-y-auto flex-1 pr-2">
                            {recoveryRecords[0] ? (
                                recoveryRecords.map((record) => (
                                    <article
                                        onClick={() => setRecordInfo(record)}
                                        key={record.id}
                                        className={`flex items-center p-3 bg-gray-600 rounded border-2 cursor-pointer transition-all hover:border-blue-400 hover:translate-x-1 ${
                                            recordInfo?.id === record.id 
                                                ? 'border-blue-500 bg-gray-500' 
                                                : 'border-gray-600'
                                        }`}
                                    >
                                        {record.isDirectory ? (
                                            <FaFolder size={logoSize} className='mx-3 text-blue-400' />
                                        ) : (
                                            <FaFileAlt size={logoSize} className='mx-3 text-gray-300' />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-green-200 font-medium truncate">
                                                {record.oldLocation}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {moment(record.created_at).format("Do MMMM YYYY HH:mm")}
                                            </div>
                                        </div>
                                        <div className="text-right text-gray-300 whitespace-nowrap ml-4">
                                            {record.sizeDisplay}
                                        </div>
                                    </article>
                                ))
                            ) : null}

                            {/* Load More Button */}
                            {loadIndex > 0 && !isEmpty && !isLoading && (
                                <button 
                                    onClick={() => getRecoveryRecords()}
                                    className="bg-gray-600 hover:bg-gray-500 py-2 rounded transition-colors"
                                >
                                    Load More Records
                                </button>
                            )}

                            {/* Empty State */}
                            {isEmpty && !isLoading && (
                                <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                                    <FaFolder size={48} className="mb-4 opacity-50" />
                                    <h1 className="text-lg">Recovery bin is empty</h1>
                                    <p className="text-sm mt-2">Deleted items will appear here</p>
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading && <LoadingComponent />}
                        </section>
                    </section>

                    {/* Record Info Panel */}
                    {recordInfo && (
                        <RecoveryRecordInfo
                            handleRecoverRecord={handleRecoverRecord}
                            handleDeleteRecord={handleRemoveRecord}
                            recordInfo={recordInfo}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

export default Recovery
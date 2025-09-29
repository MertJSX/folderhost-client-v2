import { useCallback, useEffect, useState, useRef } from "react"
import Header from "../../components/Header/Header"
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance"
import { FaFolder } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
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
        setRecoveryRecords([])
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
            }
            setRecoveryRecords(data.data.records)
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
                <div className="flex flex-row">
                    <section className="flex flex-col resize overflow-auto bg-gray-700 gap-3 w-3/5 mx-auto p-4 min-w-[600px] min-h-[600px] h-[700px] max-h-[800px] shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h1 className="flex text-2xl items-center gap-2"><FaArrowRotateLeft /> Recovery</h1>
                            <h1 className="text-base text-gray-400">Records: {recoveryRecords.length}</h1>
                        </div>
                        <section className="w-full flex gap-2">
                            <button
                                onDoubleClick={handleClearRecords}
                                className="bg-red-500 hover:bg-red-600 w-1/6"
                            >Clear all</button>
                            <button
                                onClick={() => { getRecoveryRecords(true) }}
                                className="bg-sky-600 hover:bg-sky-500 w-5/6"
                            >Refresh</button>
                        </section>
                        <hr  />
                        <section className="flex flex-col gap-2 overflow-hidden overflow-y-auto h-[100%]">
                            {
                                recoveryRecords[0] ? recoveryRecords.map((record) => (
                                    <article
                                        onClick={() => {
                                            setRecordInfo(record)
                                        }}
                                        key={record.id}
                                        className="flex flex-row items-center p-2 bg-gray-600 border-gray-600 border-2 hover:border-sky-300 cursor-pointer transition-all hover:translate-x-1"
                                    >
                                        {
                                            record.isDirectory ?
                                                <FaFolder size={logoSize} className='mx-2' /> : <FaFileAlt size={logoSize} className='mx-2' />
                                        }
                                        <div className="w-1/3 text-lg text-green-200">{record.oldLocation}</div>
                                        <div className="w-1/3 text-sm text-center text-gray-400">{moment(record.created_at).format("Do MMMM YYYY HH:mm")}</div>
                                        <div className="w-1/3 text-right text-gray-300">{record.sizeDisplay}</div>
                                    </article>
                                )) : null
                            }
                            {
                                loadIndex > 0 && !isEmpty && !isLoading ?
                                    <button onClick={() => {
                                        setLoadIndex(loadIndex + 1)
                                        getRecoveryRecords()
                                    }}>Load more</button> : null
                            }
                            {
                                isEmpty && !isLoading ?
                                <h1 className="text-lg text-center">Recovery is empty</h1> : isLoading ? 
                                <LoadingComponent /> : null
                            }
                        </section>
                    </section>
                    {
                        recordInfo &&
                        <RecoveryRecordInfo
                            handleRecoverRecord={handleRecoverRecord}
                            handleDeleteRecord={handleRemoveRecord}
                            recordInfo={recordInfo} />
                    }
                </div>

            </main>
        </div>
    )
}

export default Recovery
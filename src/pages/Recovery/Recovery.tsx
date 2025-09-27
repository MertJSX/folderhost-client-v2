import { useCallback, useEffect, useState } from "react"
import Header from "../../components/Header/Header"
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance"
import { FaFolder } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import RecoveryRecordInfo from "../../components/Recovery/RecoveryRecordInfo";
import { type RecoveryRecord } from "../../types/RecoveryRecord";
import MessageBox from "../../components/MessageBox/MessageBox";

const Recovery: React.FC = () => {
    const [recoveryRecords, setRecoveryRecords] = useState<Array<RecoveryRecord>>([]);
    const [recordInfo, setRecordInfo] = useState<RecoveryRecord | null>(null);
    const [loadIndex, setLoadIndex] = useState<number>(1)
    const [isError, setIsError] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("")
    const logoSize = 20;
    useEffect(() => {
        getRecoveryRecords()
    }, [])

    const getRecoveryRecords = useCallback((reset: boolean = false) => {
        if (reset) {
            setLoadIndex(1)
            setRecoveryRecords([])
            axiosInstance.get(`/recovery?page=1`).then((data) => {
                console.log(data.data);
                if (!data.data.records[0]) {
                    return
                }
                if (data.data.isLast != true) {
                    setLoadIndex(loadIndex + 1)
                } else {
                    setLoadIndex(0)
                }
                setRecoveryRecords(prev => [...prev, ...data.data.records])
            }).catch((error) => {
                setIsError(true)
                if (error.response.data.err) {
                    setMessage(error.response.data.err)
                    return
                }
                setMessage("Unknown error while trying to recover a record.")
            })
            return
        }
        axiosInstance.get(`/recovery?page=${loadIndex}`).then((data) => {
            console.log(data.data);
            if (!data.data.records[0]) {
                return
            }
            if (data.data.isLast != true) {
                setLoadIndex(loadIndex + 1)
            } else {
                setLoadIndex(0)
            }
            setRecoveryRecords(prev => [...prev, ...data.data.records])
        }).catch((error) => {
            setIsError(true)
            if (error.response.data.err) {
                setMessage(error.response.data.err)
                return
            }
            setMessage("Unknown error while trying to recover a record.")
        })
    }, [loadIndex])

    const handleRecoverRecord = useCallback(() => {
        axiosInstance.get(`/recover-item?id=${recordInfo?.id}`).then((data) => {
            setIsError(false)
            setMessage(data.data.res)
            getRecoveryRecords(true)
        }).catch((error) => {
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
                                loadIndex > 0 ?
                                    <button onClick={() => {
                                        setLoadIndex(loadIndex + 1)
                                        getRecoveryRecords()
                                    }}>Load more</button> : null
                            }
                        </section>
                    </section>
                    {
                        recordInfo && <RecoveryRecordInfo handleRecoverRecord={handleRecoverRecord} recordInfo={recordInfo} />
                    }
                </div>

            </main>
        </div>
    )
}

export default Recovery
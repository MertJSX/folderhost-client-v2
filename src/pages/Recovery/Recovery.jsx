import { useEffect } from "react"
import Header from "../../components/Header/Header"
import axios from "axios"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import Cookies from "js-cookie"

const Recovery = () => {
    useEffect(() => {
        getRecoveryRecords()
    }, [])
    function getRecoveryRecords() {
        axios.get(`${API_BASE_URL}/api/recovery?page=1`, {
            headers: {
                'Authorization': Cookies.get("token")
            }
        }).then((data) => {
            console.log(data.data);
        })
    }
    return (
        <div>
            <Header />
            <h1>Recovery</h1>
        </div>
    )
}

export default Recovery
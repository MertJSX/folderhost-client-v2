import UploadFileComp from '../../components/UploadFileComponent/UploadFileComp';
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import convertBytesToString from '../../utils/convertBytesToString';
import axiosInstance from '../../utils/axiosInstance';

const UploadFile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(params.path);
  const [file, setFile] = useState();
  const [res, setRes] = useState("");
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!Cookies.get("ip") && !Cookies.get("token")) {
      navigate("/login");
    }
  }, [])

  useEffect(() => {
    setRes("");
    setErr("");
    setUploadProgress(0);
    setUploading(false)
  }, [file])

  async function uploadFile() {
    const chunkSize = 5 * 1024 * 1024; // 5 MB
    const totalChunks = Math.ceil(file.size / chunkSize)
    const progressIndex = 100 / totalChunks;
    const fileID = Date.now().toString();
    const fileName = file.name;

    setRes("");
    setErr("");
    setUploadProgress(0);
    for (let i = 0; i < totalChunks; i++) {
      console.log("Sending chunk "+i);
      
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      let formData = new FormData();
      formData.append('file', chunk)
      formData.append('chunkIndex', i)
      formData.append('totalChunks', totalChunks)
      formData.append('fileID', fileID)
      formData.append('fileName', fileName)

      await axiosInstance.post(`/upload?path=${path.slice(1)}`, formData)
        .then((data) => {
          setUploadProgress((prev) => prev + progressIndex)
          
          if (data.data.response && !data.data.uploaded) {
            setRes(`Uploading ${convertBytesToString(chunkSize * i)} / ${convertBytesToString(file.size)}`)
          }
          if (data.data.uploaded) {
            setRes(data.data.response)
            setUploadProgress(100);
          }
        }).catch((err) => {
          console.error(err);
          if (err.response) {
            console.error(err.response);
            setErr(err.response.data.err)
          }
        })
    }


    setUploadProgress(100)

    setTimeout(() => {
      setUploadProgress(0)
    }, 1000);

    setUploading(false)

  }

  return (
    <div>
      <UploadFileComp
        setFile={setFile}
        uploadFile={uploadFile}
        response={res}
        error={err}
        uploadProgress={uploadProgress}
        path={path}
        uploading={uploading}
        setUploading={setUploading}
      />
    </div>
  )
}

export default UploadFile
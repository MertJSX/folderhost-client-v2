import UploadFileComp from '../../components/UploadFileComponent/UploadFileComp';
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

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
  },[file])

  function uploadFile() {
    let formData = new FormData();
    formData.append('file', file)
    setRes("");
    setErr("");
    setUploadProgress(0);
    axios.post(`${Cookies.get("ip")}/api/upload?path=${path.slice(1)}`, formData, {
      headers: {
        'token': Cookies.get("token")
      },
      onUploadProgress: (progressEvent) => {
        console.log(progressEvent);
        
        if (progressEvent.progress === 1) {
          return;
        }
        let progress = progressEvent.progress.toString();
        progress = progress.split('.')[1]; // Noktadan sonraki kısmı al
        progress = progress.substring(0, 2);
        setUploadProgress(progress)
      }
    })
      .then((data) => {
        setTimeout(() => {
          setUploadProgress(100);
        }, 1000);
        console.log(data);
        setUploading(false)
        if (data.data.response) {
          setRes(data.data.response)
        }
        setTimeout(() => {
          setRes("");
        }, 3000);
      }).catch((err) => {
        console.error(err);
        if (err.response) {
          console.error(err.response);
          setErr(err.response.data.err)
        }
      })
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
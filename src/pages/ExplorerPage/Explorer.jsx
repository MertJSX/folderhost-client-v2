import Header from '../../components/Header/Header';
import FileExplorer from '../../components/FileExplorer/FileExplorer';
import OptionsBar from '../../components/Options/OptionsBar';
import ItemInfo from '../../components/DirItemInfo/ItemInfo';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from "axios";
import fileDownload from 'js-file-download';
import { useParams, useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import io from 'socket.io-client';

const ExplorerPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(params.path);
  const [permissions, setPermissions] = useState({});
  const [showDisabled, setShowDisabled] = useState(Cookies.get("show-disabled"));
  const [directory, setDir] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [directoryInfo, setDirectoryInfo] = useState({})
  const [itemInfo, setItemInfo] = useState({});
  const [response, setRes] = useState("");
  const [error, setError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [unzipProgress, setUnzipProgress] = useState(0)
  const [connected, setConnected] = useState(false);
  const socket = useRef();
  // Work states
  const [downloading, setDownloading] = useState(false);
  const [unzipping, setUnzipping] = useState(false);
  const [waitingResponse, setWaitingResponse] = useState(false);
  const apiBaseURL = API_BASE_URL; 

  function getParent(filePath) {
    let lastIndex = filePath.lastIndexOf('/');
    if (lastIndex === -1) return filePath;

    let item = filePath.slice(0, lastIndex);

    if (item.length > 1) {
      return item;
    } else {
      return filePath.slice(0, lastIndex + 1);
    }
  }

  useEffect(() => {
    navigate(`/explorer/${encodeURIComponent(path)}`, { replace: true });
  }, [path])

  useEffect(() => {
    if (Cookies.get("token")) {
      readDir()
      // if (!connected) {
      //   socket.current = io(apiBaseURL, { auth: { token: Cookies.get("token") } });
      //   setConnected(true)
      //   socket.current.on('connect_error', (err) => {
      //     console.error("Socket connect error");
      //     setTimeout(() => {
      //       setError(`Socket: ${err.message}`)
      //       setTimeout(() => {
      //         setError("")
      //       }, 5000);
      //     }, 3000);
      //   });

      //   socket.current.on('connect', () => {
      //     console.log('Connected to the server!');

      //     socket.current.on('unzip-progress', (res) => {
      //       setUnzipProgress(res.progress);
      //     });

      //     socket.current.on('unzip-completed', (res) => {
      //       setUnzipping(false);
      //       setUnzipProgress(100)
      //       setTimeout(() => {
      //         setUnzipProgress(0)
      //         readDir()
      //       }, 3000);
      //     });

      //     socket.current.on('error', (res) => {
      //       console.error(res);
      //       setError(res.err)
      //       setTimeout(() => {
      //         setError("")
      //       }, 5000);
      //     });

      //     socket.current.on('disconnect', (reason) => {
      //       console.warn(`Disconnected from the server: ${reason}`);
      //       if (reason !== "transport close") {
      //         socket.current = null;
      //       }
      //     });
      //   });
      // }
    } else {
      navigate("/login")
    }
  }, [])

  function declareError(error, client = true) {
    if (client) {
      setError(`Client: ${error}`);
    } else {
      setError(error);
    }
    setTimeout(() => {
      setError("")
    }, 5000);
  }

  function handleError(err, isErrorData) {
    setWaitingResponse(false);
    if (isErrorData && err.err) {
      declareError(err.err)
      return
    }
    if (isErrorData) {
      declareError("Unknown error!")
      return
    }
    if (err.response) {
      declareError(err.response.data.err)
    } else {
      declareError("Cannot connect to the server!")
    }
  }

  function waitPreviousAction() {
    setError("You should wait!")
    setTimeout(() => {
      setError("")
    }, 3000);
  }

  function moveItem(oldPath, newPath) {
    if (downloading || waitingResponse || unzipping) {
      waitPreviousAction();
      return
    } else {
      setWaitingResponse(true);
    }
    axios.post(`${apiBaseURL}/api/rename?oldFilepath=${oldPath.slice(1)}&newFilepath=${newPath.slice(1)}&type=move`,
      { token: Cookies.get("token") })
      .then((data) => {
        setWaitingResponse(false)
        readDir();
      }).catch((err) => {
        handleError(err)
      })
  }

  function renameItem(item, newName) {
    if (downloading || waitingResponse || unzipping) {
      waitPreviousAction();
      return
    } else {
      setWaitingResponse(true);
    }
    let oldPath = item.path.slice(1);
    let newPath = `${getParent(item.path.slice(0, -1))}`; // /${newName}
    if (newPath.slice(-1) === "/") {
      newPath = newPath + newName
    } else {
      newPath = newPath + "/" + newName
    }
    axios.post(`${apiBaseURL}/api/rename?oldFilepath=${oldPath}&newFilepath=${newPath.slice(1)}&type=rename`,
      { token: Cookies.get("token") })
      .then((data) => {
        setWaitingResponse(false)
        if (item.isDirectory) {
          if (item.path === `${path}/`) {
            readDir(false, newPath)

          } else {
            readDir()
          }
        } else {
          readDir()
        }
      }).catch((err) => {
        handleError(err)
      })
  }

  function downloadFile(filepath) {
    if (downloading || waitingResponse || unzipping) {
      waitPreviousAction();
      return
    } else {
      setDownloading(true);
    }
    axios.post(`${apiBaseURL}/api/download?filepath=${filepath.slice(1)}`,
      { token: Cookies.get("token") },
      {
        responseType: "blob",
        onDownloadProgress: (
          progressEvent) => {
          if (progressEvent.progress === 1) {
            return;
          }
          let progress = progressEvent.progress.toString();
          progress = progress.split('.')[1]; // Noktadan sonraki kısmı al
          progress = progress.substring(0, 2);
          setDownloadProgress(Number(progress));
        }
      }).then((data) => {
        setDownloading(false)
        setTimeout(() => {
          setDownloadProgress(100);
        }, 1000);
        setTimeout(() => {
          setDownloadProgress(0);
        }, 5000);
        fileDownload(data.data, itemInfo.name)
      }).catch((err) => {
        setDownloading(false);

        const reader = new FileReader();
        reader.onload = function (event) {
          const jsonData = JSON.parse(event.target.result);
          handleError(jsonData, true)

        };
        reader.readAsText(err.response.data);

        // handleError(errorData, true);
      })
  }

  function deleteItem(item) {
    if (downloading || waitingResponse || unzipping) {
      waitPreviousAction();
      return
    } else {
      setWaitingResponse(true);
    }
    let newPath = `${getParent(item.path.slice(0, -1))}`;
    axios.post(`${apiBaseURL}/api/delete?path=${item.path.slice(1)}`,
      { token: Cookies.get("token") }
    ).then((data) => {
      setWaitingResponse(false)
      if (item.isDirectory) {
        if (item.path === `${path}/`) {
          readDir(false, newPath)

        } else {
          readDir()
        }
      } else {
        readDir()
      }

      if (data.data.response) {
        setRes(data.data.response)
        setTimeout(() => {
          setRes("")
        }, 5000);
      }

    }).catch((err) => {
      handleError(err)
    })
  }

  function createCopy(item) {
    if (downloading || waitingResponse || unzipping) {
      waitPreviousAction();
      return
    } else {
      setWaitingResponse(true);
    }
    axios.post(`${apiBaseURL}/api/create-copy?path=${item.path.slice(1)}`,
      { token: Cookies.get("token") }
    ).then((data) => {
      setWaitingResponse(false)
      readDir()
      if (data.data.response) {
        setRes(data.data.response)
        setTimeout(() => {
          setRes("")
        }, 5000);
      }
    }).catch((err) => {
      handleError(err)
    })
  }

  function createItem(itempath, itemType, itemName) {
    if (downloading || waitingResponse || unzipping) {
      waitPreviousAction();
      return
    } else {
      setWaitingResponse(true);
    }
    axios.post(`${apiBaseURL}/api/write-file?path=${itempath.slice(1)}&type=create`, {
      itemType: itemType,
      itemName: itemName,
      token: Cookies.get("token")
    })
      .then((data) => {
        setWaitingResponse(false)
        readDir()

        if (data.data.response) {
          setRes(data.data.response)
          setTimeout(() => {
            setRes("")
          }, 5000);
        }

      }).catch((err) => {
        handleError(err)
      })
  }

  function readDir(asParentPath, pathInput) {
    setWaitingResponse(false);
    setDownloading(false);
    if (asParentPath && path !== "./") {
      setPath(getParent(path));
      setIsEmpty(false)
      setDir([]);
      setRes("");
      axios.post(apiBaseURL + `/api/read-dir?folder=${getParent(path).slice(1)}&mode=${Cookies.get("mode") || "Optimized mode"}`,
        { token: Cookies.get("token") }
      )
        .then((data) => {
          console.log(data.data);
          
          setIsEmpty(data.data.isEmpty)
          setDir(data.data.data)
          setPermissions(data.data.permissions)
          setDirectoryInfo(data.data.directoryInfo)
          setItemInfo(data.data.directoryInfo)
        }).catch((err) => {
          handleError(err)
        })
      return;
    } else if (pathInput === undefined && !asParentPath) {
      setDir([]);
      setIsEmpty(false)
      setRes("");
      axios.post(apiBaseURL + `/api/read-dir?folder=${path.slice(1)}&mode=${Cookies.get("mode") || "Optimized mode"}`,
        { token: Cookies.get("token") }
      ).then((data) => {
        console.log(data.data);
        
        if (!data.data.data) {
          setRes(data.data.err)
          return;
        }
        setIsEmpty(data.data.isEmpty);
        setDir(data.data.data)
        setPermissions(data.data.permissions)
        setDirectoryInfo(data.data.directoryInfo)
        setItemInfo(data.data.directoryInfo);
      }).catch((err) => {
        handleError(err)
      })
      return;
    } else if (pathInput) {
      
      setDir([]);
      setIsEmpty(false)
      setRes("");
      axios.post(apiBaseURL + `/api/read-dir?folder=${pathInput.slice(1)}&mode=${Cookies.get("mode") || "Optimized mode"}`,
        { token: Cookies.get("token") }
      ).then((data) => {
        console.log(data.data);
        
        setPath(pathInput)
        setIsEmpty(data.data.isEmpty);
        setDir(data.data.data)
        setPermissions(data.data.permissions)
        setDirectoryInfo(data.data.directoryInfo)
        setItemInfo(data.data.directoryInfo)
      }).catch((err) => {
        handleError(err)
      })
    }
  }

  function startUnzipping() {
    if (downloading || waitingResponse || unzipping) {
      waitPreviousAction();
      return
    }
    if (socket !== null) {
      setUnzipping(true);
      socket.current.emit("unzip", {
        path: itemInfo.path.slice(1)
      })
    }
  }

  return (
    <div className='home-container'>
      <Header />
      <OptionsBar
        path={path}
        setPath={setPath}
        readDir={readDir}
        error={error}
        response={response}
        setShowDisabled={setShowDisabled}
      />
      <div className="flex flex-row w-full justify-center items-center flex-wrap">
        <FileExplorer
          directory={directory}
          setDirectory={setDir}
          setDir={setDir}
          itemInfo={itemInfo}
          setItemInfo={setItemInfo}
          isEmpty={isEmpty}
          readDir={readDir}
          path={path}
          response={response}
          moveItem={moveItem}
          getParent={getParent}
          directoryInfo={directoryInfo}
          downloading={downloading}
          unzipping={unzipping}
          waitingResponse={waitingResponse}
        />
        {
          Object.keys(itemInfo).length !== 0 ? (
            <ItemInfo
              itemInfo={itemInfo}
              setItemInfo={setItemInfo}
              renameItem={renameItem}
              downloadFile={downloadFile}
              downloadProgress={downloadProgress}
              deleteItem={deleteItem}
              createCopy={createCopy}
              path={path}
              createItem={createItem}
              unzipProgress={unzipProgress}
              permissions={permissions}
              showDisabled={showDisabled}
              startUnzipping={startUnzipping}
            />
          ) : null
        }
      </div>

    </div>
  )
}

export default ExplorerPage
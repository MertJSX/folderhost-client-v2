import { useEffect, useState, useRef, useContext } from 'react'
import moment from 'moment';
import { FaFolder } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { FaFileImage } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";
import { FaFileArchive } from "react-icons/fa";
import { FaHtml5 } from "react-icons/fa";
import { FaCss3 } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io";
import { IoMdArrowBack } from "react-icons/io";
import { FaFolderOpen } from "react-icons/fa6";
import { FaJava } from "react-icons/fa";
import { FaMusic } from "react-icons/fa";
import { BiMoviePlay } from "react-icons/bi";
import Cookies from 'js-cookie';
import convertToBytes from '../../utils/convertToBytes.js';
import ExplorerRightclickMenu from '../ExplorerRightclickMenu/ExplorerRightclickMenu.jsx';
import ExplorerContext from '../../utils/ExplorerContext.js';
import { type DirectoryItem } from '../../types/DirectoryItem.js';
import { type ExplorerContextType } from '../../types/ExplorerContextType.js';

const FileExplorer: React.FC = () => {
  const [draggedItem, setDraggedItem] = useState<DirectoryItem>();
  const [dropTarget, setDropTarget] = useState<string>("");
  const childElements = useRef([]);
  const previousDirRef = useRef<HTMLButtonElement>(null);
  const [selectedChildEl, setSelectedChildEl] = useState(null);
  const {
    directory, setDirectory, directoryInfo, moveItem, itemInfo, setItemInfo, isEmpty, readDir, getParent, response, downloading, unzipping, waitingResponse, contextMenu, setContextMenu
  } = useContext<ExplorerContextType>(ExplorerContext)

  useEffect(() => {
    console.log(`Is Empty: ${isEmpty}`);
    
  }, [isEmpty])

  function handleContextMenu(event, element) {
    event.preventDefault()
    if (!element) {
      setItemInfo(directoryInfo)
      setContextMenu({ show: true, x: event.pageX, y: event.pageY })
      return
    }
    if (!waitingResponse && !downloading && !unzipping) {
      setItemInfo(element);
      setContextMenu({ show: true, x: event.pageX, y: event.pageY })
    }
  }

  useEffect(() => {
    if (dropTarget) {
      moveItem(draggedItem.path, dropTarget)
      setDraggedItem(null);
      setDropTarget("");
    }
  }, [dropTarget])

  useEffect(() => {
    if (itemInfo?.id || itemInfo?.id === 0) {
      if (selectedChildEl !== null) {
        childElements.current[selectedChildEl].classList.remove("border-sky-300")
      }
      setSelectedChildEl(itemInfo.id);
    } else {
      console.log(childElements.current[0]);
      if (selectedChildEl !== null) {
        if (childElements.current[selectedChildEl].classList.contains("border-sky-300")) {
          childElements.current[selectedChildEl].classList.remove("border-sky-300")
        }
      }
      setSelectedChildEl(null)
    }
  }, [itemInfo])

  useEffect(() => {
    if (selectedChildEl !== null) {
      childElements.current[selectedChildEl].classList.add("border-sky-300")
    }
  }, [selectedChildEl])

  useEffect(() => {
    if (selectedChildEl !== null) {
      if (childElements.current[selectedChildEl].classList.contains("border-sky-300")) {
        childElements.current[selectedChildEl].classList.remove("border-sky-300")
      }
    }
    childElements.current = []
    setSelectedChildEl(null);
    directory.forEach((el) => {
      console.log(el);
    })
  }, [directory])

  function addToChildElements(e) {
    if (e && !childElements.current.includes(e)) {
      childElements.current.push(e);
    }
  }

  return (
    <div className='flex flex-col resize overflow-auto bg-gray-700 gap-3 w-3/5 mx-auto p-4 min-w-[600px] min-h-[600px] h-[700px] max-h-[800px] shadow-2xl'>
      <div className='flex gap-2'>
        {
          directory ?
            (
              <button
                className='bg-gray-600 w-auto flex flex-row items-center justify-center cursor-pointer p-1 pl-2 shadow-2xl select-none hover:opacity-90 rounded-full'
                ref={previousDirRef}
                onDragOver={(event) => {
                  event.preventDefault()
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedItem.isDirectory) {
                    let parentOfDir = draggedItem.parentPath;
                    parentOfDir = getParent(parentOfDir.slice(0, -1));
                    moveItem(draggedItem.path, parentOfDir)
                  } else {
                    moveItem(draggedItem.path, getParent(getParent(draggedItem.path)))
                  }
                }}
                onDragEnter={(event) => {
                  if (event.relatedTarget && previousDirRef.current.contains(event.relatedTarget as Node)) {
                    event.preventDefault()
                    return;
                  }
                  previousDirRef.current.classList.remove("border-gray-600")
                  previousDirRef.current.classList.add("border-emerald-400")
                }}
                onDragLeave={(event) => {
                  if (event.relatedTarget && previousDirRef.current.contains(event.relatedTarget as Node)) {
                    event.preventDefault()
                    return
                  }
                  if (previousDirRef.current.classList.contains("border-emerald-400")) {
                    previousDirRef.current.classList.remove("border-emerald-400")
                    previousDirRef.current.classList.add("border-gray-600")
                  }
                  console.log("Leave event!");
                }}
                onClick={() => {
                  readDir(true)
                }}
              >
                <IoMdArrowBack size={22} className='mx-2' />
              </button>
            ) : isEmpty ?
              (
                <button className='bg-gray-600 w-1/4 flex flex-row items-center justify-center cursor-pointer p-1 pl-2 shadow-2xl select-none hover:opacity-90'
                  onClick={() => {
                    readDir(true)
                  }}
                >
                  <FaFolder size={22} className='mx-2' />
                  <IoMdArrowBack size={22} className='mx-2' />
                </button>
              ) : null
        }
        {
          directoryInfo ?
            <div className='bg-gray-600 w-auto flex flex-row items-center justify-center cursor-pointer p-1 pl-2 shadow-2xl select-none hover:opacity-90'
              onClick={() => {
                setItemInfo(directoryInfo)
              }}
            >
              <FaFolderOpen size={22} className='mx-2' />
              <h1 className='text-base text-gray-300 mr-2'>{directoryInfo.name}</h1>
            </div> : null

        }
      </div>
      <hr className='h-px bg-sky-400 border-0' />
      <div className='flex gap-2 mb-0'>
        <h1
          className="bg-gray-600 text-center w-2/6 cursor-pointer hover:border-sky-400 border-t-2 border-gray-600"
          onClick={() => {
            let sortedItems = [...directory].sort((a, b) => a.name.localeCompare(b.name))
              .map((file, index) => ({
                ...file, id: index
              }))
            setDirectory(sortedItems)
          }}
        >Name</h1>
        <h1
          className="bg-gray-600 text-center w-2/6 cursor-pointer hover:border-sky-400 border-t-2 border-gray-600"
          onClick={() => {
            let sortedItems = [...directory].sort((a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime())
              .map((file, index) => ({
                ...file, id: index
              }))
            setDirectory(sortedItems)
          }}
        >Date</h1>
        <h1
          className="bg-gray-600 text-center w-2/6 cursor-pointer hover:border-sky-400 border-t-2 border-gray-600"
          onClick={() => {
            let sortedItems = [...directory].sort((a, b) => convertToBytes(b.size) - convertToBytes(a.size))
              .map((file, index) => ({
                ...file, id: index
              }))
            setDirectory(sortedItems);
          }}
        >Size</h1>
      </div>
      <div className='flex flex-col gap-2 overflow-hidden overflow-y-auto h-[100%]' onContextMenu={(e) => { handleContextMenu(e, null) }}>
        {contextMenu.show &&
          <ExplorerRightclickMenu
            x={contextMenu.x}
            y={contextMenu.y}
          />}
        {
          directory.length > 0 ?
            directory.map((element) => (
              <div
                ref={addToChildElements}
                className='bg-gray-600 file-explorer-item flex flex-row items-center cursor-pointer p-1 pl-2 shadow-2xl select-none border-2 border-gray-600 hover:border-l-cyan-500'
                draggable
                onDragStart={() => {
                  setDraggedItem(element);
                }}
                onDrop={(event) => {
                  if (childElements.current[element.id].classList.contains("border-emerald-400")) {
                    childElements.current[element.id].classList.remove("border-emerald-400")
                    childElements.current[element.id].classList.add("border-gray-600")
                  }
                  if (draggedItem.path === element.path) {
                    setDraggedItem(null);
                    return
                  }
                  console.log(event);
                  if (element.isDirectory) {
                    setDropTarget(element.path);
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                }}
                onDragEnd={() => {
                  document.body.style.cursor = 'default'
                }}
                onDragEnter={(event) => {
                  if (event.relatedTarget && childElements.current[element.id].contains(event.relatedTarget)) {
                    event.preventDefault()
                    return;
                  }
                  if (element.isDirectory) {
                    childElements.current[element.id].classList.remove("border-gray-600")
                    childElements.current[element.id].classList.add("border-emerald-400")
                  }
                }}
                onDragLeave={(event) => {
                  if (event.relatedTarget && childElements.current[element.id].contains(event.relatedTarget)) {
                    event.preventDefault()
                    return
                  }
                  if (childElements.current[element.id].classList.contains("border-emerald-400")) {
                    childElements.current[element.id].classList.remove("border-emerald-400")
                    childElements.current[element.id].classList.add("border-gray-600")
                  }
                  console.log("Leave event!");
                }}
                key={element.id}
                onClick={() => {
                  setContextMenu({ show: false, x: 0, y: 0 })
                  if (!waitingResponse && !downloading && !unzipping) {
                    setItemInfo(element);
                  }
                }}
                onContextMenu={(event) => {
                  event.stopPropagation();
                  handleContextMenu(event, element)
                }}
                onDoubleClick={() => {
                  if (element.isDirectory) {
                    readDir(false, element.path)
                  } else {
                    window.open(`/editor/${encodeURIComponent(element.path)}`, '_blank', 'rel=noopener noreferrer')
                  }
                }}
              >
                {
                  element.isDirectory ?
                    <FaFolder size={22} className='mx-2' />
                    : element.name.split(".").pop() === "png" ||
                      element.name.split(".").pop() === "jpg" ||
                      element.name.split(".").pop() === "jpeg" ?
                      <FaFileImage size={22} className='mx-2' />
                      : element.name.split(".").pop() === "pdf" ?
                        <FaFilePdf size={22} className='mx-2' />
                        : element.name.split(".").pop() === "mp3" ?
                          <FaMusic size={22} className='mx-2' />
                          : element.name.split(".").pop() === "mp4" ?
                            <BiMoviePlay size={22} className='mx-2' />
                            : element.name.split(".").pop() === "rar" ||
                              element.name.split(".").pop() === "zip" ?
                              <FaFileArchive size={22} className='mx-2' />
                              : element.name.split(".").pop() === "java" ||
                                element.name.split(".").pop() === "jar" ?
                                <FaJava size={22} className='mx-2' />
                                : element.name.split(".").pop() === "html" ?
                                  <FaHtml5 size={22} className='mx-2' />
                                  : element.name.split(".").pop() === "css" ?
                                    <FaCss3 size={22} className='mx-2' />
                                    : element.name.split(".").pop() === "js" ?
                                      <IoLogoJavascript size={22} className='mx-2' /> :
                                      <FaFileAlt size={22} className='mx-2' />
                }
                <h1 className='text-lg text-left text-wrap break-words w-1/3'>{element.name}</h1>
                <h1 className='text-sm text-left pl-10 mx-auto text-gray-400 w-1/3'>{moment(element.dateModified).format("Do MMMM YYYY HH:mm")}</h1>
                {
                  element.isDirectory && Cookies.get("mode") === "Quality mode" ?
                    <h1 className='text-base text-right text-gray-300 ml-auto mr-2 w-1/3'>
                      {element.size === "N/A" && Cookies.get("mode") === "Quality mode" ? "0 Bytes" : element.size}
                    </h1> : !element.isDirectory ?
                      <h1 className='text-base text-right text-gray-300 ml-auto mr-2 w-1/3'>
                        {
                          (element.size === "N/A" && Cookies.get("mode") === "Quality mode") || element.size === "N/A" ?
                            "0 Bytes" : element.size
                        }
                      </h1> : <h1 className='text-base text-right text-gray-300 ml-auto mr-2 w-1/3'>

                      </h1>
                }

              </div>
            )) : isEmpty ? (
              <div className='flex flex-row items-center cursor-default p-1 pl-2 shadow-2xl select-none'>
                <FaFolderOpen size={22} className='mx-2' />
                <h1 className='text-lg'>Empty folder</h1>
              </div>
            ) : <h1 className='text-2xl'>{response ? <span className='text-amber-200'>{response}</span> :
              (
                <div className='flex items-center justify-center'>
                  Loading
                  <img src='/loading2.gif' width={40} height={40} className='select-none' alt='' />
                </div>
              )}</h1>
        }
      </div>

    </div>
  )
}

export default FileExplorer
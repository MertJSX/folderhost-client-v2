import { useEffect, useState, useRef, useContext, useLayoutEffect } from 'react'
import moment from 'moment';
import {
  FaFolder,
  FaFileAlt,
  FaFileImage,
  FaFilePdf,
  FaFileArchive,
  FaHtml5,
  FaCss3,
  FaFolderOpen,
  FaJava,
  FaMusic,
  FaSort,
  FaSortUp,
  FaSortDown
} from "react-icons/fa";
import {
  IoLogoJavascript,
  IoMdArrowBack
} from "react-icons/io";
import {
  BiMoviePlay
} from "react-icons/bi";
import {
  MdExplore
} from 'react-icons/md';
import Cookies from 'js-cookie';
import convertToBytes from '../../utils/convertToBytes';
import ExplorerRightclickMenu from '../ExplorerRightclickMenu/ExplorerRightclickMenu';
import ExplorerContext from '../../utils/ExplorerContext';
import { type DirectoryItem } from '../../types/DirectoryItem';
import { type ExplorerContextType } from '../../types/ExplorerContextType';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import { RiAddLargeFill } from "react-icons/ri";

const FileExplorer: React.FC = () => {
  const [draggedItem, setDraggedItem] = useState<DirectoryItem | null>();
  const [dropTarget, setDropTarget] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const childElements = useRef<Array<HTMLDivElement>>([]);
  const previousDirRef = useRef<HTMLButtonElement | null>(null);
  const [selectedChildEl, setSelectedChildEl] = useState<number | null>(null);
  const directoryRef = useRef<HTMLDivElement | null>(null)
  const {
    path, directory, setDirectory, directoryInfo, moveItem, itemInfo, setItemInfo, readDir, getParent, setShowCreateItemMenu, downloading, permissions, unzipping, waitingResponse, contextMenu, setContextMenu, scrollIndex, isDirLoading: isLoading
  } = useContext<ExplorerContextType>(ExplorerContext)

  // File type icon mapping
  const getFileIcon = (element: DirectoryItem) => {
    if (element.isDirectory) {
      return <FaFolder size={20} className='text-blue-400' />;
    }

    const extension = element.name.split(".").pop()?.toLowerCase();
    const iconMap: { [key: string]: JSX.Element } = {
      'png': <FaFileImage size={20} className='text-green-400' />,
      'jpg': <FaFileImage size={20} className='text-green-400' />,
      'jpeg': <FaFileImage size={20} className='text-green-400' />,
      'pdf': <FaFilePdf size={20} className='text-red-400' />,
      'zip': <FaFileArchive size={20} className='text-yellow-400' />,
      'rar': <FaFileArchive size={20} className='text-yellow-400' />,
      'html': <FaHtml5 size={20} className='text-orange-400' />,
      'css': <FaCss3 size={20} className='text-blue-400' />,
      'js': <IoLogoJavascript size={20} className='text-yellow-300' />,
      'mp3': <FaMusic size={20} className='text-purple-400' />,
      'mp4': <BiMoviePlay size={20} className='text-purple-400' />,
      'java': <FaJava size={20} className='text-red-500' />,
      'jar': <FaJava size={20} className='text-red-500' />,
    };

    return iconMap[extension || ''] || <FaFileAlt size={20} className='text-gray-300' />;
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    let sortedItems = [...directory ?? []];

    switch (key) {
      case 'name':
        sortedItems.sort((a, b) =>
          direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        break;
      case 'date':
        sortedItems.sort((a, b) =>
          direction === 'asc'
            ? new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime()
            : new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
        );
        break;
      case 'size':
        sortedItems.sort((a, b) =>
          direction === 'asc'
            ? convertToBytes(a.size) - convertToBytes(b.size)
            : convertToBytes(b.size) - convertToBytes(a.size)
        );
        break;
    }

    setSortConfig({ key, direction });
    setDirectory(sortedItems.map((file, index) => ({ ...file, id: index })));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <FaSortUp className="text-blue-400" />
      : <FaSortDown className="text-blue-400" />;
  };

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement, MouseEvent>, element: DirectoryItem | null) {
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

  useLayoutEffect(() => {
    if (directoryRef.current && directory.length > 0) {
      directoryRef.current.scrollTop = scrollIndex.current;
    }
  }, [directory])

  useEffect(() => {
    if (dropTarget) {
      moveItem(draggedItem?.path, dropTarget)
      setDraggedItem(null);
      setDropTarget("");
    }
  }, [dropTarget])

  useEffect(() => {
    if (itemInfo?.id || itemInfo?.id === 0) {
      setSelectedChildEl(itemInfo.id);
    } else {
      setSelectedChildEl(null)
    }
  }, [itemInfo])

  useEffect(() => {
    childElements.current = []
    setSelectedChildEl(null);
  }, [directory])

  function addToChildElements(e: HTMLDivElement | undefined | null) {
    if (!e) return;
    if (e && !childElements.current.includes(e)) {
      childElements.current.push(e);
    }
  }

  const getDisplaySize = (element: DirectoryItem) => {
    if (element.isDirectory && Cookies.get("mode") !== "Quality mode") {
      return "";
    }
    if (element.size === "N/A" && (Cookies.get("mode") === "Quality mode" || !element.isDirectory)) {
      return "0 Bytes";
    }
    return element.size;
  };

  return (
    <div className='flex flex-col bg-gray-800 gap-4 overflow-auto rounded-xl shadow-2xl w-3/5 mx-auto max-w-6xl min-h-[700px] h-[700px] max-h-[800px] p-6'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500 rounded-lg">
            <MdExplore size={24} className="text-white" />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-white'>File Explorer</h1>
            <p className='text-gray-400'>Browse and manage your files</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className='flex gap-2'>
          {
            isLoading ? <LoadingComponent /> : null
          }
          {(directory && path != "./") && (
            <button
              className='flex items-center gap-2 bg-gray-700 hover:bg-gray-600 hover:border-gray-600 text-white p-3 rounded-lg transition-colors border-2 border-gray-700'
              ref={previousDirRef}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (previousDirRef.current?.classList.contains("border-emerald-400")) {
                  previousDirRef.current?.classList.remove("border-emerald-400")
                  previousDirRef.current?.classList.add("border-gray-600")
                }
                if (draggedItem?.isDirectory) {
                  let parentOfDir = draggedItem.parentPath;
                  parentOfDir = getParent(parentOfDir.slice(0, -1));
                  moveItem(draggedItem.path, parentOfDir)
                } else {
                  moveItem(draggedItem?.path, getParent(getParent(draggedItem?.path)))
                }
              }}
              onDragEnter={(event) => {
                if (event.relatedTarget && previousDirRef.current?.contains(event.relatedTarget as Node)) {
                  return;
                }
                previousDirRef.current?.classList.remove("border-gray-600")
                previousDirRef.current?.classList.add("border-emerald-400")
              }}
              onDragLeave={(event) => {
                if (event.relatedTarget && previousDirRef.current?.contains(event.relatedTarget as Node)) {
                  return;
                }
                previousDirRef.current?.classList.remove("border-emerald-400")
                previousDirRef.current?.classList.add("border-gray-600")
              }}
              onClick={() => readDir(true)}
              title="Go back"
            >
              <IoMdArrowBack size={18} />
            </button>
          )}

          {directoryInfo && (
            <button
              className='flex items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'
              onClick={() => setItemInfo(directoryInfo)}
              title="Current folder info"
            >
              <FaFolderOpen size={18} />
              <span className="max-w-[200px] truncate">{directoryInfo.name}</span>
            </button>
          )}
          {permissions?.create ? <button
              className='flex items-center gap-2 p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors'
              onClick={() => setShowCreateItemMenu(true)}
              title="Create a new item"
            >
              <RiAddLargeFill size={18} />
            </button> :
            <button
              className='flex items-center gap-2 opacity-60 cursor-not-allowed p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors'
              onClick={() => setShowCreateItemMenu(true)}
              title="No permission to create a new item"
              disabled
            >
              <RiAddLargeFill size={18} />
            </button>
            }
        </div>
      </div>

      <hr className="border-gray-500" />

      {/* Table Header */}
      <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-gray-700 rounded-lg'>
        <div className="col-span-1"></div>
        <button
          className="col-span-5 flex items-center gap-2 text-gray-300 font-semibold hover:text-white transition-colors"
          onClick={() => handleSort('name')}
        >
          Name {getSortIcon('name')}
        </button>
        <button
          className="col-span-3 flex items-center gap-2 text-gray-300 font-semibold hover:text-white transition-colors"
          onClick={() => handleSort('date')}
        >
          Modified {getSortIcon('date')}
        </button>
        <button
          className="col-span-3 flex items-center gap-2 text-gray-300 font-semibold hover:text-white transition-colors justify-end"
          onClick={() => handleSort('size')}
        >
          Size {getSortIcon('size')}
        </button>
      </div>

      {/* Files List */}
      <div
        ref={directoryRef}
        className='flex flex-col gap-1 overflow-y-auto p-2'
        onContextMenu={(e) => handleContextMenu(e, null)}
        onScroll={(e) => {
          if (directory.length > 0) {
            scrollIndex.current = e.currentTarget.scrollTop;
          }
        }}
      >
        {contextMenu.show && (
          <ExplorerRightclickMenu
            x={contextMenu.x}
            y={contextMenu.y}
          />
        )}

        {directory.length > 0 ? (
          directory.map((element) => (
            <div
              ref={addToChildElements}
              className={`grid grid-cols-12 gap-4 items-center p-1 bg-gray-700 rounded-lg border-2 transition-all cursor-pointer group
                ${selectedChildEl === element.id
                  ? 'border-gray-200'
                  : 'border-gray-600 hover:border-gray-400 hover:bg-gray-550'
                }`}
              draggable
              onDragStart={() => setDraggedItem(element)}
              onDrop={() => {
                if (childElements.current[element.id]?.classList.contains("border-emerald-400")) {
                  childElements.current[element.id]?.classList.remove("border-emerald-400")
                  childElements.current[element.id]?.classList.add("border-gray-600")
                }
                if (draggedItem?.path === element.path) {
                  setDraggedItem(null);
                  return
                }
                if (element.isDirectory) {
                  setDropTarget(element.path);
                }
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={(event) => {
                if (event.relatedTarget && childElements.current[element.id]?.contains(event.relatedTarget as Node)) {
                  return;
                }
                if (element.isDirectory) {
                  childElements.current[element.id]?.classList.remove("border-gray-600")
                  childElements.current[element.id]?.classList.add("border-emerald-400")
                }
              }}
              onDragLeave={(event) => {
                if (event.relatedTarget && childElements.current[element.id]?.contains(event.relatedTarget as Node)) {
                  return;
                }
                if (childElements.current[element.id]?.classList.contains("border-emerald-400")) {
                  childElements.current[element.id]?.classList.remove("border-emerald-400")
                  childElements.current[element.id]?.classList.add("border-gray-600")
                }
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
              {/* Icon */}
              <div className="col-span-1 flex justify-center">
                {getFileIcon(element)}
              </div>

              {/* Name */}
              <div className="col-span-5">
                <div className="text-white font-medium group-hover:text-cyan-200 transition-colors truncate">
                  {element.name}
                </div>
              </div>

              {/* Date */}
              <div className="col-span-3">
                <div className="text-gray-300 text-sm">
                  {moment(element.dateModified).format("MMM DD, YYYY")}
                </div>
                <div className="text-gray-400 text-xs">
                  {moment(element.dateModified).format("HH:mm")}
                </div>
              </div>

              {/* Size */}
              <div className="col-span-3 text-right">
                <div className="text-gray-300 text-sm font-medium">
                  {getDisplaySize(element)}
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FaFolderOpen size={64} className="mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Empty Folder</h2>
            <p className="text-center">This folder doesn't contain any files or folders</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileExplorer
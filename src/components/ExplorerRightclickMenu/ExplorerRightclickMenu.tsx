import { useContext } from "react"
import ExplorerContext from "../../utils/ExplorerContext"

interface ExplorerRightclickMenuProps {
    x: number, y: number
}

const ExplorerRightclickMenu: React.FC<ExplorerRightclickMenuProps> = ({ x, y }) => {
    const {itemInfo, permissions, showDisabled} = useContext(ExplorerContext)
    return (
        <div
            style={{ top: `${y}px`, left: `${x}px` }}
            className='flex flex-col items-start bg-gray-800 rounded-lg text-white p-1 fixed z-20 w-40'
        >
            {!itemInfo?.isDirectory ? (
                <>
                    {
                        permissions?.delete ?
                            <button
                                title='Double click to delete.'
                                className="w-[80%] p-2 text-left text-base transition-all hover:bg-slate-800 hover:translate-x-1 relative">
                                Delete
                            </button>
                            : showDisabled === true ?
                                <button
                                    disabled
                                    title="No permission"
                                    className="w-[80%] p-2 text-left text-base transition-all hover:bg-slate-800 hover:translate-x-1 relative opacity-50">
                                    Delete
                                </button>
                                : null
                    }

                    <button
                        className="w-[80%] p-2 text-left text-base transition-all hover:bg-slate-800 hover:translate-x-1 relative">
                        Download
                    </button>
                    <button
                        className="w-[80%] p-2 text-left text-base transition-all hover:bg-slate-800 hover:translate-x-1 relative">
                        Copy
                    </button>
                    <button
                        className="w-[80%] p-2 text-left text-base transition-all hover:bg-slate-800 hover:translate-x-1 relative">
                        Create copy
                    </button>
                    <button
                        className="w-[80%] p-2 text-left text-base transition-all hover:bg-slate-800 hover:translate-x-1 relative">
                        Open editor
                    </button>
                </>
            ) : null}


        </div>
    )
}

export default ExplorerRightclickMenu
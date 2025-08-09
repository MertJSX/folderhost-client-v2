
const UploadFileComp = ({ setFile, uploadFile, response, error, uploadProgress, path, uploading, setUploading }) => {
    return (
        <div className='flex flex-col w-1/2 mx-auto mt-40 gap-2 p-5 bg-gray-700'>
            <h1 className="text-center text-5xl font-extrabold text-sky-300 m-2">
                UPLOAD
            </h1>
            <h1 className="text-left text-2xl text-white">
                Upload path: <span className="font-mono text-sky-300 bg-gray-800 px-2 rounded-lg">{path}</span>
            </h1>
            <input
                type="file"
                onChange={(e) => {
                    setFile(e.target.files[0])
                }}
            />
            {!uploadProgress && !uploading ?
                <button
                    className='text-center bg-sky-500 text-2xl font-bold'
                    onClick={() => {
                        uploadFile();
                        setUploading(true);
                    }}
                >Upload</button> :
                <div>
                    <h1 className="text-center text-2xl">{uploadProgress === 100 ? "Uploaded" : "Uploading..."}</h1>
                    {
                        uploadProgress ? 
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
                        </div> : <h1 className='text-center text-2xl'>Please wait...</h1>
                    }
                </div>
            }
            {response ?
                <h1 className='text-center text-emerald-300'>
                    {response}
                </h1> : error ?
                    <h1 className='text-center text-red-300'>
                        {error}
                    </h1>
                    : null}
        </div>
    )
}

export default UploadFileComp
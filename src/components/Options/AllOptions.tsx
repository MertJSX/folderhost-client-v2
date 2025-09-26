import type React from 'react';
import ChangeMode from './ChangeMode.jsx';
import ShowDisabled from './ShowDisabled.jsx';

interface AllOptionsProps {
    isOpen: boolean,
    setShowDisabled: React.Dispatch<React.SetStateAction<boolean>>
}

const AllOptions: React.FC<AllOptionsProps> = ({ isOpen, setShowDisabled }) => {
    return (
        <>
            {isOpen ?
                <div className='flex flex-row flex-wrap justify-center'>
                   <ChangeMode />
                   <ShowDisabled setShowDisabled={setShowDisabled} />
                </div> :
                null
            }
        </>
    )
}

export default AllOptions
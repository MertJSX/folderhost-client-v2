import DropdownMenu from './DropdownMenu';
import ShowDisabled from './ShowDisabled';

const AllOptions = ({ isOpen, setShowDisabled }) => {
    return (
        <>
            {isOpen ?
                <div className='flex flex-row flex-wrap justify-center'>
                   <DropdownMenu />
                   <ShowDisabled setShowDisabled={setShowDisabled} />
                </div> :
                null
            }
        </>
    )


}

export default AllOptions
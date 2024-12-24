import AddIcon from "@components/ui/Icons/AddIcon.jsx";


function AddButton({className, text, handleClick}) {
    return (
        <button type="button" onClick={handleClick} className={`d-flex btn btn-primary align-items-center w-auto ${className}`}>
            <AddIcon size={17}/>
            {text}
        </button>
    )
}

export default AddButton;
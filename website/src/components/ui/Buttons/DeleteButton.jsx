import DeleteIcon from "@components/ui/Icons/DeleteIcon.jsx";

function DeleteButton({className, onClick}) {

    return (
        <button className={`btn btn-danger ${className}`}
                onClick={onClick}>
            <DeleteIcon/>
        </button>
    )
}

export default DeleteButton;


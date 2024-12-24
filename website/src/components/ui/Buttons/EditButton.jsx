import EditIcon from "@components/ui/Icons/EditIcon.jsx";
import styles from "./EditButton.module.scss"

function EditButton({className, onClick}) {

    return (
        <button className={`btn btn-primary  ${styles.editIcoBg} ${className}`}
                onClick={onClick}>
            <EditIcon/>
        </button>
    )
}

export default EditButton;


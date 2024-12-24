import CardElement from "@components/ui/GamePicker/CardElement/CardElement.jsx";
import AddButton from "@components/ui/Buttons/AddButton.jsx";
import React, {useContext, useState} from "react";
import ConfirmActionModal from "@components/ui/ConfirmCloseModal/ConfirmActionModal.jsx";
import AddCardMenu from "@components/ui/GamePicker/AddCardMenu/AddCardMenu.jsx";
import {GamePickerEditContext} from "@pages/game-picker-edit.jsx";
import {
    addChangedCard,
    changedCards,
    changedCardsKeys,
    changedCardsUnderKey,
    removeChangedCard
} from "@utils/game-picker-utils.js";
import EditButton from "@components/ui/Buttons/EditButton.jsx";
import DeleteButton from "@components/ui/Buttons/DeleteButton.jsx";


function editCard() {
    alert("editCard")
}

function EditableCardGrid() {
    const {tempCards, setTempCards, displayCards, setDisplayCards,} = useContext(GamePickerEditContext);
    const [deleteCardModal, setDeleteCardModal] = useState(false);
    const [addCardModal, setAddCardModal] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);


    // Add new card
    function onCardCreate(card) {
        setTempCards([card, ...tempCards]);
        addChangedCard(card, changedCardsKeys.NEW_CARDS);
    }

    // Initial click prompting modal
    const handleDeleteClick = (card) => {
        setCardToDelete(card);
        setDeleteCardModal(true);
    };

    // Delete confirmed on modal
    const handleConfirmDelete = () => {
        if (cardToDelete) deleteCard(cardToDelete);
        setDeleteCardModal(false);
        setCardToDelete(null);
    };

    // Delete card
    function deleteCard(cardToDelete) {
        if (changedCardsUnderKey(cardToDelete, changedCardsKeys.NEW_CARDS)) {
            removeChangedCard(cardToDelete, changedCardsKeys.NEW_CARDS);
            const newTempCards = tempCards.filter(card => JSON.stringify(card) !== JSON.stringify(cardToDelete));
            setTempCards(newTempCards);
        }
        else {
            addChangedCard(cardToDelete, changedCardsKeys.MARKED_FOR_DELETE);
            setDisplayCards();
        }
        const newDisplayCards = displayCards.filter(card => JSON.stringify(card) !== JSON.stringify(cardToDelete));
        setDisplayCards(newDisplayCards);

        console.log(tempCards)
        console.log(changedCards)
    }


    return (
        <div className="d-flex flex-row w-100">
            <div className="w-100 p-4 m-2 rounded row row-cols-4 g-3">
                {displayCards.map((gameCard, index) => (
                    <div className="me-2 w-auto" key={index}>
                        <CardElement gameCard={gameCard}>
                            <EditButton className={`me-2 p-1 ps-2 pe-2`} onClick={() => editCard(gameCard)}/>
                            <DeleteButton className={"p-1 ps-2 pe-2"} onClick={() => handleDeleteClick(gameCard)}/>
                        </CardElement>
                    </div>
                ))}
                <div className="me-3 w-auto">
                    <AddButton className={"h-100"} text={"Dodaj"} handleClick={() => {
                        setAddCardModal(true)
                    }}/>
                </div>
                <AddCardMenu show={addCardModal}
                             hide={() => {
                                 setAddCardModal(false)
                             }}
                             onCreate={onCardCreate}
                />

                <ConfirmActionModal show={deleteCardModal}
                                    handleConfirm={handleConfirmDelete}
                                    handleCancel={() => setDeleteCardModal(false)}
                                    handleClose={() => setDeleteCardModal(false)}
                                    headerText={`Czy na pewno chcesz usunąć ${cardToDelete?.name}?`}
                                    confirmText={"Usuń"}
                                    cancelText={"Anuluj"}
                />
            </div>
        </div>
    )
}

export default EditableCardGrid;

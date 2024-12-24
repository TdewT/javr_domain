import React, {useContext} from "react";
import CardElement from "@components/ui/GamePicker/CardElement/CardElement.jsx";
import {GamePickerContext} from "@pages/game-picker.jsx";

function CardGrid() {
    const {gameCards} = useContext(GamePickerContext);

    return (
        <div className="d-flex flex-row w-100">
            <div className="bg-info w-100 p-4 m-2 rounded row row-cols-4 g-3">
                {gameCards.map((gameCard, index) => (
                    <div className="me-2 w-auto" key={index}>
                        <CardElement gameCard={gameCard} key={index}/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CardGrid;
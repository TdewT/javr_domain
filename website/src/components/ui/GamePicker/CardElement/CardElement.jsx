import React from "react";
import styles from "./CardElement.module.scss"

function CardElement({gameCard, children}) {
    const childrenArray = React.Children.toArray(children);
    const lastChild = childrenArray.pop();
    return (
        <div className={`bg-amber w-auto p-2 rounded h-auto bg-color-aux d-flex align-items-center ${styles.cardContainer}`}>
            <span className="me-2">{gameCard.name}</span>
            {childrenArray.map((child, index) =>{
                return <span className="me-1" key={index}>{child}</span>
            })}
            <span>{lastChild}</span>
        </div>
    );
}

export default CardElement
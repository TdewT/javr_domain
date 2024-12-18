import CardElement from "@components/ui/CardGrid/CardElement.jsx";

export default function CardGrid({gameCards}) {
    return (
        <div className="d-flex flex-row w-100">
            <div className="bg-info w-100 p-4 m-2 rounded row row-cols-4 g-3">
                {gameCards.map((gameCard, index) => (
                    <CardElement gameCard={gameCard} key={index}></CardElement>
                ))}
            </div>
        </div>
    )
}
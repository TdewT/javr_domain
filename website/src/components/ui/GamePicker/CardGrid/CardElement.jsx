export default function CardElement({gameCard}) {
    return (
        <div className="bg-amber w-auto p-2 rounded h-auto bg-warning">{gameCard.name}</div>
    );
}
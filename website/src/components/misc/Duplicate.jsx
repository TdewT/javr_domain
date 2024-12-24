import React from "react";

const Duplicate = ({count, children, text}) => {
    return (
        <>
            {Array.from({length: count}).map((_, index) => (
                React.cloneElement(children, {key: index})
            ))}
        </>
    );
};

export default Duplicate;
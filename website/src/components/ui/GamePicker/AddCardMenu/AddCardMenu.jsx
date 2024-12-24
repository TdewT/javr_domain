import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AddCardMenu = ({ show, hide, onCreate }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const newGameCard = {
            name: form.elements.name.value,
            optimalPlayers: form.elements.optimalPlayers.value,
            maxPlayers: form.elements.maxPlayers.value,
            minPlayers: form.elements.minPlayers.value,
            icon: form.elements.icon.value,
        };
        onCreate(newGameCard);
        hide();
    };

    return (
        <Modal show={show} onHide={hide} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Create Game Card</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formGameCardName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" name="name" required />
                    </Form.Group>

                    <Form.Group controlId="formOptimalPlayers">
                        <Form.Label>Optimal Players</Form.Label>
                        <Form.Control type="number" name="optimalPlayers" required />
                    </Form.Group>

                    <Form.Group controlId="formMaxPlayers">
                        <Form.Label>Max Players</Form.Label>
                        <Form.Control type="number" name="maxPlayers" required />
                    </Form.Group>

                    <Form.Group controlId="formMinPlayers">
                        <Form.Label>Min Players</Form.Label>
                        <Form.Control type="number" name="minPlayers" required />
                    </Form.Group>

                    <Form.Group controlId="formIcon">
                        <Form.Label>Icon URL</Form.Label>
                        <Form.Control type="text" name="icon" required />
                    </Form.Group>

                    <div className="d-flex mt-3">
                        <Button variant="secondary" onClick={hide}>Cancel</Button>
                        <Button className="ms-auto" variant="primary" type="submit">Create</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddCardMenu;

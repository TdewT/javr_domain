import React from 'react';
import {Modal, Button} from 'react-bootstrap';

const ConfirmActionModal = ({
                                show,
                                handleClose,
                                handleCancel,
                                handleConfirm,
                                headerText,
                                contentText,
                                cancelText,
                                confirmText
                            }) => {
    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            {
                headerText ?
                    <Modal.Header closeButton>
                        <Modal.Title>{headerText}</Modal.Title>
                    </Modal.Header>
                    :
                    <></>
            }
            {
                contentText ?
                    <Modal.Body>{contentText}</Modal.Body>
                    :
                    <></>
            }
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancel}>
                    {cancelText}
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmActionModal;

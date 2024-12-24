import React, { useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastNotification = ({ show, onClose, headerText, bodyText, delay = 3000 }) => {
    return (
        <ToastContainer position="top-end" className="p-3">
            <Toast show={show} onClose={onClose} delay={delay} autohide>
                <Toast.Header>
                    <strong className="me-auto">{headerText}</strong>
                </Toast.Header>
                <Toast.Body>{bodyText}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default ToastNotification;

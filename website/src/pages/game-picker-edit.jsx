import UniversalHead from "@components/misc/UniversalHead.jsx";
import {useRouter} from "next/router";
import React, {createContext, useContext, useEffect, useState} from "react";
import ToastNotification from "@components/ui/ToastNotification.jsx";
import Footer from "@components/layout/Footer/Footer.jsx";
import NavBar from "@components/layout/Navbar/NavBar.jsx";
import styles from "@styles/game-picker.module.scss";
import {mainDivClass} from "@styles/global.bootstrap.js";
import ConfirmActionModal from "@components/ui/ConfirmCloseModal/ConfirmActionModal.jsx";
import EditableCardGrid from "@components/ui/GamePicker/EditableCardGrid/EditableCardGrid.jsx";
import {initGamePickerSocket, requestGameCardsData, sendGameCardsUpdate, socket} from "@utils/socket-util.js";
import {changedCards, clearChangedCards, exitEditPage} from "@utils/game-picker-utils.js";
import {Events} from "@server-lib/globals.js";
import objOfArraysEmpty from "@utils/general.js";

function submitUsersCards() {
    alert("submit")
}

function resetCards() {
    alert("reset")
}

function onPageClose (router, setCloseModal) {
    console.log(!objOfArraysEmpty(changedCards));
    if (!objOfArraysEmpty(changedCards)) setCloseModal(true);
    else exitEditPage(router);
}

function MainContent() {
    const {savedToast, setSavedToast, setCloseModal, closeModal, setTempCards} = useContext(GamePickerEditContext);
    const router = useRouter();

    function modalCancel(router) {
        exitEditPage(router)
    }

    function modalConfirm(router, setTempCards, setSavedToast) {
        saveCards(setSavedToast, setTempCards);
        exitEditPage(router);
    }

    function saveCards(setSavedToast, setTempCards) {
        // sendGameCardsUpdate(changedCards);
        socket.emit(Events.GAME_CARDS_UPDATE, changedCards);
        if (setSavedToast) setSavedToast(true);
        setTempCards([]);
        clearChangedCards();
    }

    return (
        <>
            <ConfirmActionModal show={closeModal}
                                handleConfirm={() => modalConfirm(router, setTempCards, setSavedToast)}
                                handleCancel={() => modalCancel(router)}
                                handleClose={() => {
                                    setCloseModal(false)
                                }}
                                headerText={"Masz niezapisane zmiany."}
                                contentText={"Czy chcesz zapisać zmiany?"}
                                confirmText={"Zapisz"}
                                cancelText={"Odrzuć"}
            />

            <div className="p-4">
                <div className="d-flex flex-column bg-color-main-transparent rounded min-vh-80 me-5 ms-5">
                    {/*Cards*/}
                    <div className="h-75 m-4 me-5 ms-5">
                        <EditableCardGrid/>
                    </div>

                    {/*Buttons*/}
                    <div className="d-flex me-5 ms-5 border-top border-dark mt-auto mb-4 ps-5 pe-5 pt-4">
                        <div>
                            <button className="btn text-white btn-danger w-100 pe-5 ps-5"
                                    onClick={() => {
                                        onPageClose(router, setCloseModal);
                                    }}>
                                Zamknij
                            </button>
                        </div>

                        <div className="ms-auto ">
                            <button className="btn text-white btn-success w-100 pe-5 ps-5"
                                    onClick={() => saveCards(setSavedToast, setTempCards)}>Zapisz
                            </button>
                        </div>
                    </div>

                    {/* Save Notification */}
                    <ToastNotification show={savedToast}
                                       headerText={"Powiadomienie."}
                                       bodyText={"Zmiany zostały zapisane."}
                                       onClose={() => {
                                           setSavedToast(false)
                                       }}
                    />
                </div>
            </div>
        </>
    )
}

export const GamePickerEditContext = createContext({});
export const GamePickerEditProvider = ({children}) => {
    const [gameCards, setGameCards] = useState([]);
    const [tempCards, setTempCards] = useState([]);
    const [displayCards, setDisplayCards] = useState([]);
    const [results, setResults] = useState([]);
    const [savedToast, setSavedToast] = useState(false);
    const [closeModal, setCloseModal] = useState(false);

    // Setup socket
    useEffect(() => {
        const cleanup = initGamePickerSocket(setGameCards, setResults);
        requestGameCardsData();
        return cleanup;
    }, []);

    useEffect(() => {
        setDisplayCards([...gameCards, ...tempCards]);
        // eslint-disable-next-line
    }, [gameCards, tempCards]);


    const value = {
        gameCards, setGameCards,
        tempCards, setTempCards,
        displayCards, setDisplayCards,
        results, setResults,
        savedToast, setSavedToast,
        closeModal, setCloseModal
    };

    return (
        <GamePickerEditContext.Provider value={value}>
            {children}
        </GamePickerEditContext.Provider>
    )
};

function GamePicker() {
    return (
        <>
            {/* Head */}
            <UniversalHead/>

            {/* Body */}
            <div className={`${styles.bgImgMain} ${mainDivClass}`}>
                <NavBar/>
                <GamePickerEditProvider>
                    <MainContent/>
                </GamePickerEditProvider>
            </div>

            {/* Footer */}
            <Footer/>
        </>
    );
}

export default GamePicker;

import UniversalHead from "@components/misc/UniversalHead.jsx";
import {useRouter} from "next/router";
import {createContext, useContext, useEffect, useState} from "react";
import ToastNotification from "@components/ui/ToastNotification.jsx";
import Footer from "@components/layout/Footer/Footer.jsx";
import NavBar from "@components/layout/Navbar/NavBar.jsx";
import styles from "@styles/game-picker.module.scss";
import {mainDivClass} from "@styles/global.bootstrap.js";
import CardGrid from "@components/ui/GamePicker/CardGrid.jsx";
import {initGamePickerSocket, requestGameCardsData} from "@utils/socket-util.js";
import {enterEditPage} from "@utils/game-picker-utils.js";


function MainContent() {
    const router = useRouter();
    const {savedToast, setSavedToast} = useContext(GamePickerContext);

    function goToEdit() {
        // noinspection JSIgnoredPromiseFromCall
        enterEditPage(router);
    }

    function submitUsersCards() {
        alert("submit")
    }

    function resetCards() {
        alert("reset")
    }

    return (
        <div className="p-4">
            <div className="d-flex flex-row w-100 min-vh-40">
                {[0, 1, 2].map(i => (
                    <div className="bg-success w-100 p-4 m-2 rounded" key={i}></div>
                ))}
            </div>

            <div className={`d-flex flex-row w-100 min-vh-40`}>
                <CardGrid/>
                <div className="bg-primary w-25 p-4 m-2 rounded">
                    <button className="btn text-white btn-danger w-100 mt-3" onClick={submitUsersCards}>Submit
                    </button>
                    <button className="btn text-white btn-danger w-100 mt-2" onClick={resetCards}>Reset</button>

                    <button className="btn text-white btn-danger w-100 mt-4"
                            onClick={goToEdit}>Edit Game
                        Cards
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
    );
}

export const GamePickerContext = createContext({});
export const GamePickerProvider = ({children}) => {
    const [gameCards, setGameCards, setResults] = useState([]);
    const [savedToast, setSavedToast] = useState(false);

    // Setup socket
    useEffect(() => {
        const cleanup = initGamePickerSocket(setGameCards, setResults);
        requestGameCardsData();
        return cleanup;
    }, [setGameCards, setResults]);


    const value = {
        gameCards,
        setGameCards,
        savedToast,
        setSavedToast,
    };

    return (
        <GamePickerContext.Provider value={value}>
            {children}
        </GamePickerContext.Provider>
    )
};

function GamePicker() {
    const router = useRouter();
    const content = router.query;

    return (
        <>
            {/* Head */}
            <UniversalHead/>

            {/* Body */}
            <div className={`${styles.bgImgMain} ${mainDivClass}`}>
                <NavBar/>
                <GamePickerProvider>
                    <MainContent/>
                </GamePickerProvider>
            </div>

            {/* Footer */}
            <Footer/>
        </>
    );
}

export default GamePicker;

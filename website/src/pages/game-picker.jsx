import NavBar from '@/src/components/layout/Navbar/NavBar.jsx';
import UniversalHead from '@components/misc/UniversalHead.jsx'
import Footer from "@/src/components/layout/Footer/Footer.jsx";
import styles from '@/src/styles/game-picker.module.scss';
import {mainDivClass} from "@styles/global.bootstrap.js";
import Duplicate from "@components/misc/Duplicate.jsx";
import CardGrid from "@components/ui/CardGrid/CardGrid.jsx";

function MainContent() {


    return (
        <div className="p-4">
            <div className={`d-flex flex-row w-100 ${styles['min-h-40']}`}>
                <Duplicate count={3}>
                    <div className="bg-danger w-100 p-4 m-2 rounded"></div>
                </Duplicate>
            </div>

            <div className={`d-flex flex-row w-100 ${styles['min-h-40']}`}>
                <CardGrid gameCards={gameCards}></CardGrid>
            </div>
        </div>
    );
}

function Home() {
    return (
        <>
            {/* Head */}
            <UniversalHead/>

            {/* Body */}
            <div className={`${styles.bgImgMain} ${mainDivClass}`}>
                <NavBar/>
                <MainContent/>
            </div>

            {/* Footer */}
            <Footer/>
        </>
    );
}

export default Home;

import Image from "next/image";
import {urls} from "@components/layout/Navbar/NavBar.jsx";

const logoPath = '/img/logo.png';

function NavLogo() {
    return (
        <>
            <a className="navbar-brand" href={urls.Home}><Image src={logoPath} width={80} height={80} alt="javr logo"/></a>
        </>
    )
}

export default NavLogo;
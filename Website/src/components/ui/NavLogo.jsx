import Image from "next/image";

const logoPath = '/img/logo.png';

function NavLogo() {
    return (
        <>
            <a className="navbar-brand" href="/website/public"><Image src={logoPath} width={80} height={80} alt="javr logo"/></a>
        </>
    )
}

export default NavLogo;
import './LogoCap.css'

export default function LogoCap() {
    return (
        <div className="brand d-flex align-items-center gap-2 px-3 pt-3 pb-2">
            {/*Imagen*/}
            <img className="brand-logo" src={'./images/logo-cap.png'} alt="Logo de CAP"/>

            {/*Texto*/}
            <div className="brand-copy d-flex flex-column min-w-0">
                <div className='brand-title'>Sistema CAP</div>
                <div className='brand-subtitle'>Clasificaciones</div>
            </div>
        </div>
    )
}

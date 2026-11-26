//frontend/src/layout/asidebar/LogoCap.tsx
export default function LogoCap() {
    return (
        <div className="d-flex align-items-center gap-2 px-3 pt-3 pb-2">
            {/*Imagen*/}
            <img
                className="rounded-circle bg-white object-fit-contain flex-shrink-0"
                src={'./images/logo-cap.png'}
                alt="Logo de CAP"
                width={36}
                height={36}
            />

            {/*Texto*/}
            <div className="d-flex flex-column overflow-hidden">
                <div className="fs-6 fw-bold text-white text-nowrap lh-sm">Sistema CAP</div>
                <div className="small text-white-50 text-nowrap lh-sm">Clasificaciones</div>
            </div>
        </div>
    )
}
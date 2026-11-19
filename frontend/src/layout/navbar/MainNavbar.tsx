//frontend/src/layout/navbar/MainNavbar.tsx
import Breadcrumbs from './Breadcrumbs';
import AccionesNavbar from './AccionesNavbar';

export default function MainNavbar() {
  return (
    <header className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
      <Breadcrumbs />
      <AccionesNavbar />
    </header>
  );
}
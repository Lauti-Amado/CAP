import Breadcrumbs from './Breadcrumbs';
import './MainNavbar.css'; // Keep this if you have custom colors/fonts, but layout is handled below
import AccionesNavbar from './AccionesNavbar';

export default function MainNavbar() {
  return (
    <header className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
      <Breadcrumbs />
      <AccionesNavbar />
    </header>
  );
}
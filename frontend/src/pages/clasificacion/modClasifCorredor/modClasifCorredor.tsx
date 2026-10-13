import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ModClasifCorredor.css';

const ModClasifCorredor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Captura el ID del corredor seleccionado desde la URL

  // Estados del formulario (pueden precargarse con datos reales vía API/DB)
  const [tiempoOficial, setTiempoOficial] = useState('01:45:23.450');
  const [puestoGeneral, setPuestoGeneral] = useState('42');
  const [categoria, setCategoria] = useState('Masc 35 a 39 años');

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Guardando modificaciones para el registro:", id);
    // Lógica para guardar en base de datos / Electron y volver
    navigate('/dashboard-clasificacion');
  };

  const handleCancelar = () => {
    navigate('/dashboard-clasificacion');
  };

  return (
    <div className="mod-container">
      {/* Topbar interno / Breadcrumb */}
      <header className="mod-topbar">
        <div className="breadcrumb">
          CAP Gestión <span className="separator">&gt;</span> Dashboard clasificación <span className="separator">&gt;</span> <strong>Clasificación carrera (modificar)</strong>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn" aria-label="Clima"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"></path><line x1="12" y1="12" x2="12" y2="22"></line><polyline points="8 18 12 22 16 18"></polyline></svg></button>
          <button className="icon-btn" aria-label="Notificaciones"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></button>
          <button className="icon-btn" aria-label="Ayuda"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></button>
          <button className="profile-btn" aria-label="Perfil"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </div>
      </header>

      <div className="mod-content">
        
        {/* Encabezado y Botones superiores */}
        <div className="mod-header-main">
          <div className="mod-title-group">
            <h1>Modificar Clasificación del corredor</h1>
            <p className="mod-id-registro">ID Registro: #{id ? `CL-2024-${id}` : 'CL-2024-8921'}</p>
          </div>
          <div className="mod-actions-top">
            <button className="btn-secondary-mod" type="button" onClick={handleCancelar}>
              Cancelar
            </button>
            <button className="btn-primary-mod" type="button" onClick={handleGuardar}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Guardar modificación
            </button>
          </div>
        </div>

        <form onSubmit={handleGuardar} className="mod-form-container">
          
          {/* Sección 1: Información del Corredor (Solo Lectura) */}
          <div className="mod-section-card">
            <div className="mod-section-title-row">
              <div className="mod-title-with-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <h2>Información del Corredor</h2>
              </div>
              <span className="mod-badge-locked">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Datos de Inscripción
              </span>
            </div>

            <div className="mod-grid-inputs">
              <div className="mod-input-group">
                <label>Nombre y apellido</label>
                <input type="text" value="Juan Pérez Mónaco" disabled />
              </div>
              <div className="mod-input-group">
                <label>DNI</label>
                <input type="text" value="34.567.890" disabled />
              </div>
              <div className="mod-input-group">
                <label>Sexo</label>
                <input type="text" value="Masculino" disabled />
              </div>
              <div className="mod-input-group">
                <label>Dorsal</label>
                <input type="text" value="# 1045" disabled />
              </div>
              <div className="mod-input-group">
                <label>Organización / Club</label>
                <input type="text" value="Running Team Sur" disabled />
              </div>
              <div className="mod-input-group">
                <label>Equipo</label>
                <input type="text" value="Elite" disabled />
              </div>
            </div>
          </div>

          {/* Sección 2: Datos de Clasificación (Editables) */}
          <div className="mod-section-card mod-editable-card">
            <div className="mod-section-title-row">
              <div className="mod-title-with-icon mod-icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <h2>Datos de Clasificación</h2>
              </div>
            </div>
            <p className="mod-section-subtitle">Modifique los resultados oficiales de carrera.</p>

            <div className="mod-inner-box">
              <div className="mod-input-group mb-20">
                <label>Tipo de clasificación</label>
                <input type="text" value="General" disabled />
              </div>

              <div className="mod-grid-editable">
                <div className="mod-input-group">
                  <label>Tiempo Oficial</label>
                  <div className="mod-input-with-icon">
                    <input 
                      type="text" 
                      value={tiempoOficial} 
                      onChange={(e) => setTiempoOficial(e.target.value)} 
                    />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                </div>

                <div className="mod-input-group">
                  <label>Puesto General</label>
                  <input 
                    type="text" 
                    value={puestoGeneral} 
                    onChange={(e) => setPuestoGeneral(e.target.value)} 
                  />
                </div>

                <div className="mod-input-group">
                  <label>Categoría</label>
                  <select 
                    value={categoria} 
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="Masc 18 a 29 años">Masc 18 a 29 años</option>
                    <option value="Masc 30 a 34 años">Masc 30 a 34 años</option>
                    <option value="Masc 35 a 39 años">Masc 35 a 39 años</option>
                    <option value="Masc 40 a 44 años">Masc 40 a 44 años</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ModClasifCorredor;
import { useState } from 'react';
import './login.css';
import { resetAdminPassword, verifyAdminPassword } from './adminCredentials';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logoCAP.png'; // Asegúrate de que la ruta de importación coincida con la ubicación real de tu archivo

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [recovering, setRecovering] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');

  const switchMode = (recovery: boolean) => {
    setRecovering(recovery);
    setPassword('');
    setConfirmation('');
    setShowPassword(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      if (recovering) {
        if (password !== confirmation) {
          setError('Las contraseñas no coinciden.');
          return;
        }
        await resetAdminPassword(email, password);
        switchMode(false);
        setSuccess('Contraseña guardada. Ya podés iniciar sesión con la nueva contraseña.');
      } else if (await verifyAdminPassword(email, password)) {
        navigate('/seleccionar-carrera');
      } else {
        setError('Correo electrónico o contraseña incorrectos.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo acceder a las credenciales guardadas.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* LOGO */}
        <div className="logo-container">
          <img src={logo} alt="Logo CAP Gestión" className="logo-image" />
        </div>

        {/* ENCABEZADOS */}
        <div className="header-text">
          <h1>CAP Gestión</h1>
          <h2>Sistema de administración de carreras</h2>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="login-form">
          {recovering && (
            <p className="recovery-notice">
              Restablecer contraseña del administrador en este dispositivo.
              Por ahora, este proceso no envía ni verifica un correo de recuperación.
            </p>
          )}
          <fieldset className="login-fields" disabled={busy}>
          {/* Input Correo */}
          <div className="form-group">
            <div className="label-row">
              <label>Correo electrónico</label>
            </div>
           
            <div className="input-wrapper">
              <svg className="input-icon left-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div className="form-group">
            <div className="label-row">
              <label>{recovering ? 'Nueva contraseña' : 'Contraseña'}</label>
              <button type="button" className="forgot-link recovery-link" disabled={busy} onClick={() => switchMode(!recovering)}>{recovering ? 'Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}</button>
            </div>
            <div className="input-wrapper">
              <svg className="input-icon left-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                minLength={recovering ? 6 : undefined}
                autoComplete={recovering ? 'new-password' : 'current-password'}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg className="input-icon right-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" y1="2" x2="22" y2="22"></line>
                </svg>
              </button>
            </div>
          </div>

          {recovering && (
            <div className="form-group">
              <label htmlFor="confirm-password">Confirmar nueva contraseña</label>
              <div className="input-wrapper">
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmation}
                  onChange={e => setConfirmation(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </div>
          )}
          </fieldset>

          {/* Checkbox Recordarme */}
          <div className="remember-container">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Recordarme en este dispositivo</label>
          </div>

          {/* Mensaje de error */}
          {error && <p className="error-message" role="alert">{error}</p>}
          {success && <p className="login-success" role="status">{success}</p>}

          {/* Botón de Submit */}
          <button type="submit" className="submit-button" disabled={busy}>
            {busy ? 'Procesando…' : recovering ? 'Guardar nueva contraseña' : 'Iniciar sesión'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>

        <hr className="divider" />

        {/* Footer */}
        <div className="footer-text">
          ¿No tienes una cuenta? <a href="#" className="register-link">Crear cuenta de organizador</a>
        </div>
      </div>
    </div>
  );
};

export default Login;

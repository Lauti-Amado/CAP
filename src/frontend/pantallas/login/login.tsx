import { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logoCAP.png'; // Asegúrate de que la ruta de importación coincida con la ubicación real de tu archivo

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Usuario hardcodeado
  const HARDCODED_USER = {
    email: 'admin@gmail.com',
    password: '123'
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    // Validación del usuario hardcodeado
    if (email === HARDCODED_USER.email && password === HARDCODED_USER.password) {
      setError('');
      alert('¡Inicio de sesión exitoso!');
      // Aquí puedes colocar la lógica para redirigir en tu app de Electron
      navigate('/seleccionar-carrera'); // Redirige a la pantalla de seleccionar carrera
    
    } else {
      setError('Correo electrónico o contraseña incorrectos');
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
              <label>Contraseña</label>
              <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
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

          {/* Checkbox Recordarme */}
          <div className="remember-container">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Recordarme en este dispositivo</label>
          </div>

          {/* Mensaje de error */}
          {error && <p className="error-message">{error}</p>}

          {/* Botón de Submit */}
          <button type="submit" className="submit-button">
            Iniciar sesión
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
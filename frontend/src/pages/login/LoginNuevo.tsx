import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { loginSchema } from '../../schemas/usuarioSchema';
import type { Login as LoginValidado } from '../../schemas/usuarioSchema';
import { useAuth } from '../../context/AuthContext';
import './LoginNuevo.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [errorApi, setErrorApi] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValidado>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (datos: LoginValidado) => {
        setErrorApi(null);
        try {
            await login(datos);
            navigate('/dashboard', { replace: true });
        } catch (e) {
            setErrorApi(e instanceof Error ? e.message : 'Error desconocido');
        }
    };

    // Muestra el estado actual: tachado mientras la contraseña está oculta
    const ToggleIcon = showPassword ? Eye : EyeOff;

    return (
        <Container fluid className="login-wrapper">
            <Card className="login-card">
                <Card.Body>
                    {/* LOGO */}
                    <div className="logo-container">
                        <img
                            src="/images/logo-cap.png"
                            alt="Logo CAP Gestión"
                            className="logo-image"
                        />
                    </div>

                    {/* TITULO */}
                    <div className="header-text">
                        <h1>CAP Gestión</h1>
                        <h2>Sistema de administración de carreras</h2>
                    </div>

                    {/* FORMULARIO (noValidate: los mensajes los da zod, no el navegador) */}
                    <Form
                        onSubmit={handleSubmit(onSubmit)}
                        className="login-form"
                        noValidate
                    >
                        {/* Input Correo */}
                        <Form.Group className="form-field" controlId="loginEmail">
                            <Form.Label>Correo electrónico</Form.Label>
                            <div className="input-wrapper">
                                <Mail className="input-icon left-icon" />
                                <Form.Control
                                    type="email"
                                    placeholder="tu@email.com"
                                    isInvalid={!!errors.email}
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <Form.Control.Feedback type="invalid" className="field-error">
                                    {errors.email.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        {/* Input Contraseña */}
                        <Form.Group className="form-field" controlId="loginPassword">

                            {/* Contraseña olvidada (a implementar) */}
                            <div className="label-row">
                                <Form.Label>Contraseña</Form.Label>
                                <a href="#" className="forgot-link">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <div className="input-wrapper">
                                <Lock className="input-icon left-icon" />
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    isInvalid={!!errors.password}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={
                                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                                    }
                                >
                                    <ToggleIcon className="input-icon right-icon" />
                                </button>
                            </div>
                            {errors.password && (
                                <Form.Control.Feedback type="invalid" className="field-error">
                                    {errors.password.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        {/* Checkbox Recordarme (A IMPLEMENTAR: loggea automáticamente y los tokens ya duran 30 días en el back) */}
                        <Form.Group className="mb-3 remember-container" controlId="loginRemember">
                            <Form.Check
                                type="checkbox"
                                label="Recordarme en este dispositivo"
                                {...register('recordarme')}
                            />
                        </Form.Group>

                        {/* Error devuelto por la API */}
                        {errorApi && (
                            <Alert variant="danger" className="login-alert">
                                {errorApi}
                            </Alert>
                        )}

                        {/* Botón de Submit */}
                        <Button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
                            <ArrowRight />
                        </Button>
                    </Form>

                    <hr className="divider" />
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;
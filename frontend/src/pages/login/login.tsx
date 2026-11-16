//frontend/src/pages/login/login.tsx
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { ArrowRight, Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas/usuarioSchema';
import type { Login as LoginValidado } from '../../schemas/usuarioSchema';

export default function Login() {
    const navigate = useNavigate();
    const { login, usuario } = useAuth();
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
        } catch (e) {
            setErrorApi(e instanceof Error ? e.message : 'Error desconocido');
        }
    };
    useEffect(() => {
        if (!usuario) return;

        if (usuario.roles.length > 0) {
            navigate('/home', { replace: true });
        } else {
            setErrorApi("No tienes permiso para estar aquí!");
        }
    }, [usuario, navigate]);

    // Muestra el estado actual: tachado mientras la contraseña está oculta
    const ToggleIcon = showPassword ? Eye : EyeOff;

    return (
        <Container className="min-vh-100 d-flex align-items-center justify-content-center py-4">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={9} md={7} lg={5} xl={4}>
                    <Card className="shadow border-0 overflow-hidden">
                        <Card.Header className="bg-success p-1 border-0" />
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <img
                                    src="/images/logo-cap.png"
                                    alt="Logo CAP Gestión"
                                    width={120}
                                    height={120}
                                    className="rounded-circle bg-light object-fit-contain"
                                />
                            </div>

                            <div className="text-center mb-4">
                                <h1 className="h2 fw-bold mb-1">CAP Gestión</h1>
                                <p className="text-secondary mb-0">Sistema de administración de carreras</p>
                            </div>

                            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <Form.Group className="mb-3" controlId="loginEmail">
                                    <Form.Label className="small fw-semibold">Correo electrónico</Form.Label>
                                    <InputGroup hasValidation>
                                        <InputGroup.Text><Mail size={18} aria-hidden="true" /></InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            placeholder="tu@email.com"
                                            isInvalid={!!errors.email}
                                            {...register('email')}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email?.message}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="loginPassword">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="small fw-semibold mb-0">Contraseña</Form.Label>
                                        <Link to="/contingencia" className="small text-success text-decoration-none">
                                            Acceso de contingencia
                                        </Link>
                                    </div>
                                    <InputGroup hasValidation>
                                        <InputGroup.Text><Lock size={18} aria-hidden="true" /></InputGroup.Text>
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            isInvalid={!!errors.password}
                                            {...register('password')}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        >
                                            <ToggleIcon size={18} aria-hidden="true" />
                                        </Button>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.password?.message}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                {errorApi && (
                                    <Alert variant="danger" className="py-2 text-center">
                                        {errorApi}
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    variant="success"
                                    size="lg"
                                    className="w-100 d-flex justify-content-center align-items-center gap-2 mt-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
                                    <ArrowRight size={18} aria-hidden="true" />
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
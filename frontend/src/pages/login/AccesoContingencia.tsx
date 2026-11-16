//frontend/src/pages/login/AccesoContingencia.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { contingenciaSchema } from '../../schemas/usuarioSchema';
import type { Contingencia } from '../../schemas/usuarioSchema';

//Deja la clave en mayúsculas con formato XXXX-XXXX mientras se tipea
function formatearClave(valor: string): string {
    const limpia = valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    return limpia.length > 4 ? `${limpia.slice(0, 4)}-${limpia.slice(4)}` : limpia;
}

export default function AccesoContingencia() {
    const navigate = useNavigate();
    const { loginContingencia, usuario } = useAuth();
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<Contingencia>({
        resolver: zodResolver(contingenciaSchema),
    });

    const claveRegistro = register('clave');
    const caracteres = (watch('clave') ?? '').replace('-', '').length;

    const onSubmit = async (datos: Contingencia) => {
        setErrorApi(null);
        try {
            await loginContingencia(datos);
        } catch (e) {
            setErrorApi(e instanceof Error ? e.message : 'Error desconocido');
        }
    };

    useEffect(() => {
        if (!usuario) return;

        if (usuario.roles.length > 0) {
            navigate('/home', { replace: true });
        } else {
            setErrorApi('No tienes permiso para estar aquí!');
        }
    }, [usuario, navigate]);

    return (
        <Container className="min-vh-100 d-flex align-items-center justify-content-center py-4">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={9} md={7} lg={5} xl={4}>
                    <Card className="shadow border-0 overflow-hidden">
                        <Card.Header className="bg-success p-1 border-0" />
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <span className="d-inline-flex rounded-circle bg-success-subtle text-success p-3">
                                    <Lock size={28} aria-hidden="true" />
                                </span>
                            </div>

                            <div className="text-center mb-4">
                                <h1 className="h3 fw-bold mb-2">Acceso de Contingencia</h1>
                                <p className="small text-secondary mb-0">
                                    Ingresá tu email y una clave de seguridad de 8 caracteres para restablecer el acceso al sistema. Es solo para clasificadores: los administradores ingresan con su contraseña.
                                </p>
                            </div>

                            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <Form.Group className="mb-3" controlId="contingenciaEmail">
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

                                <Form.Group className="mb-3" controlId="contingenciaClave">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="small fw-semibold mb-0">Clave de respaldo</Form.Label>
                                        <small className="text-secondary">{caracteres} caracteres</small>
                                    </div>
                                    <InputGroup hasValidation>
                                        <InputGroup.Text><Lock size={18} aria-hidden="true" /></InputGroup.Text>
                                        <Form.Control
                                            className="font-monospace fw-bold"
                                            type="text"
                                            placeholder="XXXX-XXXX"
                                            autoComplete="off"
                                            maxLength={9}
                                            isInvalid={!!errors.clave}
                                            {...claveRegistro}
                                            onChange={(e) => {
                                                e.target.value = formatearClave(e.target.value);
                                                claveRegistro.onChange(e);
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.clave?.message}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    {!errors.clave && (
                                        <Form.Text className="text-secondary">
                                            Formato: 8 caracteres alfanuméricos separados por guión.
                                        </Form.Text>
                                    )}
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
                                    {isSubmitting ? 'Validando...' : 'Validar clave'}
                                    <ArrowRight size={18} aria-hidden="true" />
                                </Button>
                            </Form>

                            <hr className="my-4" />

                            <div className="text-center">
                                <Link to="/" className="d-inline-flex align-items-center gap-1 small text-success text-decoration-none">
                                    <ArrowLeft size={14} aria-hidden="true" />
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
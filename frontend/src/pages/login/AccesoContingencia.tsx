//frontend/src/pages/login/AccesoContingencia.tsx
import './Login.css';
import './AccesoContingencia.css';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
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
        <Container fluid className="login-wrapper">
            <Card className="login-card">
                <Card.Body>
                    {/* ICONO */}
                    <div className="logo-container">
                        <span className="contingencia-icono">
                            <Lock size={28} aria-hidden="true" />
                        </span>
                    </div>

                    {/* TITULO */}
                    <div className="header-text">
                        <h1>Acceso de Contingencia</h1>
                          <h2>Ingresá tu email y una clave de seguridad de 8 caracteres para restablecer el acceso al sistema. Es solo para clasificadores: los administradores ingresan con su contraseña.</h2>                    </div>

                    <Form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
                        {/* Email */}
                        <Form.Group className="form-field" controlId="contingenciaEmail">
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

                        {/* Clave de respaldo */}
                        <Form.Group className="form-field" controlId="contingenciaClave">
                            <div className="label-row">
                                <Form.Label>Clave de respaldo</Form.Label>
                                <span className="contingencia-contador">{caracteres} caracteres</span>
                            </div>
                            <div className="input-wrapper">
                                <Lock className="input-icon left-icon" />
                                <Form.Control
                                    className="contingencia-clave"
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
                            </div>
                            {errors.clave ? (
                                <Form.Control.Feedback type="invalid" className="field-error">
                                    {errors.clave.message}
                                </Form.Control.Feedback>
                            ) : (
                                <Form.Text className="contingencia-ayuda">
                                    Formato: 8 caracteres alfanuméricos separados por guión.
                                </Form.Text>
                            )}
                        </Form.Group>

                        {errorApi && (
                            <Alert variant="danger" className="login-alert">
                                {errorApi}
                            </Alert>
                        )}

                        <Button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Validando...' : 'Validar clave'}
                            <ArrowRight />
                        </Button>
                    </Form>

                    <hr className="divider" />

                    <div className="text-center">
                        <Link to="/" className="forgot-link d-inline-flex align-items-center gap-1">
                            <ArrowLeft size={14} aria-hidden="true" />
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
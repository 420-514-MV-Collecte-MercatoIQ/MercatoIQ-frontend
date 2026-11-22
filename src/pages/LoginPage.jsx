import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getErrorMessage } from '../api/errors';
import { validateCredentials } from '../utils/validation';

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setApiError('');

        // 1. Validation côté client
        const errors = validateCredentials({ email, password });
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        // 2. Appel à l'API (ou au mock)
        setSubmitting(true);
        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (error) {
            setApiError(getErrorMessage(error, { 401: 'Courriel ou mot de passe invalide.' }));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <h1>Connexion</h1>

            {apiError && <p className="alert-error" role="alert">{apiError}</p>}

            <label htmlFor="email">Courriel</label>
            <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

            <label htmlFor="password">Mot de passe</label>
            <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}

            <button type="submit" disabled={submitting}>
                {submitting ? 'Connexion…' : 'Se connecter'}
            </button>

            <p>
                Pas de compte ? <Link to="/register">Créer un compte</Link>
            </p>
        </form>
    );
}
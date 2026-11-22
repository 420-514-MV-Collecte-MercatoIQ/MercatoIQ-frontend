import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getErrorMessage } from '../api/errors';
import { validateCredentials, PASSWORD_MIN } from '../utils/validation';

export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setApiError('');

        const errors = validateCredentials({ email, password }, { isRegister: true });
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setSubmitting(true);
        try {
            // Le backend renvoie directement un token
            await register({ email, password });
            navigate('/dashboard');
        } catch (error) {
            setApiError(getErrorMessage(error, { 409: 'Ce courriel est déjà utilisé.' }));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <h1>Créer un compte</h1>

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

            <label htmlFor="password">Mot de passe (minimum {PASSWORD_MIN} caractères)</label>
            <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}

            <button type="submit" disabled={submitting}>
                {submitting ? 'Création…' : 'Créer mon compte'}
            </button>

            <p>
                Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
        </form>
    );
}
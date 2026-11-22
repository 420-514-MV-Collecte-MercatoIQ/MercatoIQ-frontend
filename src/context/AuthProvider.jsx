import { useState } from 'react';
import { AuthContext } from './AuthContext';
import * as authApi from '../api/auth';
import { TOKEN_KEY } from '../api/client';

const USER_KEY = 'mercatoiq_user';

// Au chargement de la page, on récupère l'utilisateur sauvegardé
function readStoredUser() {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
}

export function AuthProvider({ children }) {
    // user = { id, email, role } si connecté, sinon null
    const [user, setUser] = useState(readStoredUser);

    // Sauvegarde la réponse de /auth/login ou /auth/register
    function saveSession({ access_token, user }) {
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setUser(user);
    }

    // Si l'API répond une erreur (401, 409, 400...), elle remonte jusqu'à la page
    async function login(credentials) {
        saveSession(await authApi.login(credentials));
    }

    async function register(credentials) {
        saveSession(await authApi.register(credentials));
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Barre de navigation
export function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <span className="navbar-brand">MercatoIQ</span>
            <NavLink to="/dashboard">Dashboard</NavLink>
            {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}

            {user ? (
                <>
          <span className="navbar-user">
            {user.email} ({user.role})
          </span>
                    <button type="button" onClick={logout}>
                        Déconnexion
                    </button>
                </>
            ) : (
                <NavLink to="/login">Connexion</NavLink>
            )}
        </nav>
    );
}
import { createContext } from 'react';

// Le « canal » partagé : contiendra { user, login, register, logout }
export const AuthContext = createContext(null);
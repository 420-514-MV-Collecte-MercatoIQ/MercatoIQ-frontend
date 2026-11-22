import { delay, httpError } from './mockUtils';


const users = [
    { id: '1', email: 'admin@mercatoiq.dev', password: 'admin1234', role: 'admin' },
    { id: '2', email: 'user@mercatoiq.dev', password: 'user12345', role: 'user' },
];

// Même forme que buildAuthResponse() du backend
function buildAuthResponse(user) {
    return {
        access_token: `mock-token-${user.id}`,
        user: { id: user.id, email: user.email, role: user.role },
    };
}

export async function mockRegister({ email, password }) {
    await delay();
    const normalizedEmail = email.toLowerCase().trim();

    if (password.length < 8 || password.length > 72) {
        throw httpError(400, ['password must be between 8 and 72 characters']);
    }
    if (users.some((u) => u.email === normalizedEmail)) {
        throw httpError(409, 'Email is already in use');
    }

    const user = { id: String(users.length + 1), email: normalizedEmail, password, role: 'user' };
    users.push(user);
    return buildAuthResponse(user);
}

export async function mockLogin({ email, password }) {
    await delay();
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find((u) => u.email === normalizedEmail);

    if (!user || user.password !== password) {
        throw httpError(401, 'Invalid Credentials');
    }
    return buildAuthResponse(user);
}
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mêmes limites que RegisterDto du backend (@MinLength(8), @MaxLength(72))
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

// Retourne un objet { champ: message } ; vide = formulaire valide
export function validateCredentials({ email, password }, { isRegister = false } = {}) {
    const errors = {};

    if (!email.trim()) {
        errors.email = 'Le courriel est obligatoire.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.email = 'Le format du courriel est invalide.';
    }

    if (!password) {
        errors.password = 'Le mot de passe est obligatoire.';
    } else if (isRegister && (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX)) {
        errors.password = `Le mot de passe doit contenir entre ${PASSWORD_MIN} et ${PASSWORD_MAX} caractères.`;
    }

    return errors;
}
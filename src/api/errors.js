const DEFAULT_MESSAGES = {
    401: 'Vous devez être connecté pour effectuer cette action.',
    403: 'Vous n’avez pas les droits nécessaires.',
    429: 'Trop de requêtes. Réessayez dans quelques instants.',
};

export function getErrorMessage(error, overrides = {}) {
    // Pas de réponse du tout : serveur arrêté, mauvaise URL, réseau coupé
    if (!error.response) {
        return 'Impossible de joindre le serveur.';
    }

    const { status, data } = error.response;
    if (overrides[status]) return overrides[status];
    if (DEFAULT_MESSAGES[status]) return DEFAULT_MESSAGES[status];

    // NestJS : `message` est un tableau pour les erreurs de validation (400), sinon un texte
    if (Array.isArray(data?.message)) return data.message.join(' ');
    return data?.message || 'Une erreur est survenue.';
}
export function delay(ms = 400) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function httpError(status, message) {
    const error = new Error(Array.isArray(message) ? message.join(', ') : message);
    error.response = { status, data: { statusCode: status, message } };
    return error;
}
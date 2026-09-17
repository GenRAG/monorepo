interface ApiErrorData {
    message?: string | string[];
}

/**
 * The global exception filter unwraps the backend's error body so that `err.data` matches
 * NestJS's default HttpException response shape ({ statusCode, message, error }) — see
 * services/api.ts. `message` can be a string[] (class-validator), we surface the first one.
 */
export const getApiErrorMessage = (error: unknown): string | undefined => {
    if (!error || typeof error !== "object" || !("data" in error)) return undefined;

    const { data } = error as { data: unknown };
    if (!data || typeof data !== "object" || !("message" in data)) return undefined;

    const { message } = data as ApiErrorData;
    return Array.isArray(message) ? message[0] : message;
};

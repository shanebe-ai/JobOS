/**
 * Safe UUID generator that works in both secure (HTTPS/localhost) and non-secure (HTTP) contexts.
 * Falls back to a random string generation if crypto.randomUUID is not available.
 */
export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        try {
            return crypto.randomUUID();
        } catch (e) {
            // Fallback if it throws (can happen in some contexts)
        }
    }

    // Fallback implementation (RFC4122 version 4 compliant-ish)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

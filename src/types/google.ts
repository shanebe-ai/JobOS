/**
 * Minimal typings for the Google Identity Services (GSI) client library
 * loaded from https://accounts.google.com/gsi/client
 */

export interface GoogleCredentialResponse {
    credential: string;
}

export interface GoogleIdConfiguration {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
}

export interface GoogleRenderButtonOptions {
    theme?: string;
    size?: string;
    text?: string;
    shape?: string;
    width?: number;
}

export interface GoogleIdentityServices {
    accounts: {
        id: {
            initialize: (config: GoogleIdConfiguration) => void;
            renderButton: (element: HTMLElement, options: GoogleRenderButtonOptions) => void;
            disableAutoSelect: () => void;
        };
    };
}

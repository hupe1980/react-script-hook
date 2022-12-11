import { useState, useEffect, ComponentPropsWithoutRef } from 'react';

type ScriptAttributes = Omit<ComponentPropsWithoutRef<'script'>, 'src'>;

export interface ScriptProps extends ScriptAttributes {
    src: HTMLScriptElement['src'] | null;
    checkForExisting?: boolean;
}

type ErrorState = ErrorEvent | null;
type ScriptStatus = {
    loading: boolean;
    error: ErrorState;
    scriptEl: HTMLScriptElement;
};
type ScriptStatusMap = {
    [key: string]: ScriptStatus;
};

// Previously loading/loaded scripts and their current status
export const scripts: ScriptStatusMap = {};

// Check for existing <script> tags with this src. If so, update scripts[src]
// and return the new status; otherwise, return undefined.
const checkExisting = (src: string): ScriptStatus | undefined => {
    const existing: HTMLScriptElement | null = document.querySelector(
        `script[src="${src}"]`,
    );
    if (existing) {
        // Assume existing <script> tag is already loaded,
        // and cache that data for future use.
        return (scripts[src] = {
            loading: false,
            error: null,
            scriptEl: existing,
        });
    }
    return undefined;
};

export default function useScript({
    src,
    checkForExisting = false,
    ...attributes
}: ScriptProps): [boolean, ErrorState] {
    // Check whether some instance of this hook considered this src.
    let status: ScriptStatus | undefined = src ? scripts[src] : undefined;

    // If requested, check for existing <script> tags with this src
    // (unless we've already loaded the script ourselves).
    if (!status && checkForExisting && src && isBrowser) {
        status = checkExisting(src);
    }

    const [loading, setLoading] = useState<boolean>(
        status ? status.loading : Boolean(src),
    );
    const [error, setError] = useState<ErrorState>(
        status ? status.error : null,
    );
    // Tracks if script is loaded so we can avoid duplicate script tags
    const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);

    useEffect(() => {
        // Nothing to do on server, or if no src specified, or
        // if script is already loaded or "error" state.
        if (!isBrowser || !src || scriptLoaded || error) return;

        // Check again for existing <script> tags with this src
        // in case it's changed since mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        status = scripts[src];
        if (!status && checkForExisting) {
            status = checkExisting(src);
        }

        // Determine or create <script> element to listen to.
        let scriptEl: HTMLScriptElement;
        if (status) {
            scriptEl = status.scriptEl;
        } else {
            scriptEl = document.createElement('script');
            scriptEl.src = src;

            Object.keys(attributes).forEach((key) => {
                if (scriptEl[key] === undefined) {
                    scriptEl.setAttribute(key, attributes[key]);
                } else {
                    scriptEl[key] = attributes[key];
                }
            });

            status = scripts[src] = {
                loading: true,
                error: null,
                scriptEl: scriptEl,
            };
        }
        // `status` is now guaranteed to be defined: either the old status
        // from a previous load, or a newly created one.

        const handleLoad = () => {
            if (status) status.loading = false;
            setLoading(false);
            setScriptLoaded(true);
        };
        const handleError = (error: ErrorEvent) => {
            if (status) status.error = error;
            setError(error);
        };

        scriptEl.addEventListener('load', handleLoad);
        scriptEl.addEventListener('error', handleError);

        document.body.appendChild(scriptEl);

        return () => {
            scriptEl.removeEventListener('load', handleLoad);
            scriptEl.removeEventListener('error', handleError);
        };
        // we need to ignore the attributes as they're a new object per call, so we'd never skip an effect call
    }, [src]);

    return [loading, error];
}

const isBrowser =
    typeof window !== 'undefined' && typeof window.document !== 'undefined';

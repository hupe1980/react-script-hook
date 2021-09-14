import { useState, useEffect } from 'react';

export interface ScriptProps {
    src: HTMLScriptElement['src'] | null;
    checkForExisting?: Boolean;
    [key: string]: any;
}

type ErrorState = ErrorEvent | null;

export default function useScript({
    src,
    checkForExisting = false,
    ...attributes
}: ScriptProps): [boolean, ErrorState] {
    const [loading, setLoading] = useState(Boolean(src));
    const [error, setError] = useState<ErrorState>(null);

    useEffect(() => {
        if (!isBrowser || !src) return;

        if (checkForExisting) {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                setLoading(existing.getAttribute('data-status') === 'loading');
                return;
            }
        }

        const scriptEl = document.createElement('script');
        scriptEl.setAttribute('src', src);
        scriptEl.setAttribute('data-status', 'loading');

        Object.keys(attributes).forEach((key) => {
            if (scriptEl[key] === undefined) {
                scriptEl.setAttribute(key, attributes[key]);
            } else {
                scriptEl[key] = attributes[key];
            }
        });

        const handleLoad = () => {
            scriptEl.setAttribute('data-status', 'ready');
            setLoading(false);
        };
        const handleError = (error: ErrorEvent) => {
            scriptEl.setAttribute('data-status', 'error');
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    return [loading, error];
}

const isBrowser =
    typeof window !== 'undefined' && typeof window.document !== 'undefined';

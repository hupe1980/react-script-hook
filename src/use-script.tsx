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
            const existing = document.querySelectorAll(`script[src="${src}"]`);
            if (existing.length > 0) {
                setLoading(false);
                return;
            }
        }

        const scriptEl = document.createElement('script');
        scriptEl.setAttribute('src', src);

        Object.keys(attributes).forEach((key) => {
            if (scriptEl[key] === undefined) {
                scriptEl.setAttribute(key, attributes[key]);
            } else {
                scriptEl[key] = attributes[key];
            }
        });

        const handleLoad = () => {
            setLoading(false);
        };
        const handleError = (error: ErrorEvent) => {
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

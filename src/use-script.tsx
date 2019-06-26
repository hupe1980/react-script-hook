import { useState, useEffect } from 'react';
import useIsMounted from 'react-is-mounted-hook';

export interface ScriptProps {
  src: HTMLScriptElement['src'];
  onload?: HTMLScriptElement['onload'];
  onerror?: HTMLScriptElement['onerror'];
  [key: string]: any;
}

type ErrorState = ErrorEvent | null

export default function useScript({ src, ...attributes }: ScriptProps): [boolean, ErrorState] {
  const isMounted = useIsMounted();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>(null);

  useEffect(() => {
    if (!isBrowser) return;

    if (document.querySelector(`script[src="${src}"]`)) {
      if (isMounted()) {
        setLoading(false);
      }
      return;
    }

    const scriptEl = document.createElement('script');
    scriptEl.src = src;

    Object.keys(attributes).forEach(key => (scriptEl[key] = attributes[key]));

    const handleLoad = () => {
      if (isMounted()) {
        setLoading(false);
      }
    };
    const handleError = (error: ErrorEvent) => {
      if (isMounted()) {
        setError(error)
      }
    };

    scriptEl.addEventListener('load', handleLoad);
    scriptEl.addEventListener('error', handleError);

    document.body.appendChild(scriptEl);

    return () => {
      scriptEl.removeEventListener('load', handleLoad);
      scriptEl.removeEventListener('error', handleError);
    };
  }, [src]);

  return [loading, error];
}

const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

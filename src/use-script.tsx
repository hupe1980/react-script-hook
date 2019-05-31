import { useState, useEffect } from 'react';

export default function useScript({ src, ...attributes }: HTMLScriptElement) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEvent | null>(null);

  useEffect(() => {
    if (!isBrowser) return;

    if (document.querySelector(`script[src="${src}"]`)) {
      setLoading(false);
      return;
    }

    const scriptEl = document.createElement('script');
    scriptEl.src = src;

    Object.keys(attributes).forEach(key => (scriptEl[key] = attributes[key]));

    const handleLoad = () => setLoading(false);
    const handleError = (error: ErrorEvent) => setError(error);

    scriptEl.addEventListener('load', handleLoad);
    scriptEl.addEventListener('error', handleError);

    document.body.appendChild(scriptEl);

    return () => {
      scriptEl.removeEventListener('load', handleLoad);
      scriptEl.removeEventListener('error', handleError);
    };
  }, [src]);

  return {
    loading,
    error
  };
}

const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

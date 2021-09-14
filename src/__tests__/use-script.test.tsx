import { act, renderHook } from '@testing-library/react-hooks';

import useScript from '../use-script';

describe('useScript', () => {
    beforeEach(() => {
        const html = document.querySelector('html');
        if (html) {
            html.innerHTML = '';
        }
    });

    it('should append a script tag', () => {
        expect(document.querySelectorAll('script').length).toBe(0);

        const { result } = renderHook(() =>
            useScript({ src: 'http://scriptsrc/' }),
        );

        const [loading, error] = result.current;

        expect(loading).toBe(true);
        expect(error).toBeNull();

        const script = document.querySelector('script');
        expect(script).not.toBeNull();
        if (script) {
            expect(script.getAttribute('src')).toEqual('http://scriptsrc/');
        }
    });

    it('should append a script tag with attributes', async () => {
        expect(document.querySelectorAll('script').length).toBe(0);

        const { result } = renderHook(() =>
            useScript({
                src: 'http://scriptsrc/',
                'data-test': 'test',
                async: true,
            }),
        );

        const [loading, error] = result.current;

        expect(loading).toBe(true);
        expect(error).toBeNull();

        const script = document.querySelector('script');
        expect(script).not.toBeNull();
        if (script) {
            expect(script.getAttribute('src')).toEqual('http://scriptsrc/');
            expect(script.getAttribute('data-test')).toEqual('test');
            expect(script.getAttribute('async')).toBe('true');
        }
    });

    it('should render a script only once', () => {
        expect(document.querySelectorAll('script').length).toBe(0);

        const props = { src: 'http://scriptsrc/' };
        const handle = renderHook((p) => useScript(p), {
            initialProps: props,
        });
        expect(document.querySelectorAll('script').length).toBe(1);

        handle.rerender();
        expect(document.querySelectorAll('script').length).toBe(1);
    });

    it('should set loading false on load', async () => {
        const props = { src: 'http://scriptsrc/' };
        const handle = renderHook((p) => useScript(p), {
            initialProps: props,
        });

        const [loading, error] = handle.result.current;
        expect(loading).toBe(true);
        expect(error).toBe(null);

        const el = document.querySelector('script');
        expect(el).toBeDefined();
        expect(el!.getAttribute('data-status')).toBe('loading');
        act(() => {
            el!.dispatchEvent(new Event('load'));
        });

        const [loadingAfter, errorAfter] = handle.result.current;
        expect(loadingAfter).toBe(false);
        expect(errorAfter).toBe(null);
        expect(el!.getAttribute('data-status')).toBe('ready');
    });

    it('should not cause issues on unmount', async () => {
        const props = { src: 'http://scriptsrc/' };
        const handle = renderHook((p) => useScript(p), {
            initialProps: props,
        });

        handle.unmount();

        act(() => {
            const el = document.querySelector('script');
            if (el) {
                el.dispatchEvent(new Event('load'));
            }
        });
    });

    it('should check for script existing on the page before rendering when checkForExisting is true', () => {
        expect(document.querySelectorAll('script').length).toBe(0);

        const previousScript = document.createElement('script');
        previousScript.src = 'http://scriptsrc/';
        document.body.appendChild(previousScript);

        expect(document.querySelectorAll('script').length).toBe(1);

        const props = { src: 'http://scriptsrc/', checkForExisting: true };
        const handle = renderHook((p) => useScript(p), {
            initialProps: props,
        });
        expect(document.querySelectorAll('script').length).toBe(1);

        handle.rerender();
        expect(document.querySelectorAll('script').length).toBe(1);
    });

    it('should not check for script existing on the page before rendering when checkForExisting is not set', () => {
        expect(document.querySelectorAll('script').length).toBe(0);

        const previousScript = document.createElement('script');
        previousScript.src = 'http://scriptsrc/';
        document.body.appendChild(previousScript);

        expect(document.querySelectorAll('script').length).toBe(1);

        const props = { src: 'http://scriptsrc/' };
        const handle = renderHook((p) => useScript(p), {
            initialProps: props,
        });
        expect(document.querySelectorAll('script').length).toBe(2);

        handle.rerender();
        expect(document.querySelectorAll('script').length).toBe(2);
    });

    it('should handle null src and not append a script tag', () => {
        expect(document.querySelectorAll('script').length).toBe(0);

        const { result } = renderHook(() => useScript({ src: null }));

        const [loading, error] = result.current;

        expect(loading).toBe(false);
        expect(error).toBeNull();

        expect(document.querySelectorAll('script').length).toBe(0);
    });

    it('should the loading status set to false after complete loading an existing script tag', () => {
        expect(document.querySelectorAll('script').length).toBe(0);

        const props = { src: 'http://scriptsrc/' };
        const handle = renderHook((p) => useScript(p), {
            initialProps: props,
        });
        const elBefore = document.querySelector(`script[src="${props.src}"]`);
        expect(elBefore).toBeDefined();
        expect(elBefore!.getAttribute('data-status')).toBe('loading');

        handle.rerender();

        const elAfter = document.querySelector(`script[src="${props.src}"]`);
        expect(elAfter).toBeDefined();
        expect(elAfter!.getAttribute('data-status')).toBe('loading');
        act(() => {
            elAfter!.dispatchEvent(new Event('load'));
        });
        expect(elAfter!.getAttribute('data-status')).toBe('ready');
    });
});

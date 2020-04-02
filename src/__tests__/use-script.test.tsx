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

        act(() => {
            const el = document.querySelector('script');
            if (el) {
                el.dispatchEvent(new Event('load'));
            }
        });

        const [loadingAfter, errorAfter] = handle.result.current;
        expect(loadingAfter).toBe(false);
        expect(errorAfter).toBe(null);
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
});

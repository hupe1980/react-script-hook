import { renderHook } from '@testing-library/react-hooks';

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

        renderHook(() => useScript({ src: 'http://scriptsrc/' }));
        expect(document.querySelectorAll('script').length).toBe(1);

        renderHook(() => useScript({ src: 'http://scriptsrc/' }));
        expect(document.querySelectorAll('script').length).toBe(1);
    });
});

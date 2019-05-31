import { renderHook } from 'react-hooks-testing-library';

import useScript from '../use-script';

describe('useScript', () => {
  afterEach(() => {
    const html = document.querySelector('html');
    if (html) {
      html.innerHTML = '';
    }
  });

  it('should append a script tag', () => {
    expect(document.querySelectorAll('script').length).toBe(0);

    const { result } = renderHook(() =>
      useScript({ src: 'http://scriptsrc/' })
    );

    expect(result.current.loading).toBeTruthy();
    expect(result.current.error).toBeNull();

    const script = document.querySelector('script');
    expect(script).not.toBeNull();
    if (script) {
      expect(script.src).toEqual('http://scriptsrc/');
    }
  });

  it('should only renders a script one times', () => {
    expect(document.querySelectorAll('script').length).toBe(0);

    renderHook(() => useScript({ src: 'http://scriptsrc/' }));
    expect(document.querySelectorAll('script').length).toBe(1);

    renderHook(() => useScript({ src: 'http://scriptsrc/' }));
    expect(document.querySelectorAll('script').length).toBe(1);
  });
});

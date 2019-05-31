import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import useScript from '../use-script';

configure({
  adapter: new Adapter()
});

describe('useScript', () => {
  it('should append a script tag', () => {
    function Component() {
      useScript({ src: 'http://scriptsrc/' });
      return <div />;
    }

    mount(<Component />);

    const script = document.querySelector('script');
    expect(script).not.toBeNull();
    if (script) {
      expect(script.src).toEqual('http://scriptsrc/');
    }
  });
});

# react-script-hook

> React hook to dynamically load an external script and know when its loaded

## Install

```sh
// with npm
npm install react-script-hook

// with yarn
yarn add react-script-hook
```

## How to use

```javascript
import React from 'react';
import { StripeProvider } from 'react-stripe-elements';
import useScript from 'react-script-hook';

import MyCheckout from './my-checkout';

function App() {
  const [loading, error] = useScript({ src: 'https://js.stripe.com/v3/' });

  if (loading) return <h3>Loading Stripe API...</h3>;
  if (error) return <h3>Failed to load Stripe API: {error.message}</h3>;

  return (
    <StripeProvider apiKey="pk_test_6pRNASCoBOKtIshFeQd4XMUh">
      <MyCheckout />
    </StripeProvider>
  );
}

export default App;
```

## Use with callbacks

```js
useScript({ 
  src: 'https://js.stripe.com/v3/',
  onload: () => console.log('Script loaded!') 
})
```

## License

[MIT](LICENSE)

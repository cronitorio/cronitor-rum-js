# Cronitor RUM client (browser)

A simple JavaScript library for [Cronitor Real User Monitoring](https://cronitor.io/real-user-monitoring).

## Highlights

- Just a thin wrapper around the Cronitor RUM analytics script.
- Integrates with most JS frameworks.
- Typed (Typescript).

## Quickstart

### Install

Run the following command to install in your project:

```
npm install @cronitorio/cronitor-rum-js
```

Or with yarn:

```
yarn add @cronitorio/cronitor-rum-js
```

### Basic usage

You can now import, and use the client on your project.

```javascript
import * as Cronitor from '@cronitorio/cronitor-rum-js';

// Load the Cronitor tracker once in your app
Cronitor.load('YOUR_CLIENT_KEY');

// This is how you record page views
Cronitor.track('Pageview');

// You can also trigger custom events
Cronitor.track('NewsletterSignup');
```

## Changelog

### 0.1.0

- Initial open source release.

## Security Disclosure

If you discover any issue regarding security, please disclose the information responsibly by sending us an email at [support@cronitor.io](mailto:support@cronitor.io). Do NOT create a Issue on the GitHub repo.

## Contributing

Please check for any existing issues before openning a new Issue. If you'd like to work on something, please open a new Issue describing what you'd like to do before submitting a Pull Request.

## License

See [LICENSE](https://github.com/cronitorio/cronitor-rum-js/blob/master/LICENSE).

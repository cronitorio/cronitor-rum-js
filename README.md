# Cronitor RUM client (browser)

A simple JavaScript library for [Cronitor Real User Monitoring](https://cronitor.io/real-user-monitoring).

## Quickstart

### Install

Run the following command to install in your project:

```
npm install @cronitorio/cronitor-rum
```

Or with yarn:

```
yarn add @cronitorio/cronitor-rum
```

### Basic usage

You can now import, and use the client on your project.

```javascript
import * as Cronitor from '@cronitorio/cronitor-rum';

// Load the Cronitor tracker once in your app
Cronitor.load('YOUR_CLIENT_KEY');

// This is how you record page views
Cronitor.track('Pageview');

// You can also trigger custom events
Cronitor.track('NewsletterSignup');
```

You can set any configuration options as follows:

```javascript
import * as Cronitor from '@cronitorio/cronitor-rum';

// Load the Cronitor tracker once in your app
Cronitor.load('YOUR_CLIENT_KEY', {
    debug: true,
    environment: "staging",
    includeURLQueryParams: ["tab", "pageNum"]
});
```

## Changelog

### 0.4.1

- Bug fix. Bind sendBeacon to navigator.

### 0.4.0

- Rename package.

### 0.3.0

- Open source analytics script.

### 0.2.0

- Update types.

### 0.1.0

- Initial open source release.

## Security Disclosure

If you discover any issue regarding security, please disclose the information responsibly by emailing us at [support@cronitor.io](mailto:support@cronitor.io). Do NOT create a Issue on the GitHub repo.

## Contributing

Please check for any existing issues before opening a new Issue. If you'd like to work on something, please open a new Issue describing what you'd like to do before submitting a Pull Request.

## License

See [LICENSE](https://github.com/cronitorio/cronitor-rum-js/blob/master/LICENSE).

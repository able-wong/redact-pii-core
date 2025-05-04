[![Verify All (Typecheck, Lint, Test)](https://github.com/able-wong/redact-pii-core/actions/workflows/verify_all.yml/badge.svg)](https://github.com/able-wong/redact-pii-core/actions/workflows/verify_all.yml)

# redact-pii-core

Remove personally identifiable information from text.

## Introduction

This is a fork of the original [redact-pii](https://github.com/solvvy/redact-pii) library with the following changes:

- Removal of Google DLP dependency (if you need more advanced PII detection, consider using GenAI tools instead)
- Switched to use change-case-all instead of lodash to reduce bundle size
- Upgraded dependencies for better maintenance and security

This library uses regex-based patterns to identify and remove personally identifiable information. While it's not perfect compared to NLP or AI-based solutions, it's particularly useful in scenarios where sending PII to external services is not desirable or permitted.

### Prerequisites

This library is primarily written for Node.js but it should work in the browser as well.
It is written in TypeScript and compiles to ES2016 (as specified in tsconfig.json). The library requires Node.js 18.0.0 or higher (or a modern browser).

### Simple example (synchronous API)

```bash
npm install redact-pii-core
```

```js
const { SyncRedactor } = require('redact-pii-core');
const redactor = new SyncRedactor();
const redactedText = redactor.redact('Hi David Johnson, Please give me a call at 555-555-5555');
// Hi NAME, Please give me a call at PHONE_NUMBER
console.log(redactedText);
```

### Simple example (asynchronous / promise-based API)

```js
const { AsyncRedactor } = require('redact-pii-core');
const redactor = new AsyncRedactor();
redactor.redactAsync('Hi David Johnson, Please give me a call at 555-555-5555').then(redactedText => {
  // Hi NAME, Please give me a call at PHONE_NUMBER
  console.log(redactedText);
});
```

## Supported Features

- sync and async API variants
- ability to customize what to use as replacement value for detected patterns
- built in regex based redaction rules for:
  - credentials
  - creditCardNumber
  - emailAddress
  - ipAddress
  - names (including some support with international names with accents like "José García" or "François Müller")
    - **Limitation**: The current regex pattern doesn't properly handle names with hyphens (e.g., "Mary-Jane Smith") or apostrophes (e.g., "O'Connor", "D'Artagnan"). Some accent letters are not handled too (e.g., "Søren Jørgensen")
  - password
  - phoneNumber
  - streetAddress
  - username
  - usSocialSecurityNumber
  - zipcode
  - canadianSIN
  - canadianPostalCode
  - facebookProfile
  - linkedInProfile
  - url
  - digits
  - > **NOTE**: the built-in redaction rules are mostly applicable for identifying (US-)english PII.
    > Consider using custom patterns if you have non-english PII to redact.
- ability to add custom redaction regex patterns and complete custom redaction functions (both sync and async)

## Advanced usage and features

### Customize replacement values

```js
const { SyncRedactor } = require('redact-pii-core');

// use a single replacement value for all built-in patterns found.
const redactor = new SyncRedactor({ globalReplaceWith: 'TOP_SECRET' });
redactor.redact('Dear David Johnson, I live at 42 Wallaby Way');
// Dear TOP_SECRET, I live at TOP_SECRET

// use a custom replacement value for a specific built-in pattern
const redactor = new SyncRedactor({
  builtInRedactors: {
    names: {
      replaceWith: 'ANONYMOUS_PERSON'
    }
  }
});

redactor.redact('Dear David Johnson');
// Dear ANONYMOUS_PERSON
```

### Add custom patterns or redaction functions

Note that the order of redaction rules matters, therefore you have to decide whether you want your custom redaction rules to run `before` or `after` the built-in ones. Generally it's better to put very specialized patterns or functions `before` the built-in ones and more broad / general ones `after`.

```js
const { SyncRedactor } = require('redact-pii-core');

// add a custom regexp pattern
const redactor = new SyncRedactor({
  customRedactors: {
    before: [
      {
        regexpPattern: /\b(cat|dog|cow)s?\b/gi,
        replaceWith: 'ANIMAL'
      }
    ]
  }
});

redactor.redact('I love cats, dogs, and cows');
// I love ANIMAL, ANIMAL, and ANIMAL

// add a synchronous custom redaction function
const redactor = new SyncRedactor({
  customRedactors: {
    before: [
      {
        redact(textToRedact) {
          return textToRedact.includes('TopSecret')
            ? 'THIS_FILE_IS_SO_TOP_SECRET_WE_HAD_TO_REDACT_EVERYTHING'
            : textToRedact;
        }
      }
    ]
  }
});

redactor.redact('This document is classified as TopSecret.')
// THIS_FILE_IS_SO_TOP_SECRET_WE_HAD_TO_REDACT_EVERYTHING


import { AsyncRedactor } from './src/index';

// add an asynchronous custom redaction function
const redactor = new AsyncRedactor({
  customRedactors: {
    before: [
      {
        redactAsync(textToRedact) {
          return myCustomRESTApiServer.redactCustomWords(textToRedact);
        }
      }
    ]
  }
});
```

### Disable specific built-in redaction rules

```js
const redactor = new SyncRedactor({
  builtInRedactors: {
    names: {
      enabled: false
    },
    emailAddress: {
      enabled: false
    }
  }
});
```

### Contributing

#### Run tests

You can run the tests via `npm run test`.

import { AsyncRedactor, SyncRedactor } from '../src';

const redactor = new SyncRedactor();
const compositeRedactorWithDLP = new AsyncRedactor({
  builtInRedactors: {
    zipcode: {
      enabled: false,
    },
    digits: {
      enabled: false,
    },
  },
  customRedactors: {
    before: [
      {
        regexpPattern: /(banana|apple|orange)/,
        replaceWith: 'FOOD',
      },
    ],
  },
});

describe('index.js', function () {
  type InputAssertionTuple = [string, string, string?];

  function TestCase(description: string, thingsToTest: Array<InputAssertionTuple>) {
    it(description, async () => {
      for (const [input, syncOutput] of thingsToTest) {
        expect(redactor.redact(input)).toBe(syncOutput);
      }
    });
  }

  TestCase.only = function (description: string, thingsToTest: Array<InputAssertionTuple>) {
    it.only(description, async () => {
      for (const [input, syncOutput] of thingsToTest) {
        expect(redactor.redact(input)).toBe(syncOutput);
      }
    });
  };

  TestCase('should redact PII', [["Hey it's David Johnson with 1234", "Hey it's PERSON_NAME with DIGITS"]]);
});

import { AsyncRedactor, SyncRedactor } from '../src';

const redactor = new SyncRedactor();
const compositeRedactorWithDLP = new AsyncRedactor({});

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

  it('should be speedy', async function () {
    for (let i = 0; i < 100; i++) {
      redactor.redact('hi I had a quick question about using the service');
    }
  }, 100);

  it('should be speedy even with lots of newlines', async function () {
    let text =
      'foo\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nbar';
    redactor.redact(text);
  }, 100);

  TestCase('should redact PII', [
    [
      "Hey it's David Johnson with ACME Corp. Give me a call at 555-555-5555",
      "Hey it's PERSON_NAME with ACME Corp. Give me a call at PHONE_NUMBER",
    ],
  ]);

  TestCase('should replace names', [
    ['blah blah\nThis is very important.', 'blah blah\nThis is very important.'],
    ['blah blah\n\nThank you ..Risemamy McCrubben', 'blah blah\n\nThank you ..PERSON_NAME'],
    ['blah blah. Thanks -Jon', 'blah blah. Thanks -PERSON_NAME'],

    ["here's my Cliff. blah blah", "here's my Cliff. blah blah", "here's my PERSON_NAME. blah blah"],
    ["here's my Clifford. blah blah", "here's my PERSON_NAME. blah blah", "here's my LAST_NAME. blah blah"],
    ['Dear Clifford,\n blah blah', 'Dear PERSON_NAME,\n blah blah'],
    ['blah blah\n\n\nthanks,\nAnna\n blah blah', 'blah blah\n\n\nthanks,\nPERSON_NAME\n blah blah'],

    ['blah blah\n\n\nAnna\n blah blah', 'blah blah\n\n\nPERSON_NAME\n blah blah'],

    ['blah blah\n\n\nAcme Support\n blah blah', 'blah blah\n\n\nAcme Support\n blah blah'],

    ['blah blah\n\n\n   Joshua\n blah blah', 'blah blah\n\n\n   PERSON_NAME\n blah blah'],

    // Failing ; Acme Support is still recognized as a name and gets replaced
    // return redactor.redactSync('blah blah\n\n\nAll the best,\n\n-Acme Support\n\nfoo bar').then(res => {
    //   assert.equal(res, 'blah blah\n\n\nAll the best,\n\n-Acme Support\n\nfoo bar');
    // });

    [
      'blah blah\n\n\nAll the best,\n\n--Meg C.\n\nAcme Support',
      'blah blah\n\n\nAll the best,\n\n--PERSON_NAME\n\nAcme Support',
    ],

    [
      'blah blah\n\n\nAll the best,\n\n-John\n\nAcme Support',
      'blah blah\n\n\nAll the best,\n\n-PERSON_NAME\n\nAcme Support',
    ],

    ['blah blah\nthanks Joshua.\n blah blah', 'blah blah\nthanks PERSON_NAME.\n blah blah'],

    [
      'Hi David Johnson,\nHow are you?\n\nthanks Joshua.\n blah blah',
      'Hi PERSON_NAME,\nHow are you?\n\nthanks PERSON_NAME.\n blah blah',
    ],

    ['Subject. Hi David Johnson.', 'Subject. Hi PERSON_NAME.'],

    [
      'to hearing from you.\n\nAll the best,\n\nAngel\nCustomer Experience\nwww.foo.com',
      'to hearing from you.\n\nAll the best,\n\nPERSON_NAME\nCustomer Experience\nwww.foo.com',
    ],
    [
      'getting this sorted out.\n\nKindest regards,\n\nFoo Bar\nCustomer Experience',
      'getting this sorted out.\n\nKindest regards,\n\nPERSON_NAME\nCustomer Experience',
    ],
    ['blah.\n\nAffectionately,\n\nFoo Bar\nblah', 'blah.\n\nAffectionately,\n\nPERSON_NAME\nblah'],
    ['blah.\n\nHappy Meditating!\n\nFoo Bar\nblah', 'blah.\n\nHappy Meditating!\n\nPERSON_NAME\nblah'],
    ['blah.\n\nTake care!\n\nFoo Bar\nblah', 'blah.\n\nTake care!\n\nPERSON_NAME\nblah'],
    ['blah.\n\nHave a wonderful weekend.\n\nFoo Bar\nblah', 'blah.\n\nHave a wonderful weekend.\n\nPERSON_NAME\nblah'],
    ['blah blah. Thanks -Jon', 'blah blah. Thanks -PERSON_NAME'],
  ]);

  TestCase('should redact names with accent letters', [
    ['Dear José García, thank you for your inquiry.', 'Dear PERSON_NAME, thank you for your inquiry.'],
    ['Hi François Müller, please review the document.', 'Hi PERSON_NAME, please review the document.'],
    [
      'blah blah\n\n\nAll the best,\n\n-Jürgen Möller\n\nAcme Support',
      'blah blah\n\n\nAll the best,\n\n-PERSON_NAME\n\nAcme Support',
    ],
    ['Thanks for your help.\n\nRegards,\nÁngela Rodríguez', 'Thanks for your help.\n\nRegards,\nPERSON_NAME'],
    ['Hello Péter Nagy, your order is ready.', 'Hello PERSON_NAME, your order is ready.'],
  ]);

  TestCase('should not redact correctly names with hyphens or apostrophes', [
    // Known limitations - these test cases document current behavior but don't test for ideal behavior
    ["Thank you, D'Artagnan, for your service.", "Thank you, D'Artagnan, for your service."],
  ]);

  TestCase('should replace credit card numbers', [
    ['my card: 1234 5678 8765 4321.', 'my card: CREDIT_CARD_NUMBER.'],
    ['my 2nd card: 1234-5678-8765-4321.', 'my 2nd card: CREDIT_CARD_NUMBER.'],
    ['my 3rd card: 1234 5678 8765 4321.', 'my 3rd card: CREDIT_CARD_NUMBER.'],
    ['my AMEX card: 1234 567890 12345.', 'my AMEX card: CREDIT_CARD_NUMBER.'],
    ['my AMEX 2nd card: 1234-567890-12345.', 'my AMEX 2nd card: CREDIT_CARD_NUMBER.'],
    ['my AMEX 3rd card: 123456789012345.', 'my AMEX 3rd card: CREDIT_CARD_NUMBER.'],
    ['my DINERS card: 1234 567890 1234.', 'my DINERS card: CREDIT_CARD_NUMBER.'],
    ['my DINERS 2nd card: 1234-567890-1234.', 'my DINERS 2nd card: CREDIT_CARD_NUMBER.'],
    ['my DINERS 3rd card: 12345678901234.', 'my DINERS 3rd card: CREDIT_CARD_NUMBER.'],
  ]);

  TestCase('should replace ssn', [
    ['my ssn: 123 45 6789.', 'my ssn: US_SOCIAL_SECURITY_NUMBER.'],
    ['my ssn: 123-45-6789.', 'my ssn: US_SOCIAL_SECURITY_NUMBER.'],
    ['my ssn: 123.45.6789.', 'my ssn: US_SOCIAL_SECURITY_NUMBER.'],
    ['my ssn: 123456789.', 'my ssn: DIGITS.'],
  ]);

  TestCase('should replace phone numbers', [
    ['my phone: (+44) (555)123-1234.', 'my phone: PHONE_NUMBER.'],
    ['my phone: 1-555-123-1234.', 'my phone: PHONE_NUMBER.'],

    ['my phone: 555.123.1234.', 'my phone: PHONE_NUMBER.'],

    ['my phone: 5551231234.', 'my phone: PHONE_NUMBER.'],
  ]);

  TestCase('should replace ip addresses', [
    ['my ip: 10.1.1.235.', 'my ip: IP_ADDRESS.'],
    ['my ip: 1234:ABCD:23AF:1111:2222:3333:0000:0000:0000.', 'my ip: IP_ADDRESS.'],
    ['my ip: 1234:ABCD:23AF:1111:2222:3333::!', 'my ip: IP_ADDRESS!'],
  ]);

  TestCase('should replace email addresses', [
    ['my email: joe123@solvvy.co.uk.', 'my email: EMAIL_ADDRESS.'],
    ['my email is other+foobar@t.co.', 'my email is EMAIL_ADDRESS.'],
  ]);

  TestCase('should replace street addresses', [
    [
      'I live at 123 Park Ave Apt 123 New York City, NY 10002',
      'I live at STREET_ADDRESS New York City, NY ZIPCODE',
      'I live at STREET_ADDRESS US_STATE City, LOCATION ZIPCODE',
    ],
    [
      'my address is 56 N First St NY 90210',
      'my address is STREET_ADDRESS NY ZIPCODE',
      'my address is STREET_ADDRESS LOCATION ZIPCODE',
    ],
  ]);

  TestCase('should not replace street words in context', [
    [
      'Oh no worries I live right down the street and up the boulevard',
      'Oh no worries I live right down the street and up the boulevard',
    ],
    [
      'There is no way that I will pay for that circle in court',
      'There is no way that I will pay for that circle in court',
    ],
    ['I have thought of many ways to finish that drive', 'I have thought of many ways to finish that drive'],
  ]);

  TestCase('should replace usernames and passwords', [
    ['here is my username: foobar and my password: baz123', 'here is my USERNAME and my PASSWORD'],
    ['here is the login info: foobar\npassword', 'here is the CREDENTIALS'],

    ['user: thislibrary\npass: 1$d0P3!', 'USERNAME\nPASSWORD'],
  ]);

  it('should respect a custom string replacement', function () {
    let customRedactor = new SyncRedactor({ globalReplaceWith: 'REDACTED' });
    expect(customRedactor.redact('my ip: 10.1.1.235.')).toBe('my ip: REDACTED.');
  });

  it('should accept new patterns', function () {
    let redactor = new SyncRedactor({
      customRedactors: { after: [{ regexpPattern: /\b(cat|dog|cow)s?\b/gi, replaceWith: 'ANIMAL' }] },
    });
    expect(redactor.redact('I love cats, dogs, and cows')).toBe('I love ANIMAL, ANIMAL, and ANIMAL');
  });

  TestCase('should replace digits', [['codeA: 123, codeB: 6789', 'codeA: 123, codeB: DIGITS']]);

  TestCase('should replace URLs', [
    ['My homepage is http://example.com', 'My homepage is URL'],
    ['ip http://127.0.0.1/example.html test', 'ip URL test'],
    ['custom protocol myapp://example.com', 'custom protocol URL'],

    ['Reset password url is https://example.com/reset/password/12345', 'Reset password url is URL'],
    [
      'complex http://user@pass:example.com:8080/reset/password/12345?foo=bar&hi=there#/app works?',
      'complex URL works?',
    ],
    ['before http://www.example.com after', 'before URL after'],
    ['before http://www.example.com:123 after', 'before URL after'],
    ['before http://www.example.com/foo after', 'before URL after'],
    ['before http://www.example.com/foo/bar after', 'before URL after'],
    ['before http://www.example.com/foo/bar?foo=bar after', 'before URL after'],
    ['before http://www.example.com/foo/bar?foo=bar#/foo/bar after', 'before URL after'],
    ['My homepage is http://example.com\nAnd that is that.', 'My homepage is URL\nAnd that is that.'],
  ]);

  TestCase('should replace Canadian social insurance numbers', [
    ['my SIN is 123-456-789', 'my SIN is CANADIAN_SIN'],
    ['SIN: 123 456 789', 'SIN: CANADIAN_SIN'],
    ['The number 123-456-789 is my SIN', 'The number CANADIAN_SIN is my SIN'],
  ]);

  TestCase('should replace Canadian postal codes', [
    ['my postal code is A1A 1A1', 'my postal code is CANADIAN_POSTAL_CODE'],
    ['Postal code: A1A-1A1', 'Postal code: CANADIAN_POSTAL_CODE'],
    ['Please ship to V6G 2Z9', 'Please ship to CANADIAN_POSTAL_CODE'],
    ['Address: 123 Main St, Toronto, ON M5V 2K7', 'Address: STREET_ADDRESS, Toronto, ON CANADIAN_POSTAL_CODE'],
  ]);

  TestCase('should replace Facebook profile URLs', [
    ['Check out my profile at https://www.facebook.com/johnsmith', 'Check out my profile at FACEBOOK_PROFILE'],
    ['FB: facebook.com/jane.doe.123', 'FB: FACEBOOK_PROFILE'],
    ['You can find me on https://facebook.com/john.smith.official/', 'You can find me on FACEBOOK_PROFILE'],
    ['Visit www.facebook.com/companyname for more info', 'Visit FACEBOOK_PROFILE for more info'],
  ]);

  TestCase('should replace LinkedIn profile URLs', [
    ['My LinkedIn: https://www.linkedin.com/in/johnsmith', 'My LinkedIn: LINKEDIN_PROFILE'],
    ['Connect with me: linkedin.com/in/jane-doe-123', 'Connect with me: LINKEDIN_PROFILE'],
    ['Company page: https://www.linkedin.com/company/acme-corp/', 'Company page: LINKEDIN_PROFILE'],
    ['Visit www.linkedin.com/in/johnsmith/ for my resume', 'Visit LINKEDIN_PROFILE for my resume'],
  ]);
});

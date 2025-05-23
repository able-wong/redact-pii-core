import { ISyncRedactor } from '../types';

export class SimpleRegexpRedactor implements ISyncRedactor {
  regexpMatcher: RegExp;
  replaceWith: string;

  constructor({
    replaceWith = 'REDACTED',
    regexpPattern: regexpMatcher,
  }: {
    replaceWith: string;
    regexpPattern: RegExp;
  }) {
    this.replaceWith = replaceWith;
    this.regexpMatcher = regexpMatcher;
  }

  redact(textToRedact: string): string {
    return textToRedact.replace(this.regexpMatcher, this.replaceWith);
  }
}

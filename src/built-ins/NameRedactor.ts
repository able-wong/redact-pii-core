import { ISyncRedactor } from '../types';
import * as _wellKnownNames from './well-known-names.json';

const greetingRegex = /(^|\.\s+)(dear|hi|hello|greetings|hey|hey there)/gi;
const closingRegex =
  /(thx|thanks|thank you|regards|best|[a-z]+ly|[a-z]+ regards|all the best|happy [a-z]+ing|take care|have a [a-z]+ (weekend|night|day))/gi;

const greetingOrClosing = new RegExp(
  '(((' + greetingRegex.source + ')|(' + closingRegex.source + '\\s*[,.!]*))[\\s-]*)',
  'gi',
);

// this will properly match name like "John Doe" or "John D." or "J. Doe" or "J. D." or "J. D.,"
// or names with accents like "José García", "François Müller", etc
// Note: This regex does not handle names with hyphens (e.g., "Mary-Jane Smith")
// or apostrophes (e.g., "O'Connor", "D'Artagnan") correctly and they may not be redacted.
const genericName = new RegExp('( ?(([\\p{Lu}][\\p{Ll}]+)|([\\p{Lu}]\\.))){1,5}([,.]|[,.]?$)', 'gmu');

const wellKnownNames = new RegExp('\\b(\\s*)(\\s*(' + _wellKnownNames.join('|') + '))+\\b', 'gim');

export class NameRedactor implements ISyncRedactor {
  constructor(private replaceWith = 'PERSON_NAME') {}

  redact(textToRedact: string) {
    greetingOrClosing.lastIndex = 0;
    genericName.lastIndex = 0;
    let greetingOrClosingMatch = greetingOrClosing.exec(textToRedact);
    while (greetingOrClosingMatch !== null) {
      genericName.lastIndex = greetingOrClosing.lastIndex;
      const genericNameMatch = genericName.exec(textToRedact);
      if (genericNameMatch !== null && genericNameMatch.index === greetingOrClosing.lastIndex) {
        const suffix = genericNameMatch[5] === null ? '' : genericNameMatch[5];
        textToRedact =
          textToRedact.slice(0, genericNameMatch.index) +
          this.replaceWith +
          suffix +
          textToRedact.slice(genericNameMatch.index + genericNameMatch[0].length);
      }
      greetingOrClosingMatch = greetingOrClosing.exec(textToRedact);
    }

    textToRedact = textToRedact.replace(wellKnownNames, '$1' + this.replaceWith);

    return textToRedact;
  }
}

import { ISyncRedactor } from '../types';
import * as _wellKnownNames from './well-known-names.json';

export class NameRedactor implements ISyncRedactor {
  // Regex for greetings like "Dear", "Hello", etc.
  private static readonly GREETING_REGEX = /(^|\.\s+)(dear|hi|hello|greetings|hey|hey there)/gi;

  // Regex for closings like "Thanks", "Regards", "Sincerely", etc.
  private static readonly CLOSING_REGEX =
    /(thx|thanks|thank you|regards|best|[a-z]+ly|[a-z]+ regards|all the best|happy [a-z]+ing|take care|have a [a-z]+ (weekend|night|day))/gi;

  // Combined regex for greeting or closing expressions
  private static readonly GREETING_OR_CLOSING = new RegExp(
    '(((' + NameRedactor.GREETING_REGEX.source + ')|(' + NameRedactor.CLOSING_REGEX.source + '\\s*[,.!]*))[\\s-]*)',
    'gi',
  );

  // Regex for generic name patterns
  // Matches: "John Doe", "John D.", "J. Doe", "J. D.", "J. D.,"
  // Handles names with accents like "José García", "François Müller", etc.
  // Note: Does not handle hyphenated names or names with apostrophes
  private static readonly GENERIC_NAME = new RegExp(
    '( ?(([\\p{Lu}][\\p{Ll}]+)|([\\p{Lu}]\\.))){1,5}([,.]|[,.]?$)',
    'gmu',
  );

  // Temporary placeholder used during well-known name replacement
  private static readonly TEMP_NAME_PLACEHOLDER = '{{{PERSON_NAME}}}';

  // Set of well-known names (lowercase) for quick lookup
  private static readonly WELL_KNOWN_NAMES_SET = new Set(_wellKnownNames.map((name) => name.toLowerCase()));

  constructor(private replaceWith = 'PERSON_NAME') {}

  /**
   * Main redaction method that applies multiple strategies to redact names
   */
  redact(textToRedact: string): string {
    // First, redact names that appear after greetings or before closings
    textToRedact = this.redactNamesAfterGreetingsOrClosings(textToRedact);

    // Then, redact any well-known names from our dictionary
    textToRedact = this.redactWellKnownNames(textToRedact);

    return textToRedact;
  }

  /**
   * Redacts names that appear after greeting phrases or before closing phrases
   */
  private redactNamesAfterGreetingsOrClosings(text: string): string {
    const { GREETING_OR_CLOSING, GENERIC_NAME } = NameRedactor;

    GREETING_OR_CLOSING.lastIndex = 0;
    GENERIC_NAME.lastIndex = 0;
    let result = text;
    let greetingOrClosingMatch = GREETING_OR_CLOSING.exec(result);

    while (greetingOrClosingMatch !== null) {
      GENERIC_NAME.lastIndex = GREETING_OR_CLOSING.lastIndex;
      const genericNameMatch = GENERIC_NAME.exec(result);

      if (genericNameMatch !== null && genericNameMatch.index === GREETING_OR_CLOSING.lastIndex) {
        const suffix = genericNameMatch[5] === null ? '' : genericNameMatch[5];
        result =
          result.slice(0, genericNameMatch.index) +
          this.replaceWith +
          suffix +
          result.slice(genericNameMatch.index + genericNameMatch[0].length);

        // Reset the regex indices after modifying the string
        GREETING_OR_CLOSING.lastIndex = 0;
      }

      greetingOrClosingMatch = GREETING_OR_CLOSING.exec(result);
    }

    return result;
  }

  /**
   * Redacts well-known names from a predefined list
   */
  private redactWellKnownNames(text: string): string {
    const { TEMP_NAME_PLACEHOLDER, WELL_KNOWN_NAMES_SET } = NameRedactor;
    let result = text;

    // 1. Replace well-known names with temporary placeholders
    const words = result.split(/\b/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i].trim().toLowerCase();
      if (word && WELL_KNOWN_NAMES_SET.has(word)) {
        words[i] = TEMP_NAME_PLACEHOLDER;
      }
    }
    result = words.join('');

    // 2. Consolidate multiple adjacent placeholders into a single replacement
    const multiNameRegex = new RegExp(`${TEMP_NAME_PLACEHOLDER}(\\s+${TEMP_NAME_PLACEHOLDER})+`, 'g');
    result = result.replace(multiNameRegex, this.replaceWith);

    // 3. Replace any remaining temporary placeholders
    result = result.replace(new RegExp(TEMP_NAME_PLACEHOLDER, 'g'), this.replaceWith);

    return result;
  }
}

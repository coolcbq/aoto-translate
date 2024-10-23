import fs from 'fs/promises';
import OpenAI from 'openai';
import path from 'path';
import config from '../lingui.config';
import { languageI18nNames } from '../src/const';

const directoryPath = path.join(process.cwd(), 'src/locales');
const keywordsPath = path.join(process.cwd(), 'scripts/keywords.txt');

if (!process.env['OPENAI_API_KEY']) {
  throw new Error('OPENAI_API_KEY is not set');
}

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

async function translate(prompt: string): Promise<string> {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o-mini',
  });

  return chatCompletion.choices[0]?.message.content || '';
}

async function processLanguage(language: string): Promise<number> {
  if (language === config.sourceLocale) {
    return 0;
  }
  console.log(`Processing language: ${language}`);

  const data = await fs.readFile(path.join(directoryPath, `${language}.json`), 'utf8');
  const json: { [key: string]: { message: string; translation: string } } = JSON.parse(data);
  const keys = Object.keys(json);

  const needTranslateKeys: { [key: string]: string } = {};
  let errorPrinted = false;
  keys.forEach(function (key) {
    if (Object.keys(needTranslateKeys).length >= 20) {
      if (!errorPrinted) {
        console.log("Too many translations needed for current language file, please execute multiple times to avoid omissions");
        errorPrinted = true;
      }
      // skip the rest of the keys
    } else if (!json[key]['translation'] || json[key]['translation'] === '') {
      needTranslateKeys[key] = json[key]['message'];
    }
  });

  if (Object.keys(needTranslateKeys).length === 0) {
    console.log("Current language file is fully translated, no translation needed");
    return 0;
  }

  const remainingKeys = keys.filter(key => !json[key]['translation'] || json[key]['translation'] === '');

  const languageName = languageI18nNames[language as keyof typeof languageI18nNames];

  console.log(`Current language: ${language} (${languageName}), translating ${Object.keys(needTranslateKeys).length} keys. (${keys.length - remainingKeys.length}/${keys.length})`);

  const keywords = await fs.readFile(keywordsPath, 'utf8');
  const keywordsList = keywords.split('\n').filter(keyword => keyword.trim() !== '');

  const prompt = `
You are an AI expert skilled in data processing and multilingual translation, capable of efficiently handling JSON data and flexibly addressing various language requirements.

- Consider professional terminology and formal style in the translation, suitable for official documents and formal communication.
- Output the translation result as JSON content with keys unchanged, directly output json content without adding \`\`\`json\`\`\` tags. Do not provide any explanations.
- Ensure JSON format accuracy, making sure keys and content appear in pairs.
- Consider using local idioms for translation rather than simple word-for-word translation, understand the original text's context to find local expressions for translation.
- Target language for translation: ${languageName} (2-character iso code: ${language})
- Do not provide any explanations, directly output json content, and do not output \`\`\`json\`\`\` tags.

- IMPORTANT: The following keywords MUST NOT be translated under any circumstances. You MUST keep the original text exactly as it is. Failure to preserve these terms in their original form will result in critical errors. Double-check your output to ensure these terms remain untouched.

${keywordsList.join(', ')}

- Input JSON data:

${JSON.stringify(needTranslateKeys, null, 2)}
`;

  let msg = await translate(prompt);
  console.log("OpenAI response:", msg);

  const safeJSONParse = (str: string): any | null => {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("JSON parsing failed, attempting to fix");
      str = str.replace(/[\u0000-\u001F]+/g, "");
      str = str.replace(/(["\]}])([^,\]}])/g, "$1,$2");
      str = str.replace(/([\[{])\s*,/g, "$1");
      str = str.replace(/,\s*([\]}])/g, "$1");
      try {
        return JSON.parse(str);
      } catch (e) {
        console.error("Still unable to parse JSON after fix", e);
        return null;
      }
    }
  };

  msg = safeJSONParse(msg);

  if (msg === null) {
    console.error("Unable to parse returned JSON data");
    return remainingKeys.length;
  } else {
    keys.forEach(function (key) {
      if (msg[key as keyof typeof msg]) {
        json[key]['translation'] = msg[key as keyof typeof msg] as string;
      }
    });
    const jsonStr = JSON.stringify(json, null, 2);
    await fs.writeFile(path.join(directoryPath, `${language}.json`), jsonStr, 'utf8');
    return remainingKeys.length - Object.keys(needTranslateKeys).length;
  }
}

async function processLanguagesInQueue(languages: string[], concurrency = 3, autoMode = false): Promise<string[]> {
  const queue = [...languages];
  const inProgress = new Set<string>();
  const results: string[] = [];

  async function processNext(): Promise<void> {
    if (queue.length === 0) return;
    const language = queue.shift()!;
    inProgress.add(language);

    try {
      let remainingKeys: number;
      do {
        remainingKeys = await processLanguage(language);
        if (autoMode && remainingKeys > 0) {
          console.log(`Auto mode: Reprocessing ${language}, ${remainingKeys} keys remaining`);
        }
      } while (autoMode && remainingKeys > 0);

      results.push(`${language} processing completed`);
    } catch (error) {
      results.push(`${language} processing failed: ${(error as Error).message}`);
    } finally {
      inProgress.delete(language);
      if (queue.length > 0) {
        await processNext();
      }
    }
  }

  const workers = Array(Math.min(concurrency, languages.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
}

async function main(): Promise<void> {
  try {
    const autoMode = process.argv.includes('--auto');
    if (autoMode) {
      console.log('Auto mode is enabled, will reprocess all languages with remaining keys');
    }
    const languagesToProcess = config.locales.filter((lang: string) => lang !== config.sourceLocale);
    const results = await processLanguagesInQueue(languagesToProcess, 3, autoMode);
    console.log("Processing results:", results.join('\n'));
  } catch (err) {
    console.error('Error:', err);
  }
}

main();

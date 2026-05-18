import { readdirSync } from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { loadChallenge } from '../challenge/loader.js';
import { getBundledChallengesDir } from '../utils/paths.js';

export interface ChallengesOptions {
  json?: boolean;
}

export async function runChallenges(options: ChallengesOptions): Promise<number> {
  const dir = getBundledChallengesDir();
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .sort();

  const items = files.map((file) => {
    const full = path.join(dir, file);
    const c = loadChallenge(full);
    return {
      file,
      id: c.id,
      title: c.title.ru,
      tasks: c.tasks.length,
      minutes: c.estimated_minutes,
    };
  });

  if (options.json) {
    console.log(JSON.stringify(items, null, 2));
    return 0;
  }

  console.log(pc.bold('Bundled challenges'));
  console.log(pc.dim(dir));
  console.log('');
  for (const item of items) {
    console.log(
      `  ${pc.cyan(item.file)} — ${item.title} (${item.tasks} tasks${item.minutes ? `, ~${item.minutes} min` : ''})`,
    );
  }
  return 0;
}

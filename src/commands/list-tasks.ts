import pc from 'picocolors';
import { loadChallenge } from '../challenge/loader.js';
import { resolveChallengePath } from '../utils/paths.js';

export interface ListTasksOptions {
  challenge: string;
  json?: boolean;
}

export async function runListTasks(options: ListTasksOptions): Promise<number> {
  const path = resolveChallengePath(options.challenge);
  const challenge = loadChallenge(path);

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          id: challenge.id,
          network: challenge.network,
          title: challenge.title,
          tasks: challenge.tasks.map((t) => ({
            name: t.name,
            type: t.type,
            hint: t.hint?.ru,
          })),
        },
        null,
        2,
      ),
    );
    return 0;
  }

  console.log(pc.bold(challenge.title.ru));
  console.log(pc.dim(`id: ${challenge.id} | network: ${challenge.network}`));
  console.log('');
  challenge.tasks.forEach((task, i) => {
    console.log(`  ${i + 1}. ${pc.cyan(task.name)} (${task.type})`);
    if (task.hint?.ru) {
      console.log(pc.dim(`     → ${task.hint.ru}`));
    }
  });
  return 0;
}

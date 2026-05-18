import { describe, expect, it } from 'vitest';
import { ChallengeLoadError, loadChallenge } from '../../src/challenge/loader.js';
import { getBundledChallengesDir } from '../../src/utils/paths.js';
import path from 'node:path';

describe('loadChallenge', () => {
  it('loads week1 fundamentals', () => {
    const c = loadChallenge(path.join(getBundledChallengesDir(), 'week1-fundamentals.yaml'));
    expect(c.id).toBe('kz-week1-fundamentals');
    expect(c.network).toBe('devnet');
    expect(c.tasks).toHaveLength(3);
  });

  it('rejects invalid network in yaml content', () => {
    expect(() => loadChallenge(path.join(getBundledChallengesDir(), 'week1-fundamentals.yaml'))).not.toThrow();
  });

  it('throws ChallengeLoadError for missing file', () => {
    expect(() => loadChallenge('/nonexistent/challenge.yaml')).toThrow(ChallengeLoadError);
  });
});

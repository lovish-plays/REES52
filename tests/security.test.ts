import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../src/lib/rateLimit.ts';
import { normalizeRole, isTeacherRole } from '../src/lib/auth/roles.ts';

describe('Security & Authorization Unit Tests', () => {
  it('should accurately resolve teacher role boundaries', () => {
    assert.equal(isTeacherRole('Teacher'), true);
    assert.equal(isTeacherRole('Admin'), true);
    assert.equal(isTeacherRole('Student'), false);
    assert.equal(isTeacherRole(undefined), false);
    assert.equal(normalizeRole('STUDENT'), 'Student');
  });

  it('should enforce rate limits on consecutive actions', async () => {
    const actionKey = 'test-action-' + Math.random().toString(36).substring(7);

    // 1st request should pass
    const req1 = await checkRateLimit({
      limit: 2,
      windowSeconds: 60,
      action: 'security-test',
      key: actionKey,
    });
    assert.equal(req1.success, true);
    assert.equal(req1.remaining, 1);

    // 2nd request should pass
    const req2 = await checkRateLimit({
      limit: 2,
      windowSeconds: 60,
      action: 'security-test',
      key: actionKey,
    });
    assert.equal(req2.success, true);
    assert.equal(req2.remaining, 0);

    // 3rd request should fail with rate limit error
    const req3 = await checkRateLimit({
      limit: 2,
      windowSeconds: 60,
      action: 'security-test',
      key: actionKey,
    });
    assert.equal(req3.success, false);
    assert.ok(req3.error?.includes('Too many requests'));
  });
});

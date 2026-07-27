import { test, expect } from '@playwright/test';

test.describe('REES52 Academy', () => {
  test('home page, navigation, and responsive layout are usable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.premium-splash-overlay')).toBeHidden({ timeout: 10_000 });

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Learn Robotics, AI, IoT & Electronics Through Real Projects',
      }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Courses' })).toBeVisible();

    const moreNavigation = page.getByRole('button', { name: 'More navigation' });
    await expect(moreNavigation).toHaveCount(1);
    await moreNavigation.click();
    await expect(page.getByRole('link', { name: /Courses Structured robotics/ })).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
  });

  test('development sign-up and password recovery flow works', async ({ page }, testInfo) => {
    const email = `recovery-${testInfo.project.name}-${Date.now()}@example.test`;
    const originalPassword = 'OriginalPassword123!';
    const newPassword = 'NewPassword456!';

    await page.goto('/');
    await expect(page.locator('.premium-splash-overlay')).toBeHidden({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: "DON'T HAVE AN ACCOUNT? SIGN UP" }).click();
    await page.getByPlaceholder('Your name').fill('Recovery Test User');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(originalPassword);
    await page.getByRole('button', { name: 'SIGN UP' }).click();

    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });
    const userMenu = page.getByRole('button', { name: 'User menu' });
    await expect(userMenu).toBeVisible();
    await userMenu.click();
    await page.getByText('Sign Out', { exact: true }).click();
    await page.waitForURL(/\/login/);

    await page.getByRole('button', { name: 'Forgot Password?' }).click();
    await page.getByPlaceholder('Enter email').fill(email);
    await page.getByRole('button', { name: 'SEND RESET OTP' }).click();

    const developmentCode = page.locator('code');
    await expect(developmentCode).toBeVisible();
    const otp = (await developmentCode.innerText()).trim();
    expect(otp).toMatch(/^\d{6}$/);

    await page.getByPlaceholder('Enter 6-digit OTP').fill(otp);
    await page.getByRole('button', { name: 'VERIFY OTP' }).click();
    await page.getByPlaceholder('••••••••').fill(newPassword);
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    await expect(page.getByRole('heading', { name: 'PASSWORD RESET COMPLETE' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter email')).toBeVisible({ timeout: 5_000 });
    await page.getByPlaceholder('Enter email').fill(email);
    await page.getByPlaceholder('••••••••').fill(newPassword);
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    await page.waitForURL(/\/$/, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
  });
});

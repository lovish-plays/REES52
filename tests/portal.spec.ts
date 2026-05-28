import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'src/lib/db-store.json');

test.describe('REES52 Educational Portal E2E Workflow', () => {

  test('Student Registration, Auth Flows, Content Explorer, Responsive Media Views, and REDIRECT Sidebar', async ({ page, isMobile }) => {
    
    // 1. Visit Portal Home Page
    await page.goto('/');
    
    // Verify high-tech branding
    await expect(page.locator('h1')).toContainText('INFINITY LEARNING HUB');
    
    // Read local database user count before registration
    const dbBefore = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const initialUserCount = dbBefore.users.length;
    
    // Generate a unique mock student email
    const studentEmail = `student-${Date.now()}@rees52.com`;

    // 2. Open Login / Sign In Modal
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('h2')).toContainText('WELCOME BACK');

    // 3. Toggle to Sign Up Mode
    await page.click('button:has-text("DON\'T HAVE AN ACCOUNT? SIGN UP")');
    await expect(page.locator('h2')).toContainText('CREATE ACCOUNT');

    // 4. Input Student registration details
    await page.fill('input[placeholder="Your name"]', 'Robo Student');
    await page.fill('input[placeholder="you@example.com"]', studentEmail);
    await page.fill('input[placeholder="••••••••"]', 'password123');

    // 5. Submit Sign Up Form
    await page.click('button[type="submit"]');

    // Modal should close and login button should disappear
    await expect(page.locator('button:has-text("Sign In")')).toHaveCount(0);

    // Verify database insertion in the local file store
    const dbAfter = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const registeredUser = dbAfter.users.find((u: any) => u.email === studentEmail);
    
    expect(registeredUser).toBeDefined();
    expect(registeredUser.name).toBe('Robo Student');
    expect(registeredUser.role).toBe('Student');
    expect(dbAfter.users.length).toBe(initialUserCount + 1);

    // 6. Sign Out
    if (isMobile) {
      // Mobile header layout: click the avatar button
      await page.click('button[aria-label="User menu"]');
    } else {
      // Desktop header layout: click "Hi, Robo" dropdown trigger
      await page.click('button:has-text("Hi, Robo")');
    }
    await page.click('button:has-text("Sign Out")');

    // Sign In button should reappear
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

    // 7. Log back in
    await page.click('button:has-text("Sign In")');
    await page.fill('input[placeholder="Enter email"]', studentEmail);
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');

    // Modal should close
    await expect(page.locator('button:has-text("Sign In")')).toHaveCount(0);

    // 8. Open 3-dot overlay menu
    await page.click('button[aria-label="More navigation"]');
    await expect(page.locator('h3:has-text("Explore Content")')).toBeVisible();

    // 9. Navigate to Ebooks Section
    await page.click('a:has-text("EBOOKS")');
    await expect(page).toHaveURL(/\/\?type=ebooks/);

    // 10. Filter by "Arduino & Microcontrollers" category
    await page.selectOption('select', { label: 'Arduino & Microcontrollers' });
    
    // Verify only matching category is displayed
    await expect(page.locator('h3:has-text("Getting Started with Arduino Uno R3")')).toBeVisible();
    await expect(page.locator('h3:has-text("DIY 4WD Smart Car Building Guide")')).toHaveCount(0);

    // 11. View Ebook modal detail page, unlock it, and then redirect
    await page.click('h3:has-text("Getting Started with Arduino Uno R3")');
    await expect(page.locator('.fixed.inset-0 h2:has-text("Getting Started with Arduino Uno R3")')).toBeVisible();
    await page.click('.fixed.inset-0 button:has-text("Unlock Ebook")');
    await expect(page.locator('.fixed.inset-0').locator('text=Ebook Unlocked')).toBeVisible();
    await page.click('.fixed.inset-0 a:has-text("Open & Read Ebook PDF")');
    await expect(page).toHaveURL(/\/ebooks\/ebk-1/);

    // 12. Verify responsive PDF viewer iframe
    const pdfReader = page.locator('iframe[title="Getting Started with Arduino Uno R3"]');
    await expect(pdfReader).toBeVisible();

    // 13. Verify Product Redirection Sidebar Callout Card
    const sidebarProductTitle = page.locator('h4:has-text("REES52 Uno R3 Starter Kit")');
    await expect(sidebarProductTitle).toBeVisible();

    const redirectCTA = page.locator('a:has-text("Buy Hardware Kit")');
    await expect(redirectCTA).toBeVisible();
    await expect(redirectCTA).toHaveAttribute('href', 'https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html');
    await expect(redirectCTA).toHaveAttribute('target', '_blank');

    // 14. Navigate to Video Lecture detail page to test player
    await page.goto('/videos/vid-1');
    const youtubePlayer = page.locator('iframe[title="Arduino Uno Setup and Blink Tutorial"]');
    await expect(youtubePlayer).toBeVisible();
    
    const youtubeCTA = page.locator('a:has-text("Watch Full Video on YouTube")');
    await expect(youtubeCTA).toBeVisible();
    await expect(youtubeCTA).toHaveAttribute('href', 'https://www.youtube.com/watch?v=d8_xXNcGYgo');
  });

});

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> REES52 Educational Portal E2E Workflow >> Student Registration, Auth Flows, Content Explorer, Responsive Media Views, and REDIRECT Sidebar
- Location: tests/portal.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h3:has-text("Getting Started with Arduino Uno R3")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h3:has-text("Getting Started with Arduino Uno R3")')

```

```yaml
- img: ACTUATOR_L.01
- img: CORE.SYS_OK
- banner:
  - link "REES52 Infinity Learning Hub":
    - /url: /
  - button "User menu": R
  - button "More navigation"
- main:
  - heading "REES52 INFINITY LEARNING HUB" [level=1]
  - paragraph: Content Explorer • Robotics • Embedded Systems • STEM
  - textbox "Search lectures, ebooks, webinars..."
  - combobox:
    - option "All Categories"
    - option "Arduino & Microcontrollers" [selected]
    - option "Drones & Quadcopters"
    - option "IoT & Sensors"
    - option "Robotics & Smart Cars"
  - button "ALL"
  - button "EBOOKS"
  - button "VIDEOS"
  - button "LIVE"
  - paragraph: No matching content found.
  - paragraph: Try clearing filters or search query.
- contentinfo:
  - link "REES52 Infinity Learning":
    - /url: /
  - paragraph: Since 2013, Robotics Embedded Education Services Private Limited (REES52) has been a prominent Indian distributor and manufacturer specializing in robotics, DIY electronics, and IoT components. Popular among makers, students, and the drone racing community, we provide microcontrollers, sensors, starter kits, and specialized FPV drone accessories.
  - text: Empowering Makers Since 2013
  - heading "Ecosystem Categories" [level=4]
  - list:
    - listitem: Development Boards & Kits Microcontrollers compatible with Arduino (e.g. UNO R3), Raspberry Pi, and STEM/Tinkering kits.
    - listitem: Electronic Components Sensors, relays, motors, and power supply modules.
    - listitem: Drone Accessories High-performance propellers and specialized FPV parts.
    - listitem: Learning & Workshops Educational IoT training classes and workshops.
  - heading "Learning Portal" [level=4]
  - list:
    - listitem:
      - link "Content Explorer":
        - /url: /
    - listitem:
      - link "My Learning Lectures":
        - /url: /my-learning
    - listitem:
      - link "My Unlocked Ebooks":
        - /url: /my-stuff
  - heading "Official Store" [level=4]
  - link "Explore REES52 Catalog":
    - /url: https://rees52.com
  - heading "Support Channels" [level=4]
  - link "support@rees52.com":
    - /url: mailto:support@rees52.com
  - heading "Social Connections" [level=4]
  - link "YouTube Channel":
    - /url: https://www.youtube.com/@REES52_Official
    - img
  - link "LinkedIn Profile":
    - /url: https://www.linkedin.com/company/rees-52/
    - img
  - link "Facebook Page":
    - /url: https://www.facebook.com/rees52education/
    - img
  - link "Instagram Handle":
    - /url: https://www.instagram.com/rees52_b2b
    - img
  - link "X Profile":
    - /url: https://x.com/rees52education
    - img
  - text: © 2026 REES52 (Robotics Embedded Education Services Private Limited). All rights reserved. Premium STEM & Drone Education Solutions Since 2013
- button "Aelos AI Chatbot"
- alert
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import fs from 'fs';
  3   | import path from 'path';
  4   | 
  5   | const DB_PATH = path.resolve(process.cwd(), 'src/lib/db-store.json');
  6   | 
  7   | test.describe('REES52 Educational Portal E2E Workflow', () => {
  8   | 
  9   |   test('Student Registration, Auth Flows, Content Explorer, Responsive Media Views, and REDIRECT Sidebar', async ({ page, isMobile }) => {
  10  |     
  11  |     // 1. Visit Portal Home Page
  12  |     await page.goto('/');
  13  |     
  14  |     // Verify high-tech branding
  15  |     await expect(page.locator('h1')).toContainText('INFINITY LEARNING HUB');
  16  |     
  17  |     // Read local database user count before registration
  18  |     const dbBefore = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  19  |     const initialUserCount = dbBefore.users.length;
  20  |     
  21  |     // Generate a unique mock student email
  22  |     const studentEmail = `student-${Date.now()}@rees52.com`;
  23  | 
  24  |     // 2. Open Login / Sign In Modal
  25  |     await page.click('button:has-text("Sign In")');
  26  |     await expect(page.locator('h2')).toContainText('WELCOME BACK');
  27  | 
  28  |     // 3. Toggle to Sign Up Mode
  29  |     await page.click('button:has-text("DON\'T HAVE AN ACCOUNT? SIGN UP")');
  30  |     await expect(page.locator('h2')).toContainText('CREATE ACCOUNT');
  31  | 
  32  |     // 4. Input Student registration details
  33  |     await page.fill('input[placeholder="Your name"]', 'Robo Student');
  34  |     await page.fill('input[placeholder="you@example.com"]', studentEmail);
  35  |     await page.fill('input[placeholder="••••••••"]', 'password123');
  36  | 
  37  |     // 5. Submit Sign Up Form
  38  |     await page.click('button[type="submit"]');
  39  | 
  40  |     // Modal should close and login button should disappear
  41  |     await expect(page.locator('button:has-text("Sign In")')).toHaveCount(0);
  42  | 
  43  |     // Verify database insertion in the local file store
  44  |     const dbAfter = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  45  |     const registeredUser = dbAfter.users.find((u: any) => u.email === studentEmail);
  46  |     
  47  |     expect(registeredUser).toBeDefined();
  48  |     expect(registeredUser.name).toBe('Robo Student');
  49  |     expect(registeredUser.role).toBe('Student');
  50  |     expect(dbAfter.users.length).toBe(initialUserCount + 1);
  51  | 
  52  |     // 6. Sign Out
  53  |     if (isMobile) {
  54  |       // Mobile header layout: click the avatar button
  55  |       await page.click('button[aria-label="User menu"]');
  56  |     } else {
  57  |       // Desktop header layout: click "Hi, Robo" dropdown trigger
  58  |       await page.click('button:has-text("Hi, Robo")');
  59  |     }
  60  |     await page.click('button:has-text("Sign Out")');
  61  | 
  62  |     // Sign In button should reappear
  63  |     await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  64  | 
  65  |     // 7. Log back in
  66  |     await page.click('button:has-text("Sign In")');
  67  |     await page.fill('input[placeholder="Enter email"]', studentEmail);
  68  |     await page.fill('input[placeholder="••••••••"]', 'password123');
  69  |     await page.click('button[type="submit"]');
  70  | 
  71  |     // Modal should close
  72  |     await expect(page.locator('button:has-text("Sign In")')).toHaveCount(0);
  73  | 
  74  |     // 8. Open 3-dot overlay menu
  75  |     await page.click('button[aria-label="More navigation"]');
  76  |     await expect(page.locator('h3:has-text("Explore Content")')).toBeVisible();
  77  | 
  78  |     // 9. Navigate to Ebooks Section
  79  |     await page.click('a:has-text("EBOOKS")');
  80  |     await expect(page).toHaveURL(/\/\?type=ebooks/);
  81  | 
  82  |     // 10. Filter by "Arduino & Microcontrollers" category
  83  |     await page.selectOption('select', { label: 'Arduino & Microcontrollers' });
  84  |     
  85  |     // Verify only matching category is displayed
> 86  |     await expect(page.locator('h3:has-text("Getting Started with Arduino Uno R3")')).toBeVisible();
      |                                                                                      ^ Error: expect(locator).toBeVisible() failed
  87  |     await expect(page.locator('h3:has-text("DIY 4WD Smart Car Building Guide")')).toHaveCount(0);
  88  | 
  89  |     // 11. View Ebook modal detail page, unlock it, and then redirect
  90  |     await page.click('h3:has-text("Getting Started with Arduino Uno R3")');
  91  |     await expect(page.locator('.fixed.inset-0 h2:has-text("Getting Started with Arduino Uno R3")')).toBeVisible();
  92  |     await page.click('.fixed.inset-0 button:has-text("Unlock Ebook")');
  93  |     await expect(page.locator('.fixed.inset-0').locator('text=Ebook Unlocked')).toBeVisible();
  94  |     await page.click('.fixed.inset-0 a:has-text("Open & Read Ebook PDF")');
  95  |     await expect(page).toHaveURL(/\/ebooks\/ebk-1/);
  96  | 
  97  |     // 12. Verify responsive PDF viewer iframe
  98  |     const pdfReader = page.locator('iframe[title="Getting Started with Arduino Uno R3"]');
  99  |     await expect(pdfReader).toBeVisible();
  100 | 
  101 |     // 13. Verify Product Redirection Sidebar Callout Card
  102 |     const sidebarProductTitle = page.locator('h4:has-text("REES52 Uno R3 Starter Kit")');
  103 |     await expect(sidebarProductTitle).toBeVisible();
  104 | 
  105 |     const redirectCTA = page.locator('a:has-text("Buy Hardware Kit")');
  106 |     await expect(redirectCTA).toBeVisible();
  107 |     await expect(redirectCTA).toHaveAttribute('href', 'https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html');
  108 |     await expect(redirectCTA).toHaveAttribute('target', '_blank');
  109 | 
  110 |     // 14. Navigate to Video Lecture detail page to test player
  111 |     await page.goto('/videos/vid-1');
  112 |     const youtubePlayer = page.locator('iframe[title="Arduino Uno Setup and Blink Tutorial"]');
  113 |     await expect(youtubePlayer).toBeVisible();
  114 |     
  115 |     const youtubeCTA = page.locator('a:has-text("Watch Full Video on YouTube")');
  116 |     await expect(youtubeCTA).toBeVisible();
  117 |     await expect(youtubeCTA).toHaveAttribute('href', 'https://www.youtube.com/watch?v=d8_xXNcGYgo');
  118 |   });
  119 | 
  120 | });
  121 | 
```
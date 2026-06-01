# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> REES52 Educational Portal E2E Workflow >> Student Registration, Auth Flows, Content Explorer, Responsive Media Views, and REDIRECT Sidebar
- Location: tests/portal.spec.ts:9:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('button:has-text("Sign In")')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('button:has-text("Sign In")')
    13 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic:
  - generic:
    - img:
      - generic: ACTUATOR_L.01
    - img:
      - generic: CORE.SYS_OK
  - banner:
    - generic:
      - link:
        - /url: /
        - generic:
          - img
        - generic:
          - generic: REES52
          - generic: Infinity Learning Hub
      - generic:
        - button: Sign In
  - main:
    - generic:
      - generic:
        - generic:
          - heading [level=1]: REES52 INFINITY LEARNING HUB
          - paragraph: Content Explorer • Robotics • Embedded Systems • STEM
        - generic:
          - generic:
            - generic:
              - img
              - textbox:
                - /placeholder: Search lectures, ebooks, webinars...
            - combobox
          - generic:
            - button: ALL
            - button: EBOOKS
            - button: VIDEOS
            - button: LIVE
        - generic:
          - paragraph: No matching content found.
          - paragraph: Try clearing filters or search query.
  - contentinfo:
    - generic:
      - generic:
        - link:
          - /url: /
          - generic:
            - img
          - generic: REES52 Infinity Learning
        - paragraph: Since 2013, Robotics Embedded Education Services Private Limited (REES52) has been a prominent Indian distributor and manufacturer specializing in robotics, DIY electronics, and IoT components. Popular among makers, students, and the drone racing community, we provide microcontrollers, sensors, starter kits, and specialized FPV drone accessories.
        - generic:
          - img
          - generic: Empowering Makers Since 2013
      - generic:
        - heading [level=4]:
          - img
          - generic: Ecosystem Categories
        - list:
          - listitem:
            - generic: Development Boards & Kits
            - generic: Microcontrollers compatible with Arduino (e.g. UNO R3), Raspberry Pi, and STEM/Tinkering kits.
          - listitem:
            - generic: Electronic Components
            - generic: Sensors, relays, motors, and power supply modules.
          - listitem:
            - generic: Drone Accessories
            - generic: High-performance propellers and specialized FPV parts.
          - listitem:
            - generic: Learning & Workshops
            - generic: Educational IoT training classes and workshops.
      - generic:
        - heading [level=4]: Learning Portal
        - list:
          - listitem:
            - link:
              - /url: /
              - text: Content Explorer
          - listitem:
            - link:
              - /url: /my-learning
              - text: My Learning Lectures
          - listitem:
            - link:
              - /url: /my-stuff
              - text: My Unlocked Ebooks
      - generic:
        - generic:
          - heading [level=4]: Official Store
          - link:
            - /url: https://rees52.com
            - generic: Explore REES52 Catalog
            - img
        - generic:
          - heading [level=4]: Support Channels
          - link:
            - /url: mailto:support@rees52.com
            - img
            - generic: support@rees52.com
        - generic:
          - heading [level=4]: Social Connections
          - generic:
            - link:
              - /url: https://www.youtube.com/@REES52_Official
              - img
            - link:
              - /url: https://www.linkedin.com/company/rees-52/
              - img
            - link:
              - /url: https://www.facebook.com/rees52education/
              - img
            - link:
              - /url: https://www.instagram.com/rees52_b2b
              - img
            - link:
              - /url: https://x.com/rees52education
              - img
    - generic:
      - generic: © 2026 REES52 (Robotics Embedded Education Services Private Limited). All rights reserved.
      - generic: Premium STEM & Drone Education Solutions Since 2013
  - button:
    - img
  - alert
  - dialog "WELCOME BACK" [active] [ref=e2]:
    - generic [ref=e3]:
      - heading "WELCOME BACK" [level=2] [ref=e5]
      - paragraph [ref=e6]: Sign in to access your learning dashboard.
    - generic [ref=e7]:
      - generic [ref=e8]:
        - text: Email
        - textbox "Email" [disabled] [ref=e9]:
          - /placeholder: Enter email
          - text: student-1779960236040@rees52.com
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: Password
          - button "Forgot Password?" [ref=e13] [cursor=pointer]
        - textbox "Password" [ref=e14]:
          - /placeholder: ••••••••
          - text: password123
      - button "PROCESSING..." [disabled]:
        - img
        - text: PROCESSING...
      - button "DON'T HAVE AN ACCOUNT? SIGN UP" [ref=e15] [cursor=pointer]
    - button "Close" [ref=e16]:
      - img [ref=e17]
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
> 72  |     await expect(page.locator('button:has-text("Sign In")')).toHaveCount(0);
      |                                                              ^ Error: expect(locator).toHaveCount(expected) failed
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
  86  |     await expect(page.locator('h3:has-text("Getting Started with Arduino Uno R3")')).toBeVisible();
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
import { expect, test } from '@playwright/test';

test('teacher can add, edit, publish, and delete every supported content type', async ({
  page,
  request,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-ios',
    'The development-only local session store is not shared reliably by WebKit; production uses Supabase authentication.',
  );
  test.setTimeout(120_000);
  const runId = `${testInfo.project.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const email = `teacher-${runId}@example.test`;
  const password = 'TeacherFlow123!';
  const label = `[QA ${runId}]`;

  const seedResponse = await request.post('/api/dev/seed-teacher', {
    headers: { 'x-e2e-seed-secret': 'rees52-playwright-teacher-seed' },
    data: { name: 'Teacher QA', email, password },
  });
  expect(seedResponse.ok()).toBeTruthy();

  await page.goto('/login?portal=teacher&redirect_to=/admin');
  await page.getByLabel('Email').fill(email);
  const passwordField = page.getByLabel('Password');
  await passwordField.fill(password);
  await passwordField.press('Tab');
  await page.getByRole('button', { name: 'SIGN IN' }).click();
  await page.waitForURL(/\/admin$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'REES52 Teacher Studio' })).toBeVisible({ timeout: 15_000 });

  const courseTitle = `${label} Robotics course`;
  await page.goto('/admin/courses');
  await page.getByLabel('Course title').fill(courseTitle);
  await page.getByLabel('Category').fill('QA Robotics');
  await page.getByLabel('Duration').fill('45 minutes');
  await page.getByLabel('Short description').fill('Authenticated QA course created by the teacher workflow.');
  await page.getByLabel('Full course content').fill('A controlled draft used to verify teacher course creation.');
  await page.getByRole('button', { name: 'Add course' }).click();
  await expect(page.getByRole('status')).toContainText('Course created.');
  await expect(page.getByRole('heading', { level: 3, name: courseTitle })).toBeVisible();

  const projectTitle = `${label} Sensor project`;
  await page.goto('/admin/projects');
  await page.getByLabel('Project title').fill(projectTitle);
  await page.getByLabel('Category').fill('QA Projects');
  await page.getByLabel('Estimated time').fill('30 minutes');
  await page.getByLabel('Short description').fill('Authenticated QA project created by the teacher workflow.');
  await page.getByLabel('Full description').fill('A controlled draft used to verify teacher project creation.');
  await page.getByLabel('Source code').fill('void setup() {}\\nvoid loop() {}');
  await page.getByLabel('Build steps (one per line)').fill('Connect the board\\nUpload the sketch');
  await page.getByLabel('Troubleshooting (one per line)').fill('Check the USB cable');
  await page.getByRole('button', { name: 'Add project' }).click();
  await expect(page.getByRole('status')).toContainText('Project created.');
  await expect(page.getByRole('heading', { level: 3, name: projectTitle })).toBeVisible();

  const ebookTitle = `${label} Robotics workbook`;
  await page.goto('/admin/ebooks');
  await page.getByLabel('Ebook title').fill(ebookTitle);
  await page.getByLabel('Ebook category').fill('QA Workbooks');
  await page.getByLabel('Number of pages').fill('8');
  await page.getByLabel('PDF file address').fill('/downloads/arduino-foundations-workbook.pdf');
  await page
    .getByLabel('Ebook description')
    .fill(
      'A controlled classroom workbook used to verify teacher draft, editing, publishing, public visibility, and deletion controls.',
    );
  await page.getByLabel('Cover image address').fill('/diagrams/arduino-led-wiring.png');
  await page.getByRole('button', { name: 'Add ebook' }).click();
  await expect(page.getByRole('status')).toContainText('Ebook draft created.');
  await expect(page.getByRole('heading', { level: 3, name: ebookTitle })).toBeVisible();

  const ebookCard = page.locator('article').filter({ hasText: ebookTitle });
  await ebookCard.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('checkbox', { name: /Publish for students and teachers/ }).check();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Ebook updated and published.');

  const quizTitle = `${label} Electronics quiz`;
  await page.goto('/admin/quizzes');
  await page.getByLabel('Topic name').fill(quizTitle);
  await page.getByLabel('Description').fill('Authenticated QA quiz-link publishing check.');
  await page.getByLabel('Quiz link').fill('https://example.com/rees52-qa-quiz');
  await page.getByRole('button', { name: 'Add quiz' }).click();
  await expect(page.getByRole('status')).toContainText('Quiz link published for students.');
  await expect(page.getByRole('heading', { level: 3, name: quizTitle })).toBeVisible();

  const articleTitle = `${label} Academy publishing check`;
  const articleSlug = `qa-academy-publishing-${runId}`;
  await page.goto('/admin/articles');
  await page.getByLabel('Article title').fill(articleTitle);
  await page.getByLabel('Category').fill('QA News');
  await page.getByLabel('Web address').fill(articleSlug);
  await page.getByLabel('Short summary').fill('Authenticated QA article created to verify public teacher publishing.');
  await page
    .getByLabel('Article body')
    .fill(
      'This controlled quality-assurance article verifies that an authenticated teacher can create, publish, and display Academy news for every visitor.\\n\\n## Verification\\n\\nThe public article route must show the same title, summary, author, and body without requiring a learner sign-in.',
    );
  await page.getByRole('checkbox', { name: /Publish for everyone/ }).check();
  await page.getByRole('button', { name: 'Save & publish' }).click();
  await expect(page.getByRole('status')).toContainText('Article published for everyone.');

  await page.goto(`/news/${articleSlug}`);
  await expect(page.getByRole('heading', { level: 1, name: articleTitle })).toBeVisible();

  await page.goto('/quizzes');
  await expect(page.getByRole('heading', { level: 2, name: quizTitle })).toBeVisible();

  await page.goto('/ebooks');
  await expect(page.getByRole('heading', { level: 3, name: ebookTitle })).toBeVisible();

  await page.goto('/admin/ebooks');
  page.once('dialog', (dialog) => void dialog.accept());
  await page.locator('article').filter({ hasText: ebookTitle }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('status')).toContainText('Ebook deleted.');

  await page.goto('/ebooks');
  await expect(page.getByRole('heading', { level: 3, name: ebookTitle })).toHaveCount(0);
});

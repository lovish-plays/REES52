# REES52 Academy production launch checklist

The app now has the production SEO and public-catalog foundation. Before launch, complete the provider-specific items below.

## Required environment variables

Set these in the hosting provider's production environment, not in the repository:

- `NEXT_PUBLIC_SITE_URL=https://rees52.tech`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or the publishable key)
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` and `OTP_SECRET` with independent random values of at least 32 characters
- `OPAQUE_ROUTE_KEY` with a random value of at least 32 characters
- SMTP variables for password-reset and transactional email
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` after Search Console verifies the domain
- `NEXT_PUBLIC_GA_ID` if analytics is enabled

## Supabase

1. Run `supabase/complete_frontend_setup.sql` on a new project, or apply migrations `001` through `007` in order on an existing project.
2. Confirm email/password and Google OAuth redirect URLs use the production domain:
   `https://rees52.tech/auth/callback`.
3. Confirm RLS is enabled and test student, teacher, and admin accounts separately.
4. Promote staff accounts through the protected profile workflow; never expose the service-role key to the browser.
5. Configure database backups, storage limits, and an alert for failed auth or database requests.

## Content and commerce

- Publish only courses with complete modules, lessons, preview lessons, quizzes, downloads, and FAQs.
- Paid courses intentionally remain locked until a payment gateway and webhook are connected. Do not mark a paid course as publish-ready before that integration is live.
- Verify every video, PDF, project component URL, and store link.
- Add real thumbnails with descriptive alt text and compress large source images.

## Google and monitoring

1. Deploy to the canonical HTTPS domain.
2. Submit `https://rees52.tech/sitemap.xml` in Google Search Console.
3. Inspect the home, course listing, and at least three course/project URLs as an anonymous visitor.
4. Confirm private dashboards are excluded by `robots.txt` and `noindex` metadata.
5. Add uptime monitoring and error tracking for the app, Supabase, auth callbacks, and email delivery.
6. Review Core Web Vitals on mobile after real production traffic begins.

Public catalog URLs stay readable for search engines. URL obfuscation is retained only for private app routes; it is not an authorization mechanism.

import Link from "next/link";
import { Logo } from "@/components/logo";

const LAST_UPDATED = "March 9, 2026";

export const metadata = {
  title: "Privacy Policy — NoteCrate",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fbfbfb] px-4 py-12">
      <div className="mx-auto max-w-[720px]">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} variant="light" />
            <span className="text-[15px] font-semibold tracking-tight text-neutral-900">NoteCrate</span>
          </Link>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-[24px] font-bold tracking-tight text-neutral-900">Privacy Policy</h1>
          <p className="mb-8 text-[13px] text-neutral-400">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-8 text-[13px] leading-relaxed text-neutral-700">

            {/* 1 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">1. Introduction</h2>
              <p>
                NoteCrate (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website at{" "}
                <a href="https://notecrate.me" className="text-neutral-900 underline underline-offset-2">
                  notecrate.me
                </a>{" "}
                and the associated browser extension. This Privacy Policy explains what information we collect, how we
                use it, and the choices you have. By using NoteCrate you agree to the practices described here.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">2. Information We Collect</h2>

              <h3 className="mb-2 font-medium text-neutral-900">Account data</h3>
              <ul className="mb-4 list-disc space-y-1 pl-5">
                <li>Email address (required to create an account)</li>
                <li>Password (stored as a bcrypt hash — never in plain text)</li>
                <li>Display name and profile picture (optional, provided by you or from Google OAuth)</li>
              </ul>

              <h3 className="mb-2 font-medium text-neutral-900">Content you save</h3>
              <ul className="mb-4 list-disc space-y-1 pl-5">
                <li>Highlighted text, images, and video clips captured via the browser extension</li>
                <li>The title and URL of the source page or YouTube video</li>
                <li>Folder names and the folder structure you create</li>
                <li>Chat messages sent to and received from the AI assistant</li>
              </ul>

              <h3 className="mb-2 font-medium text-neutral-900">Technical data</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Authentication session tokens (managed as HTTP-only cookies by Supabase)</li>
                <li>
                  Two lightweight preferences stored in your browser&apos;s local storage: your chosen theme
                  (<code className="rounded bg-neutral-100 px-1 text-[11px]">nc_theme</code>) and font size
                  (<code className="rounded bg-neutral-100 px-1 text-[11px]">nc_font_size</code>)
                </li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">3. How We Use Your Information</h2>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>To create and manage your account and authenticate you</li>
                <li>To store, display, search, and export your highlights and folders</li>
                <li>To send transactional emails such as account confirmation and password resets</li>
                <li>To respond to support requests you send us</li>
              </ul>
              <p className="mt-3">
                We do not sell your personal data. We do not use your content for advertising.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">4. Third-Party Services</h2>
              <p className="mb-4">
                We rely on the following trusted sub-processors. Each handles your data only as needed to provide their
                service to us.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-neutral-900">Supabase</p>
                  <p className="text-neutral-500">
                    Our database and authentication provider. All user data — accounts, highlights, folders, and chat
                    history — is stored on Supabase-managed PostgreSQL hosted on AWS in the US (us-east-2 region).
                    Supabase handles session cookie management and password hashing.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Google (OAuth)</p>
                  <p className="text-neutral-500">
                    If you choose &quot;Continue with Google&quot;, Google authenticates you and shares your name,
                    email, and profile picture with us. This is governed by{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      Google&apos;s Privacy Policy
                    </a>
                    .
                  </p>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Resend</p>
                  <p className="text-neutral-500">
                    Our transactional email provider. Your email address is shared with Resend solely to deliver
                    account confirmation and password reset messages.
                  </p>
                </div>
              </div>
            </section>

            {/* 5 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">5. Cookies &amp; Local Storage</h2>
              <p className="mb-3">We use a minimal number of browser storage mechanisms:</p>
              <div className="overflow-hidden rounded-lg border border-neutral-200">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-4 py-2.5 text-left font-medium text-neutral-700">Name</th>
                      <th className="px-4 py-2.5 text-left font-medium text-neutral-700">Type</th>
                      <th className="px-4 py-2.5 text-left font-medium text-neutral-700">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-neutral-600">sb-*</td>
                      <td className="px-4 py-2.5 text-neutral-500">HTTP-only cookie</td>
                      <td className="px-4 py-2.5 text-neutral-500">Keeps you signed in (Supabase session)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-neutral-600">nc_theme</td>
                      <td className="px-4 py-2.5 text-neutral-500">localStorage</td>
                      <td className="px-4 py-2.5 text-neutral-500">Remembers your colour scheme preference</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-neutral-600">nc_font_size</td>
                      <td className="px-4 py-2.5 text-neutral-500">localStorage</td>
                      <td className="px-4 py-2.5 text-neutral-500">Remembers your font size preference</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                We do not use advertising cookies, analytics cookies, or any third-party tracking scripts.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">6. Data Retention</h2>
              <p>
                Your data is retained for as long as your account is active. When you delete your account (available in
                Settings → Danger zone), all your highlights, folders, chat history, and profile data are permanently
                removed from our systems. We do not keep backups of deleted accounts beyond our standard database
                backup window.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">7. Your Rights</h2>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <span className="font-medium text-neutral-900">Access &amp; export</span> — You can export all your
                  highlights at any time from within the app (Markdown, JSON, or plain text).
                </li>
                <li>
                  <span className="font-medium text-neutral-900">Correction</span> — You can update your name and
                  email in Settings.
                </li>
                <li>
                  <span className="font-medium text-neutral-900">Deletion</span> — You can permanently delete your
                  account and all associated data from Settings → Danger zone.
                </li>
                <li>
                  <span className="font-medium text-neutral-900">Portability</span> — Exported data is provided in
                  standard, machine-readable formats (JSON, Markdown).
                </li>
              </ul>
              <p className="mt-3">
                To exercise any right not available through the app UI, email us at the address in Section 10.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">8. Security</h2>
              <p>
                Passwords are hashed using bcrypt and never stored in plain text. All data is transmitted over HTTPS.
                Database access requires a secret service-role key never exposed to the browser. Supabase provides
                encryption at rest for all stored data. We follow responsible disclosure practices and will notify
                users of any material breach as required by law.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">9. Children&apos;s Privacy</h2>
              <p>
                NoteCrate is not directed at children under 13. We do not knowingly collect personal information from
                anyone under 13. If you believe a child has provided us with their data, please contact us and we will
                delete it promptly.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">10. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. When we do, we&apos;ll update the &quot;Last
                updated&quot; date at the top. For significant changes we will notify signed-in users via email.
                Continued use of NoteCrate after changes take effect constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">11. Contact</h2>
              <p>
                If you have questions about this policy or your data, please email us at{" "}
                <a href="mailto:kmjbp.work@gmail.com" className="text-neutral-900 underline underline-offset-2">
                  kmjbp.work@gmail.com
                </a>
                .
              </p>
            </section>

          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-neutral-400">
          <Link href="/" className="hover:text-neutral-700">
            ← Back to NoteCrate
          </Link>
        </p>
      </div>
    </div>
  );
}

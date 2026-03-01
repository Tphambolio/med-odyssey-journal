import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to map
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-cyan-400" />
            Terms of Service
          </h1>
          <p className="text-slate-400 text-sm mt-1">Last updated: March 1, 2026</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Acceptance of Terms</h2>
          <p className="text-slate-300 leading-relaxed">
            By accessing and using Med Odyssey Journal ("the Site"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the Site.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Description of Service</h2>
          <p className="text-slate-300 leading-relaxed">
            Med Odyssey Journal is a personal travel journal documenting a Mediterranean sailing sabbatical. The Site provides an interactive map, journal entries, photographs, and community features including comments and reactions.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">User Accounts</h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            You may sign in using Google or Facebook authentication. By creating an account, you agree to:
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>Provide accurate information through your OAuth provider</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activity under your account</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-3">
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Acceptable Use</h2>
          <p className="text-slate-300 leading-relaxed mb-3">When using the Site, you agree not to:</p>
          <ul className="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>Post comments that are abusive, harassing, defamatory, or hateful</li>
            <li>Submit spam, advertisements, or unsolicited promotional content</li>
            <li>Impersonate other users or misrepresent your identity</li>
            <li>Attempt to gain unauthorized access to the Site or its systems</li>
            <li>Use automated tools to scrape or collect data from the Site</li>
          </ul>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">User-Generated Content</h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            By posting comments or reactions on the Site, you:
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>Retain ownership of your content</li>
            <li>Grant us a non-exclusive, royalty-free license to display your content on the Site</li>
            <li>Confirm that your content does not infringe on the rights of any third party</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-3">
            We reserve the right to remove any user-generated content that violates these terms or is otherwise objectionable, at our sole discretion.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Intellectual Property</h2>
          <p className="text-slate-300 leading-relaxed">
            All original content on the Site — including journal entries, photographs, maps, and design — is the property of the Site owner and is protected by copyright. You may not reproduce, distribute, or create derivative works from this content without express written permission.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Disclaimers</h2>
          <p className="text-slate-300 leading-relaxed">
            The Site is provided "as is" without warranties of any kind, either express or implied. We do not guarantee the accuracy, completeness, or timeliness of any content. Travel information, routes, and conditions described in journal entries reflect personal experiences and should not be relied upon for navigation or safety decisions.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Limitation of Liability</h2>
          <p className="text-slate-300 leading-relaxed">
            To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Site. Our total liability for any claim shall not exceed the amount you paid to us (if any) in the 12 months preceding the claim.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Changes to Terms</h2>
          <p className="text-slate-300 leading-relaxed">
            We may update these terms from time to time. Continued use of the Site after changes constitutes acceptance of the updated terms. We will indicate the date of the most recent update at the top of this page.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
          <p className="text-slate-300 leading-relaxed">
            For questions about these terms, please contact us at <a href="mailto:travis@medodysseyjournal.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">travis@medodysseyjournal.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export function PrivacyPolicy() {
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
            <Shield className="w-6 h-6 text-cyan-400" />
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-sm mt-1">Last updated: March 1, 2026</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Overview</h2>
          <p className="text-slate-300 leading-relaxed">
            Med Odyssey Journal ("we", "our", "us") is a personal travel journal documenting a Mediterranean sailing sabbatical. This policy explains how we collect, use, and protect your information when you visit our site or interact with our features.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Information We Collect</h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            When you sign in using Google or Facebook, we receive the following information from your OAuth provider:
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your profile picture (avatar URL)</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-3">
            We do not request access to your contacts, posts, or any other social media data beyond basic profile information.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">How We Use Your Information</h2>
          <ul className="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>To identify you when you leave comments or reactions on journal entries</li>
            <li>To display your name and avatar alongside your comments</li>
            <li>To manage your account and session</li>
          </ul>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Data Storage</h2>
          <p className="text-slate-300 leading-relaxed">
            Your data is stored securely using <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">Supabase</a>, a cloud-hosted PostgreSQL database with built-in authentication. Data is stored on servers managed by Supabase and protected by their security practices, including encryption at rest and in transit.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Cookies & Local Storage</h2>
          <p className="text-slate-300 leading-relaxed">
            We use cookies and browser local storage solely to maintain your authentication session. We do not use tracking cookies, advertising cookies, or any third-party analytics services.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Third-Party Authentication</h2>
          <p className="text-slate-300 leading-relaxed">
            We offer sign-in through Google and Facebook. When you authenticate with these providers, their respective privacy policies also apply. We encourage you to review:
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-1 ml-2 mt-2">
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">Google Privacy Policy</a></li>
            <li><a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">Facebook Privacy Policy</a></li>
          </ul>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Your Rights</h2>
          <p className="text-slate-300 leading-relaxed mb-3">You have the right to:</p>
          <ul className="list-disc list-inside text-slate-300 space-y-1 ml-2">
            <li>Request a copy of the personal data we hold about you</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for data processing at any time by signing out and contacting us</li>
          </ul>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Data Retention</h2>
          <p className="text-slate-300 leading-relaxed">
            We retain your account information and any comments you post for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days.
          </p>
        </section>

        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
          <p className="text-slate-300 leading-relaxed">
            For privacy-related questions or data requests, please reach out via the contact information on our site or email us at <a href="mailto:travis@medodysseyjournal.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">travis@medodysseyjournal.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
}

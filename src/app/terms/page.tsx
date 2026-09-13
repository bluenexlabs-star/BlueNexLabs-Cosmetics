import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms and Conditions",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
        Legal
      </p>
      <h1 className="display mt-2 text-4xl text-navy-900 sm:text-5xl">
        BlueNexLabs Terms and Conditions
      </h1>
      <div className="mt-4 h-px w-14 bg-brand-blue" aria-hidden="true" />

      <div className="prose-article mt-6">
        <p>
          Welcome to{" "}
          <Link href="/">
            <strong>BlueNexLabs.com</strong>
          </Link>{" "}
          (the “Site”). These Terms &amp; Conditions (“Terms”) govern your
          access to and use of the Site and any purchase of products from{" "}
          <strong>BlueNexLabs</strong> (“BlueNexLabs,” “we,” “us,” or “our”).
          By accessing the Site, placing an order, or using our services, you
          agree to be bound by these Terms.
        </p>
        <p>
          If you do not agree with these Terms, do not use the Site or purchase
          our products.
        </p>

        <h2>1) Eligibility &amp; Responsible Use</h2>
        <p>By using this Site and purchasing from BlueNexLabs, you confirm that:</p>
        <ul>
          <li>You are the age of majority in your jurisdiction.</li>
          <li>
            You will use any products purchased solely for lawful purposes and
            in accordance with these Terms.
          </li>
          <li>
            You have the authority to enter into these Terms on behalf of
            yourself or your organization.
          </li>
        </ul>

        <h2>2) Cosmetic Products (Not Medicines)</h2>
        <p>
          All products sold by BlueNexLabs are intended as cosmetics and face
          additives for topical use, unless explicitly stated otherwise on the
          product label or listing.
        </p>
        <p>You acknowledge and agree that:</p>
        <ul>
          <li>
            Our products are cosmetics and face additives for personal use, not
            medicines, and are not intended for ingestion.
          </li>
          <li>
            Our products are not intended to diagnose, treat, cure, mitigate,
            or prevent any disease or condition.
          </li>
          <li>
            You are solely responsible for following the product label and for
            ensuring that your use complies with all applicable laws and
            regulations.
          </li>
        </ul>
        <p>
          BlueNexLabs does not provide medical advice. Any information on the
          Site is for general informational purposes only.
        </p>

        <h2>3) No Professional Advice</h2>
        <p>
          Information provided on the Site (including product descriptions,
          journal posts, FAQs, quality documents, or other content) is not
          intended as scientific, medical, legal, or regulatory advice. You
          should consult a qualified professional where appropriate.
        </p>

        <h2>4) Orders, Acceptance &amp; Cancellations</h2>
        <h3>4.1 Order Acceptance</h3>
        <p>
          All orders are subject to acceptance by BlueNexLabs. We may refuse,
          cancel, or limit an order at our discretion, including where:
        </p>
        <ul>
          <li>We suspect fraud or unauthorized activity,</li>
          <li>A pricing or listing error has occurred,</li>
          <li>We are unable to verify payment,</li>
          <li>Shipping restrictions or regulatory limitations apply.</li>
        </ul>
        <h3>4.2 Order Cancellations</h3>
        <p>
          If you need to cancel, contact us as soon as possible at{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Cancellation
          requests are not guaranteed and depend on order status (e.g., whether
          it has been processed or shipped).
        </p>

        <h2>5) Pricing, Currency, Taxes &amp; Errors</h2>
        <p>Prices are shown in CAD unless otherwise stated.</p>
        <p>
          Taxes, duties, brokerage fees, and import charges (if applicable) are
          the responsibility of the customer unless explicitly stated otherwise
          at checkout.
        </p>
        <p>
          We strive for accuracy, but errors may occur. If we discover an error
          in pricing, description, or availability, we may cancel the order and
          issue a refund.
        </p>

        <h2>6) Payment &amp; Chargebacks</h2>
        <p>
          We may use third-party payment processors. By submitting payment
          details, you represent you are authorized to use the payment method.
        </p>
        <p>
          <strong>Chargebacks / disputes:</strong> If you have an issue with an
          order, contact us first so we can help resolve it. Unwarranted
          chargebacks may result in account restrictions and future order
          refusal.
        </p>

        <h2>7) Shipping, Delivery &amp; Risk of Loss</h2>
        <h3>7.1 Shipping</h3>
        <p>
          Shipping options, timeframes, and costs are presented at checkout.
          Delivery estimates are not guarantees.
        </p>
        <h3>7.2 Risk of Loss</h3>
        <p>
          Risk of loss transfers to you upon delivery to the carrier (unless
          otherwise required by applicable law). Once shipped, we are not
          responsible for delays due to carriers, customs, weather, or other
          events outside our control.
        </p>
        <h3>7.3 Address Accuracy</h3>
        <p>
          You are responsible for providing accurate shipping information. If a
          shipment is returned due to incorrect address information, additional
          shipping fees may apply.
        </p>

        <h2>8) Returns, Refunds &amp; Exchanges</h2>
        <p>
          Because many cosmetic products are opened or hygiene-sensitive,
          returns may be restricted.
        </p>
        <p>Unless otherwise required by law:</p>
        <ul>
          <li>No returns on opened, used, or temperature-sensitive items.</li>
          <li>
            If an item arrives damaged, incorrect, or materially defective,
            notify us within 48 hours of delivery with photos and order details
            at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </li>
          <li>
            Approved refunds or reshipments may be issued at our discretion
            after review.
          </li>
        </ul>

        <h2>9) Product Handling, Storage &amp; Customer Responsibility</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>
            Proper handling, storage, and use of products consistent with the
            product label and any instructions provided.
          </li>
          <li>
            Checking ingredients for personal sensitivities before use.
          </li>
          <li>Keeping products away from children as directed on the label.</li>
        </ul>
        <p>
          BlueNexLabs is not responsible for product degradation or outcomes
          resulting from improper handling, storage, or use after delivery.
        </p>

        <h2>10) Quality, Documentation &amp; Disclaimers</h2>
        <p>
          We may provide batch-related or ingredient documentation where
          available. Such documentation is provided for informational purposes
          and does not constitute a warranty of fitness for a particular
          purpose.
        </p>
        <p>
          <strong>Disclaimer:</strong> Products and services are provided “AS
          IS” and “AS AVAILABLE” except as required under applicable law.
        </p>

        <h2>11) Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, BlueNexLabs (including its
          directors, officers, employees, and affiliates) will not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages, including loss of profits, revenue, data, or business
          interruption, arising from or related to:
        </p>
        <ul>
          <li>Use of the Site,</li>
          <li>Purchase or use (or misuse) of products,</li>
          <li>Shipping delays or carrier issues,</li>
          <li>Reliance on Site content.</li>
        </ul>
        <p>
          To the extent permitted by law, our total liability for any claim
          will not exceed the amount you paid for the product(s) giving rise to
          the claim.
        </p>
        <p>
          (Some jurisdictions do not allow certain limitations—these may not
          apply to you.)
        </p>

        <h2>12) Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless BlueNexLabs from and against
          any claims, liabilities, damages, losses, and expenses (including
          reasonable legal fees) arising out of or related to:
        </p>
        <ul>
          <li>Your misuse of products,</li>
          <li>Your violation of these Terms,</li>
          <li>Your violation of applicable laws or third-party rights.</li>
        </ul>

        <h2>13) Intellectual Property</h2>
        <p>
          All Site content (text, images, logos, design, product names,
          graphics, and software) is owned by or licensed to BlueNexLabs and
          protected by intellectual property laws. You may not copy, reproduce,
          distribute, modify, or exploit Site content without our prior written
          permission.
        </p>

        <h2>14) User Accounts (If Applicable)</h2>
        <p>
          If you create an account, you are responsible for maintaining
          confidentiality of login credentials and for all activities under
          your account. We may suspend or terminate accounts for suspected
          misuse, fraud, or violations of these Terms.
        </p>

        <h2>15) Prohibited Uses</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Site for unlawful purposes,</li>
          <li>Attempt to bypass security features,</li>
          <li>Interfere with Site operations,</li>
          <li>Submit false information,</li>
          <li>
            Use products in any way inconsistent with their intended cosmetic
            use, the product label, or applicable law.
          </li>
        </ul>

        <h2>16) Privacy</h2>
        <p>
          Your use of the Site is also governed by our{" "}
          <strong>Privacy Policy</strong>. Please review it to understand how
          we collect, use, and protect personal information.
        </p>

        <h2>17) Third-Party Links</h2>
        <p>
          The Site may contain links to third-party websites. We are not
          responsible for third-party content, policies, or practices. Access
          third-party sites at your own risk.
        </p>

        <h2>18) Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Changes take effect when
          posted on this page. Your continued use of the Site after changes are
          posted constitutes acceptance of the updated Terms.
        </p>

        <h2>19) Governing Law &amp; Dispute Resolution</h2>
        <p>
          These Terms are governed by the laws of the Province of British
          Columbia and the federal laws of Canada applicable therein, without
          regard to conflict of law principles.
        </p>
        <p>
          Any dispute arising from these Terms or your use of the Site will be
          brought in the courts located in British Columbia, Canada, unless
          applicable consumer protection laws require otherwise.
        </p>

        <h2>20) Severability</h2>
        <p>
          If any part of these Terms is found unlawful, void, or unenforceable,
          the remaining provisions will remain in full force and effect.
        </p>

        <h2>21) Contact Us</h2>
        <p>
          For questions about these Terms, your order, or our policies:
        </p>
        <p>
          <strong>{SITE.legal}</strong>
          <br />
          Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
      </div>
    </div>
  );
}

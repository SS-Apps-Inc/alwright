import React from "react";
import Head from "expo-router/head";
import { Text } from "react-native";

import {
  ContactCard,
  LegalBullet,
  LegalPolicyPage,
  LegalSection,
  legalStyles,
} from "@/features/legal/legal_policy_page";

export default function TermsScreen() {
  return (
    <>
      <Head>
        <title>Terms of Use | Alwright</title>
        <meta
          name="description"
          content="Terms governing access to and use of Alwright in Canada."
        />
      </Head>

      <LegalPolicyPage
        kicker="LEGAL"
        eyebrow="TERMS OF USE"
        title="Clear terms for a public space."
        intro="These Terms govern your access to and use of Alwright. Please read them before creating an account, publishing a post, or purchasing a subscription."
        scope="Alwright is a product of SS Apps Inc. and is currently offered only in Canada. By using the service, you agree to these Terms and our Privacy Policy."
        effectiveDate="Effective August 5, 2026 · Last updated August 5, 2026"
        footerPrompt="Questions about these Terms?"
        emailSubject="Alwright Terms Question"
      >
        <LegalSection number="01" title="Eligibility and acceptance">
          <Text style={legalStyles.body}>
            You must be at least 13 years old to create an Alwright account. If
            you have not reached the age of majority where you live, you may use
            Alwright only with the permission and supervision of a parent or
            legal guardian who accepts these Terms. Do not use the service if
            you cannot legally agree to them.
          </Text>
        </LegalSection>

        <LegalSection number="02" title="The Alwright service">
          <Text style={legalStyles.body}>
            Alwright lets users create and manage posts through the mobile app
            and view or share public posts and profile pages on the web.
            Features, layouts, posting limits, and availability may depend on
            your plan, device, platform, or region.
          </Text>
        </LegalSection>

        <LegalSection number="03" title="Accounts and security">
          <LegalBullet>
            Provide an accurate Canadian phone number and complete the
            verification process.
          </LegalBullet>
          <LegalBullet>
            Keep control of your device, verification codes, and account
            session. Do not sell, share, or transfer your account.
          </LegalBullet>
          <LegalBullet>
            You are responsible for activity carried out through your account
            unless you promptly report unauthorized access.
          </LegalBullet>
          <LegalBullet>
            Contact us immediately if you believe your account or phone number
            has been compromised.
          </LegalBullet>
        </LegalSection>

        <LegalSection number="04" title="Your posts are public">
          <Text style={legalStyles.body}>
            Content published through Alwright is public by design. It may be
            viewed, copied, indexed, linked to, or shared by others. Do not post
            personal, confidential, or sensitive information. You are solely
            responsible for deciding what to publish and for ensuring that you
            have all rights and permissions needed to do so.
          </Text>
        </LegalSection>

        <LegalSection number="05" title="Your content and our licence">
          <Text style={legalStyles.body}>
            You retain ownership of content you create. By publishing content,
            you grant SS Apps Inc. a non-exclusive, worldwide, royalty-free
            licence to host, store, reproduce, format, display, distribute, and
            make that content available only as reasonably necessary to
            operate, secure, promote, and improve Alwright. This licence ends
            when the content is deleted from our active systems, except where a
            copy must be retained for legal, safety, backup, or enforcement
            purposes.
          </Text>
        </LegalSection>

        <LegalSection number="06" title="Prohibited conduct">
          <Text style={legalStyles.body}>You must not use Alwright to:</Text>
          <LegalBullet>
            Publish unlawful, fraudulent, threatening, hateful, harassing,
            defamatory, violent, or deliberately harmful content.
          </LegalBullet>
          <LegalBullet>
            Sexually exploit or endanger a child, share or request child sexual
            abuse material, groom, lure, sextort, or facilitate abuse.
          </LegalBullet>
          <LegalBullet>
            Impersonate another person, invade privacy, expose private
            information, or infringe copyright, trademark, or other rights.
          </LegalBullet>
          <LegalBullet>
            Distribute malware, interfere with security, scrape the service,
            evade limits, automate abusive activity, or attempt unauthorized
            access.
          </LegalBullet>
          <LegalBullet>
            Use Alwright in a manner that places users, SS Apps Inc., or the
            public at risk.
          </LegalBullet>
        </LegalSection>

        <LegalSection number="07" title="Moderation and reporting">
          <Text style={legalStyles.body}>
            We may review reports and investigate suspected violations. We may
            remove or restrict content, preserve relevant information, limit
            features, suspend or terminate accounts, and report apparent
            offences or urgent safety concerns to appropriate authorities. Our
            Child Safety Standards provide additional rules and reporting
            information for child-safety concerns.
          </Text>
        </LegalSection>

        <LegalSection number="08" title="Plans, subscriptions, and billing">
          <LegalBullet>
            Current plan features, posting limits, prices, billing periods, and
            any trial terms are shown in the app or applicable app store before
            purchase.
          </LegalBullet>
          <LegalBullet>
            Paid subscriptions renew automatically unless cancelled through
            the store account used to purchase them before the renewal date.
          </LegalBullet>
          <LegalBullet>
            Apple or Google processes payment and manages billing. Refunds,
            cancellations, and payment disputes are subject to the applicable
            store rules and any rights you have under Canadian law.
          </LegalBullet>
          <LegalBullet>
            Prices and plan features may change prospectively. We will provide
            notice where required, and changes will not remove non-waivable
            consumer rights.
          </LegalBullet>
        </LegalSection>

        <LegalSection number="09" title="Deletion and account closure">
          <Text style={legalStyles.body}>
            You may permanently delete individual posts. Deleted posts cannot
            be recovered through Alwright and still count toward applicable
            posting limits. You may request account deletion in Settings; the
            account is signed out and scheduled for permanent deletion after 30
            days. Some records may be retained where reasonably necessary for
            security, fraud prevention, legal compliance, dispute resolution,
            or enforcement.
          </Text>
        </LegalSection>

        <LegalSection number="10" title="Service availability and changes">
          <Text style={legalStyles.body}>
            We work to keep Alwright available, but the service may be
            interrupted, delayed, changed, or discontinued. We may add, remove,
            or modify features and reasonable usage limits. We do not guarantee
            that content will always remain available or that the service will
            be error-free.
          </Text>
        </LegalSection>

        <LegalSection number="11" title="Disclaimers and responsibility">
          <Text style={legalStyles.body}>
            To the maximum extent permitted by applicable law, Alwright is
            provided on an “as is” and “as available” basis without warranties
            not expressly stated in these Terms. User content reflects the
            views of its authors, not SS Apps Inc. Nothing in these Terms limits
            rights or remedies that cannot legally be excluded, including
            applicable provincial or territorial consumer protections.
          </Text>
        </LegalSection>

        <LegalSection number="12" title="Limitation of liability">
          <Text style={legalStyles.body}>
            To the maximum extent permitted by applicable law, SS Apps Inc. is
            not liable for indirect, incidental, special, consequential, or
            punitive damages, loss of data, loss of profits, or harm resulting
            from content posted by users. Any liability that cannot be excluded
            will be limited only to the extent permitted by law.
          </Text>
        </LegalSection>

        <LegalSection number="13" title="Suspension and termination">
          <Text style={legalStyles.body}>
            You may stop using Alwright at any time. We may suspend or terminate
            access when we reasonably believe these Terms have been violated,
            when necessary to protect users or the service, when required by
            law, or when the service is discontinued. Provisions that by their
            nature should survive termination will continue to apply.
          </Text>
        </LegalSection>

        <LegalSection number="14" title="Changes to these Terms">
          <Text style={legalStyles.body}>
            We may update these Terms to reflect service, legal, or operational
            changes. The current version and effective date will be published
            here. If a change is material, we will provide additional notice
            where reasonably practicable or legally required. Continued use
            after the updated Terms take effect means you accept them.
          </Text>
        </LegalSection>

        <LegalSection number="15" title="Canadian law">
          <Text style={legalStyles.body}>
            These Terms are governed by the applicable laws of Canada and the
            province or territory whose law properly applies, without limiting
            any mandatory consumer rights available to you. Courts and dispute
            processes will be determined under applicable Canadian law.
          </Text>
        </LegalSection>

        <LegalSection number="16" title="Contact us">
          <Text style={legalStyles.body}>
            Contact Alwright support with questions about these Terms, the
            service, billing, or your account.
          </Text>
          <ContactCard
            label="ALWRIGHT SUPPORT"
            subject="Alwright Terms Question"
          />
        </LegalSection>
      </LegalPolicyPage>
    </>
  );
}

import React from "react";
import Head from "expo-router/head";
import { Text } from "react-native";

import {
  ContactCard,
  LegalBullet,
  LegalPolicyPage,
  LegalSection,
  PolicyLink,
  legalStyles,
} from "@/features/legal/legal_policy_page";

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Alwright</title>
        <meta
          name="description"
          content="How Alwright and SS Apps Inc. collect, use, disclose, and protect personal information in Canada."
        />
      </Head>

      <LegalPolicyPage
        kicker="PRIVACY"
        eyebrow="PRIVACY POLICY"
        title="Your information deserves clarity."
        intro="This policy explains what Alwright collects, why we use it, when it may be shared, and the choices available to you."
        scope="Alwright is a product of SS Apps Inc. and is currently offered only in Canada. Public pages may be viewed from other countries."
        effectiveDate="Effective August 5, 2026 · Last updated August 5, 2026"
        footerPrompt="Privacy questions or requests?"
        emailSubject="Alwright Privacy Request"
      >
        <LegalSection number="01" title="Information we collect">
          <Text style={legalStyles.body}>
            We collect only the information reasonably needed to operate,
            secure, and improve Alwright.
          </Text>
          <LegalBullet>
            <Text style={legalStyles.emphasized}>Account information:</Text>{" "}
            your Canadian phone number, account and user identifiers,
            authentication records, and session information.
          </LegalBullet>
          <LegalBullet>
            <Text style={legalStyles.emphasized}>Content and settings:</Text>{" "}
            posts, author labels, creation times, search metadata, visual
            styling, profile choices, public-page settings, and related
            moderation records.
          </LegalBullet>
          <LegalBullet>
            <Text style={legalStyles.emphasized}>
              Subscription information:
            </Text>{" "}
            plan and entitlement status supplied by RevenueCat, Apple, or
            Google. Alwright does not directly receive your complete payment
            card details.
          </LegalBullet>
          <LegalBullet>
            <Text style={legalStyles.emphasized}>
              Requests and technical data:
            </Text>{" "}
            support messages, an email address you provide for a data export,
            and basic device, browser, IP-address, diagnostic, and security
            information processed when the service is used.
          </LegalBullet>
        </LegalSection>

        <LegalSection number="02" title="How we use information">
          <LegalBullet>
            Authenticate accounts and maintain secure access.
          </LegalBullet>
          <LegalBullet>
            Create, display, organize, style, share, and delete posts and public
            pages.
          </LegalBullet>
          <LegalBullet>
            Apply plan limits, confirm subscription entitlements, and provide
            paid features.
          </LegalBullet>
          <LegalBullet>
            Respond to support, privacy, safety, data-export, and
            account-deletion requests.
          </LegalBullet>
          <LegalBullet>
            Prevent abuse, investigate violations, protect users, maintain the
            service, and comply with applicable legal obligations.
          </LegalBullet>
        </LegalSection>

        <LegalSection number="03" title="Public content">
          <Text style={legalStyles.body}>
            Posts and public profile pages are intentionally public and may be
            viewed, copied, or shared by anyone with access to the web. Do not
            include phone numbers, addresses, private identifiers, confidential
            information, or anything you do not want made public. Deleting
            content from Alwright cannot remove copies already saved or shared
            by other people.
          </Text>
        </LegalSection>

        <LegalSection number="04" title="Service providers and disclosure">
          <Text style={legalStyles.body}>
            We use service providers to operate Alwright, including Supabase for
            authentication and data services, RevenueCat for subscription
            entitlements, app stores for purchases, and hosting or
            infrastructure providers for delivery and security. These providers
            process information for their respective services and under their
            own applicable terms and privacy practices.
          </Text>
          <Text style={legalStyles.body}>
            We may disclose information when reasonably necessary to comply with
            law, respond to valid legal process, protect a child or another
            person from harm, investigate fraud or abuse, enforce our Terms, or
            protect the rights and security of users, Alwright, and SS Apps Inc.
            We do not disclose personal information for unrelated purposes
            without consent unless permitted or required by law.
          </Text>
        </LegalSection>

        <LegalSection number="05" title="Consent and your choices">
          <Text style={legalStyles.body}>
            By creating an account and using Alwright, you acknowledge the
            practices described in this policy. Where consent is required, we
            seek consent appropriate to the sensitivity of the information and
            the purpose for which it is used. You may withdraw consent, subject
            to legal or contractual restrictions, but doing so may require
            closing your account or may prevent us from providing parts of the
            service.
          </Text>
        </LegalSection>

        <LegalSection number="06" title="Access, export, and deletion">
          <LegalBullet>
            You may request an export of your account data from Settings.
          </LegalBullet>
          <LegalBullet>
            You may delete individual posts. Post deletion is permanent within
            Alwright and does not restore consumed posting limits.
          </LegalBullet>
          <LegalBullet>
            You may request account deletion from Settings. The account is
            signed out and scheduled for permanent deletion after 30 days.
          </LegalBullet>
          <LegalBullet>
            You may contact us to request access to or correction of personal
            information, or to raise a privacy complaint. We may need to verify
            your identity before completing a request.
          </LegalBullet>
        </LegalSection>

        <LegalSection number="07" title="Retention and safeguards">
          <Text style={legalStyles.body}>
            We retain information only as long as reasonably necessary for the
            purposes described here, including providing the service, resolving
            disputes, preventing abuse, meeting legal obligations, and
            maintaining legitimate security records. Residual copies may remain
            temporarily in protected backups, and information may be retained
            longer where required or permitted by law.
          </Text>
          <Text style={legalStyles.body}>
            We use administrative, technical, and organizational safeguards
            appropriate to the sensitivity of the information. No electronic
            system is completely secure, so we cannot guarantee absolute
            security.
          </Text>
        </LegalSection>

        <LegalSection number="08" title="Children and young people">
          <Text style={legalStyles.body}>
            Alwright is not intended for children under 13. Anyone under 13
            must not create an account. Young people who are able to use the
            service should review this policy with a parent or guardian where
            appropriate. We respond to child-safety concerns under our published
            <Text> </Text>
            <PolicyLink href="/childsafety">
              Child Safety Standards
            </PolicyLink>
            .
          </Text>
        </LegalSection>

        <LegalSection number="09" title="Policy updates">
          <Text style={legalStyles.body}>
            We may update this policy as Alwright, our providers, or legal
            requirements change. The current version and its effective date
            will remain available on this page. If a change materially affects
            how we use personal information, we will provide additional notice
            or seek consent where required.
          </Text>
        </LegalSection>

        <LegalSection number="10" title="Contact us">
          <Text style={legalStyles.body}>
            Contact the Alwright privacy team to ask a question, request access
            or correction, or make a privacy complaint.
          </Text>
          <ContactCard
            label="PRIVACY CONTACT"
            subject="Alwright Privacy Request"
          />
        </LegalSection>
      </LegalPolicyPage>
    </>
  );
}

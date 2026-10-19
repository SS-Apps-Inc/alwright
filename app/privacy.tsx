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
          content="How Alwright and SS Apps Inc. collect, use, disclose, and protect personal information."
        />
      </Head>

      <LegalPolicyPage
        kicker="PRIVACY"
        eyebrow="PRIVACY POLICY"
        title="Your information deserves clarity."
        intro="This policy explains what Alwright collects, why we use it, when it may be shared, and the choices available to you."
        scope="Alwright is a product of SS Apps Inc., a Canadian company. The service and its public pages may be accessed internationally, although some features may vary by country or platform."
        effectiveDate="Effective August 5, 2026 · Last updated October 16, 2026"
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
            your phone number, the country and calling code selected during
            sign-in, a country flag, account and user identifiers,
            authentication records, and session information. Country
            information comes from your selection and phone number, not GPS or
            precise device location.
          </LegalBullet>
          <LegalBullet>
            <Text style={legalStyles.emphasized}>Content and settings:</Text>{" "}
            posts, author labels, creation times, search metadata, visual
            styling, profile image choice, public-page settings, feed country
            preferences, discoverability choices, and related moderation
            records.
          </LegalBullet>
          <LegalBullet>
            <Text style={legalStyles.emphasized}>Referral information:</Text>{" "}
            a referrer phone number you choose to submit, its normalized form,
            related account identifiers when a match is found, and referral
            status used to validate and administer the program.
          </LegalBullet>
          <LegalBullet>
            <Text style={legalStyles.emphasized}>Waitlist information:</Text>{" "}
            your name and an email address, phone number, or both that you
            voluntarily provide on our website to receive notice when the iOS
            app becomes available.
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
            support messages, an email address and generated account snapshot
            associated with a data-export request, and basic device, browser,
            IP-address, diagnostic, and security information processed when
            the service is used.
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
            Apply your latest or random feed choice, saved country filters,
            public profile-link preference, profile image preference, and
            country discoverability setting.
          </LegalBullet>
          <LegalBullet>
            Validate referrals, administer any eligible referral rewards, and
            send an iOS availability notice to people who join the waitlist.
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
            viewed, copied, indexed, or shared by anyone. Depending on your
            settings, a post may include a link to your public page and your
            selected profile image. Do not include phone numbers, addresses,
            private identifiers, confidential information, or anything you do
            not want made public. Deleting content from Alwright cannot remove
            copies already saved or shared by other people.
          </Text>
        </LegalSection>

        <LegalSection number="04" title="Country feeds and discoverability">
          <Text style={legalStyles.body}>
            The Everywhere feed displays eligible public posts. Signed-in users
            may instead save up to five countries and view posts whose authors
            allow country discovery and whose saved phone-country code matches
            a selected country. The country-specific feed is a discovery
            filter, not a statement about a post&apos;s origin, citizenship, or
            current physical location.
          </Text>
          <Text style={legalStyles.body}>
            Country discovery and links from posts to a public profile are
            enabled by default for new or returning accounts when profile
            defaults are created. You can turn either setting off in
            Personalize Page. You can also change or clear saved feed countries
            at any time. Feed results may be ordered by latest or randomized
            according to your selection; Alwright does not use likes to rank
            this feed.
          </Text>
        </LegalSection>

        <LegalSection number="05" title="Service providers and disclosure">
          <Text style={legalStyles.body}>
            We use service providers to operate Alwright, including Supabase for
            authentication and data services, our configured SMS provider for
            one-time verification codes, RevenueCat for subscription
            entitlements, Apple or Google for app distribution and purchases,
            and hosting or infrastructure providers for delivery and security.
            These providers process information for their respective services
            under applicable agreements and their own privacy practices.
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

        <LegalSection number="06" title="International processing">
          <Text style={legalStyles.body}>
            Alwright is operated from Canada and uses providers that may process
            or store information in Canada, the United States, or other
            countries. Information processed outside your country may be
            subject to the laws and lawful-access requirements of that
            jurisdiction. We use contractual, technical, and organizational
            measures appropriate to the information and service involved.
          </Text>
        </LegalSection>

        <LegalSection number="07" title="Consent and your choices">
          <Text style={legalStyles.body}>
            By creating an account and using Alwright, you acknowledge the
            practices described in this policy. Where consent is required, we
            seek consent appropriate to the sensitivity of the information and
            the purpose for which it is used. You may withdraw consent, subject
            to legal or contractual restrictions, but doing so may require
            closing your account or may prevent us from providing parts of the
            service.
          </Text>
          <Text style={legalStyles.body}>
            You can manage country discovery, links from posts to your profile,
            your profile image, and feed countries in the app. You may leave the
            iOS waitlist or withdraw permission for waitlist messages by
            contacting us.
          </Text>
        </LegalSection>

        <LegalSection number="08" title="Access, export, and deletion">
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

        <LegalSection number="09" title="Retention and safeguards">
          <Text style={legalStyles.body}>
            We retain information only as long as reasonably necessary for the
            purposes described here, including providing the service, resolving
            disputes, preventing abuse, meeting legal obligations, and
            maintaining legitimate security records. Residual copies may remain
            temporarily in protected backups, and information may be retained
            longer where required or permitted by law.
          </Text>
          <Text style={legalStyles.body}>
            Waitlist information is retained until the availability notice has
            been sent, you ask us to remove it, or it is no longer needed.
            Referral and transaction-related records may be retained as needed
            to verify eligibility, prevent abuse, resolve disputes, and meet
            legal or accounting obligations.
          </Text>
          <Text style={legalStyles.body}>
            We use administrative, technical, and organizational safeguards
            appropriate to the sensitivity of the information. No electronic
            system is completely secure, so we cannot guarantee absolute
            security.
          </Text>
        </LegalSection>

        <LegalSection number="10" title="Children and young people">
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

        <LegalSection number="11" title="Policy updates">
          <Text style={legalStyles.body}>
            We may update this policy as Alwright, our providers, or legal
            requirements change. The current version and its effective date
            will remain available on this page. If a change materially affects
            how we use personal information, we will provide additional notice
            or seek consent where required.
          </Text>
        </LegalSection>

        <LegalSection number="12" title="Contact us">
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

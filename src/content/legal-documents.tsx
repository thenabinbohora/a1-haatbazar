import { BUSINESS_CONFIG } from "@/config/business";
import type { LegalDocumentKey } from "@/config/legal";
import {
  ExternalLegalLink,
  LegalNote,
  LegalSubsection,
  LegalTable,
  PolicyLink,
  StoreLink,
  type LegalSection,
} from "@/components/legal/legal-page";

type LegalDocumentContent = {
  related: readonly LegalDocumentKey[];
  sections: readonly LegalSection[];
};

const privacySections: readonly LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    content: (
      <>
        <p>
          {BUSINESS_CONFIG.tradingName} is a local grocery store at{" "}
          {BUSINESS_CONFIG.address.formatted}. In this policy, “we”, “us” and “our” mean{" "}
          {BUSINESS_CONFIG.tradingName}. Our registered entity name and ABN have not yet been
          verified for publication, so this draft does not make a claim about our corporate
          structure.
        </p>
        <p>
          We handle personal information in accordance with applicable Australian privacy laws
          and the practices described in this policy. This wording does not claim that coverage
          by the Privacy Act 1988 (Cth) or the Australian Privacy Principles has been legally
          confirmed.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <LegalSubsection id="account-and-contact-information" title="Account and contact information">
          <p>
            When you create an account, sign in, reset a password or check out, we may collect
            your name, email address and telephone number. Passwords are handled in protected
            form: the storefront stores a password hash rather than a readable password, and
            Supabase Auth is also used for account creation and password recovery.
          </p>
        </LegalSubsection>
        <LegalSubsection id="order-and-fulfilment-information" title="Orders and fulfilment">
          <p>
            We collect delivery addresses, delivery or pickup selections, notes you enter,
            purchased items, quantities, prices, coupon use, order history, fulfilment status,
            transaction status and whether payment is due at delivery or pickup. You can check
            out without signing in, but the order is still associated with the email address you
            provide so we can administer it.
          </p>
          <p>
            The current site does not take online card payments and does not store full card
            numbers. It records an unpaid order for payment on delivery or at pickup.
          </p>
        </LegalSubsection>
        <LegalSubsection id="shopping-and-technical-information" title="Shopping and technical information">
          <p>
            Cart contents are kept in your browser. Signed-in wishlist items and saved addresses
            are stored with your account. We may also receive IP address, browser or device
            information, request details and security logs from the site and its hosting
            environment. Password-recovery and checkout-completion values are used for short,
            security-related flows.
          </p>
        </LegalSubsection>
        <LegalSubsection id="messages" title="Messages you send">
          <p>
            If you contact us by email or include an order, delivery or pickup note, we receive
            the content of that message and the details needed to respond. Please do not send
            passwords or unnecessary payment information.
          </p>
        </LegalSubsection>
      </>
    ),
  },
  {
    id: "how-information-is-collected",
    title: "How information is collected",
    content: (
      <>
        <p>We collect information when you:</p>
        <ul>
          <li>create an account, sign in or ask for a password reset;</li>
          <li>add products to a cart or, when signed in, save wishlist items;</li>
          <li>save an address or enter delivery, pickup and contact details at checkout;</li>
          <li>submit an order request, use a coupon or view account order history;</li>
          <li>email us or provide notes and enquiries; and</li>
          <li>use the site, which creates necessary cookies, browser storage and server logs.</li>
        </ul>
        <p>
          We also receive limited technical information from Vercel, Supabase and Google Maps
          when those services support the site or when the embedded map is loaded. See our{" "}
          <PolicyLink documentKey="cookies">Cookie Policy</PolicyLink> for the audited storage
          list.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    content: (
      <>
        <p>We use the information described above to:</p>
        <ul>
          <li>create, secure and manage accounts and password recovery;</li>
          <li>validate carts, prices, stock, coupons and order details;</li>
          <li>process and fulfil delivery and pickup orders;</li>
          <li>contact you about stock, delivery availability, fees, pickup readiness or problems;</li>
          <li>provide support and respond to access, correction, complaint or deletion requests;</li>
          <li>prevent misuse, investigate security events and maintain service reliability;</li>
          <li>administer inventory, refunds, disputes and business records; and</li>
          <li>comply with legal, tax, accounting and regulatory obligations that apply.</li>
        </ul>
      </>
    ),
  },
  {
    id: "disclosure-and-providers",
    title: "Disclosure and service providers",
    content: (
      <>
        <p>
          We disclose information only where needed for the purposes described in this policy,
          where you direct us to do so, or where disclosure is authorised or required by law.
          The application audit identified these providers:
        </p>
        <ul>
          <li>
            <strong>Vercel</strong> provides website hosting and may process requests, IP
            addresses and technical logs needed to deliver and protect the site.
          </li>
          <li>
            <strong>Supabase</strong> provides PostgreSQL database services, account and
            password-recovery functions, and storage for product images.
          </li>
          <li>
            <strong>Google Maps</strong> provides the embedded store map and directions link.
            Google receives information when its map content is loaded or used.
          </li>
        </ul>
        <p>
          We may also disclose relevant information to professional advisers, insurers if later
          engaged for a matter, government bodies, regulators or law-enforcement agencies where
          reasonably necessary and legally permitted or required. This is not a claim that a
          particular adviser, insurer or authority receives data routinely.
        </p>
        <LegalNote>
          <p>
            The audit found no online payment processor, analytics platform, advertising pixel,
            SMS provider or separate error-monitoring service in the current application. We
            will update this policy before describing or enabling any such service.
          </p>
        </LegalNote>
      </>
    ),
  },
  {
    id: "overseas-processing",
    title: "Overseas processing",
    content: (
      <>
        <p>
          Vercel, Supabase and Google operate services and support functions internationally.
          Depending on the account settings, service architecture and support arrangements,
          information may be processed or accessible outside Australia.
        </p>
        <p>
          We have not verified a complete list of processing countries for publication and do
          not promise that all information remains in Australia. Where applicable law requires
          steps in relation to overseas disclosure, we will take those steps. You can email us
          for the most current information available to us.
        </p>
      </>
    ),
  },
  {
    id: "security-and-retention",
    title: "Security and retention",
    content: (
      <>
        <LegalSubsection id="security-measures" title="Security measures">
          <p>
            The current application uses access controls, encrypted HTTPS connections in
            production, secure and HTTP-only account cookies, hashed storefront passwords and
            session tokens, restricted administrative routes, input validation, selected rate
            limits and browser security headers. Supabase credentials with elevated access are
            kept on the server and are not intended for client bundles.
          </p>
          <p>
            Security involves people, processes and technology, and no internet service can be
            guaranteed completely secure. Please tell us promptly if you suspect unauthorised
            account activity.
          </p>
        </LegalSubsection>
        <LegalSubsection id="retention" title="Retention">
          <p>
            We keep information only for as long as reasonably required to administer accounts
            and orders, meet legal, tax and accounting obligations, resolve disputes, prevent
            fraud and operate the store. The application does not currently define verified
            public retention periods, so we do not state fixed periods here.
          </p>
          <p>
            When information is no longer required, we will take reasonable steps appropriate to
            the information and our legal obligations. Some order and transaction records may
            need to be retained even after an account-deletion request.
          </p>
        </LegalSubsection>
      </>
    ),
  },
  {
    id: "access-correction-and-deletion",
    title: "Access, correction and account deletion",
    content: (
      <>
        <p>
          Signed-in customers can view order history and add, update or delete saved addresses.
          The current application does not provide a self-service data export, profile-editing
          screen or account-deletion button.
        </p>
        <p>
          To request access to personal information, correction of a record, a portable copy
          where available, or account deletion, email{" "}
          <a href={`mailto:${BUSINESS_CONFIG.publicEmail}`}>{BUSINESS_CONFIG.publicEmail}</a>.
          Tell us the email used for your account or order and the request you are making. We may
          need to verify your identity before acting.
        </p>
        <p>
          We will assess the request under applicable law and explain if information cannot be
          deleted immediately because it is needed for an order, legal record, dispute, fraud
          prevention or another lawful purpose. Closing an account does not erase rights or
          obligations connected with an existing order.
        </p>
      </>
    ),
  },
  {
    id: "complaints",
    title: "Privacy questions and complaints",
    content: (
      <>
        <p>
          Email us with your name, preferred contact method, a clear description of the concern,
          relevant dates or order number, and the outcome you are seeking. Do not include
          passwords or unrelated sensitive information. We will investigate and respond within
          a reasonable period.
        </p>
        <p>
          Depending on the laws that apply to your matter, you may have a right to contact the{" "}
          <ExternalLegalLink href="https://www.oaic.gov.au/privacy/privacy-complaints">
            Office of the Australian Information Commissioner
          </ExternalLegalLink>{" "}
          or another regulator. We can explain the external avenue relevant to a complaint after
          reviewing it; this statement does not represent that Privacy Act coverage has been
          legally confirmed.
        </p>
      </>
    ),
  },
  {
    id: "marketing",
    title: "Marketing and service messages",
    content: (
      <>
        <p>
          The audited application does not currently include a persistent newsletter list,
          marketing-consent field or promotional messaging provider. We do not treat placing an
          order or sending an enquiry as consent to receive marketing.
        </p>
        <p>
          If optional electronic marketing is introduced, we will seek or otherwise establish
          consent as required, identify the sender and provide a working unsubscribe method.
          Withdrawing marketing consent will not stop necessary account, security, order,
          delivery, pickup, safety or recall communications.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    content: (
      <p>
        The online store is intended for customers capable of providing order details and
        arranging payment at delivery or pickup. We do not knowingly seek unnecessary personal
        information from children. If you believe a child has provided information that should
        not be held, contact us so we can assess the appropriate action.
      </p>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy when our services, providers or legal obligations change. We
        will publish the current version here with a new “Last updated” date. If a change
        materially affects how we use information already collected, we will use a reasonable
        method to bring it to affected customers’ attention where required.
      </p>
    ),
  },
];

const termsSections: readonly LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance and consumer rights",
    content: (
      <>
        <p>
          By using this site, creating an account or submitting an order, you agree to these
          terms. If you do not agree, do not submit an order. Your use of the site is also
          governed by our <PolicyLink documentKey="privacy">Privacy Policy</PolicyLink>.
        </p>
        <LegalNote tone="important">
          <p>
            These terms are subject to rights and guarantees that cannot lawfully be excluded,
            including applicable rights under the Australian Consumer Law. Nothing in these
            terms excludes, restricts or modifies those rights or remedies.
          </p>
        </LegalNote>
      </>
    ),
  },
  {
    id: "eligibility-and-accounts",
    title: "Eligibility, guest checkout and accounts",
    content: (
      <>
        <p>
          You must be capable of entering an order arrangement and provide accurate, current
          contact and fulfilment information. Guest checkout is supported. If you create an
          account, keep credentials confidential and tell us promptly about suspected
          unauthorised use.
        </p>
        <p>
          Accounts are for the person who created them and must not be transferred or used to
          impersonate another person. We may restrict or suspend access where reasonably
          necessary to protect customers, the store or the service, investigate misuse, or meet
          a legal obligation. We will not use this right to avoid an existing order or consumer
          obligation.
        </p>
      </>
    ),
  },
  {
    id: "products",
    title: "Products, images and natural variation",
    content: (
      <>
        <p>
          Product photographs are representative and may show serving suggestions or packaging
          that later changes. Packaging, country of origin, ingredients, labels and preparation
          instructions can change. Check the physical product before consumption or use.
        </p>
        <p>
          Fresh produce naturally varies in shape, colour, size and appearance. Pack sizes and
          listed weights identify the product variant offered; the current checkout does not
          calculate a later variable-weight adjustment. These statements do not excuse goods
          that fail a consumer guarantee or do not match an agreed description.
        </p>
        <p>
          Read our{" "}
          <PolicyLink documentKey="productInformation">
            Product and Allergen Information
          </PolicyLink>{" "}
          page before relying on abbreviated online product details.
        </p>
      </>
    ),
  },
  {
    id: "allergens-and-dietary-information",
    title: "Allergens and dietary information",
    content: (
      <>
        <p>
          Ingredients, allergen statements, dietary claims and nutrition information are
          controlled by manufacturers and can change. Customers with allergies or dietary
          requirements should review the current physical label and contact us before ordering
          if clarification is needed.
        </p>
        <p>
          We do not claim that the store, supply chain or delivery environment is free from a
          particular allergen. We also do not guarantee a dietary characteristic solely because
          a short website description or filter refers to it.
        </p>
      </>
    ),
  },
  {
    id: "prices",
    title: "Prices, GST, fees and promotions",
    content: (
      <>
        <p>
          Website prices are in Australian dollars. Any GST that applies is treated as included
          in the displayed consumer price unless the site clearly states otherwise. Prices,
          coupon discounts and stock are checked by the server when you submit an order.
        </p>
        <p>
          Local delivery availability and any delivery fee are confirmed before fulfilment; the
          delivery checkout currently shows an items total and explains that delivery is extra.
          Pickup is free. No verified delivery radius, fixed delivery fee or minimum order is
          published in the current configuration.
        </p>
        <p>
          If an obvious technical or pricing error is identified before acceptance, we will
          contact you and ask whether you want to proceed at the correct price or cancel the
          affected item or order. We will not silently impose a different confirmed price.
          Promotions may have validity dates, stock limits, eligible products and other clearly
          disclosed campaign terms.
        </p>
      </>
    ),
  },
  {
    id: "orders-and-acceptance",
    title: "Order requests, acknowledgement and acceptance",
    content: (
      <>
        <ol>
          <li>
            <strong>Submission:</strong> selecting “Request delivery order” or “Place pickup
            order” sends your requested items and details to us.
          </li>
          <li>
            <strong>Acknowledgement:</strong> the success screen and order number acknowledge
            that the request was recorded as pending. They are not, by themselves, final
            acceptance.
          </li>
          <li>
            <strong>Review:</strong> we check stock, product prices, coupon eligibility,
            fulfilment details and, for delivery, availability and any fee.
          </li>
          <li>
            <strong>Acceptance:</strong> the order is accepted when we confirm that we can
            fulfil it and communicate any delivery fee or agreed changes. For pickup, we also
            contact you when the order is ready.
          </li>
        </ol>
        <p>
          The current application does not take payment when the request is submitted. You
          become obliged to pay the accepted total at delivery or pickup, subject to any
          cancellation or remedy rights that apply. If we cannot accept all or part of the
          request, we will contact you and adjust or cancel it without charging for unaccepted
          items.
        </p>
      </>
    ),
  },
  {
    id: "stock-and-substitutions",
    title: "Stock, produce and substitutions",
    content: (
      <>
        <p>
          Stock can change quickly, especially for fresh or imported groceries. Submitting an
          order does not guarantee availability until we complete our review.
        </p>
        <p>
          The current checkout does not include an automatic substitution preference and does
          not authorise us to replace an item automatically. If an item is unavailable, we may
          contact you to propose an alternative. A materially different product or a product
          with different allergen implications will not be added without your agreement. We
          will explain any price difference; if you decline, the item is removed and you do not
          pay for it.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "Payments",
    content: (
      <>
        <p>
          The supported methods are payment on delivery for delivery orders and payment at the
          store for pickup orders. The website does not currently process online card payments
          and no online payment provider is integrated.
        </p>
        <p>
          Do not send card details by email or place them in order notes. Any additional
          in-store payment methods and the way a refund is returned must be confirmed by the
          store at the time; these terms do not claim a specific card, cash or digital-wallet
          method.
        </p>
      </>
    ),
  },
  {
    id: "cancellations",
    title: "Changes and cancellations",
    content: (
      <>
        <p>
          Contact us as soon as possible if you need to change or cancel a request. We will try
          to help, but preparation, reservation of perishable stock or dispatch may limit what
          can reasonably be changed.
        </p>
        <p>
          We may cancel an order we cannot fulfil, where details cannot be verified, where
          delivery cannot be safely completed, or where there is fraud, abuse or an obvious
          error. We will tell you and will not require payment for goods not supplied. This
          section does not limit statutory cancellation or remedy rights.
        </p>
      </>
    ),
  },
  {
    id: "delivery-and-pickup",
    title: "Delivery and pickup",
    content: (
      <p>
        Our <PolicyLink documentKey="deliveryPickup">Delivery and Pickup Policy</PolicyLink>{" "}
        forms part of these terms. It explains delivery checks, fees, timing, failed delivery,
        pickup readiness and care for chilled or frozen goods.
      </p>
    ),
  },
  {
    id: "returns-and-remedies",
    title: "Returns, refunds and remedies",
    content: (
      <>
        <p>
          See our{" "}
          <PolicyLink documentKey="returnsRefunds">
            Returns, Refunds and Replacements Policy
          </PolicyLink>{" "}
          for faulty, unsafe, damaged, missing, incorrect or wrongly described products.
        </p>
        <p>
          Nothing in these terms excludes, restricts or modifies a right or remedy that cannot
          legally be excluded. We do not use “no refunds” or “all sales are final” wording, and
          we do not impose a restocking fee on a statutory remedy.
        </p>
      </>
    ),
  },
  {
    id: "promotions",
    title: "Promotions and coupon codes",
    content: (
      <>
        <p>
          Promotions apply during stated dates and while eligible stock is available. A coupon
          may specify eligible products, minimum subtotal, maximum discount, usage limit or
          expiry. Separate campaign terms apply where displayed.
        </p>
        <p>
          Offers are non-combinable or limited per customer only where this is clearly stated.
          If a technical error applies a promotion contrary to published conditions, we will
          contact you before order acceptance rather than unilaterally changing an accepted
          order.
        </p>
      </>
    ),
  },
  {
    id: "website-use",
    title: "Acceptable website use",
    content: (
      <>
        <p>You must not:</p>
        <ul>
          <li>access accounts, administrative areas or data without permission;</li>
          <li>impersonate another person or provide deliberately false order information;</li>
          <li>upload malicious material or interfere with security, pricing, stock or checkout;</li>
          <li>use automation or scraping in a way that damages, overloads or abuses the service;</li>
          <li>test security without prior written permission; or</li>
          <li>use the site for an unlawful purpose.</li>
        </ul>
        <p>
          This does not prohibit ordinary browsing, consumer reviews, lawful price comparison,
          accessibility technology, search-engine indexing or the exercise of a legal right.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    content: (
      <p>
        The original site design, copy, software and {BUSINESS_CONFIG.tradingName} branding are
        owned by or licensed for our use and are protected by applicable law. Product brands,
        packaging, manufacturer material and Google Maps content belong to their respective
        owners. We do not claim ownership of third-party trade marks merely because they appear
        in a product listing.
      </p>
    ),
  },
  {
    id: "third-party-services",
    title: "Third-party services and links",
    content: (
      <p>
        The site uses Vercel, Supabase and Google Maps and may link to manufacturer or regulator
        websites. Those services have their own terms and privacy practices. Their terms do not
        remove any responsibility {BUSINESS_CONFIG.tradingName} has to you under applicable law.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    content: (
      <>
        <p>
          We do not exclude or limit liability where doing so would be unlawful. To the extent
          the law permits a limitation, responsibility will be assessed having regard to the
          loss caused, the conduct of each party, reasonable steps to avoid loss and any remedy
          available under applicable consumer law.
        </p>
        <p>
          Product-information cautions, availability checks and third-party links are intended
          to help customers make informed decisions; they are not absolute exclusions of
          responsibility for misleading descriptions, unsafe goods, negligence or other
          liability that cannot be excluded.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    content: (
      <p>
        These terms are governed by the laws applicable in South Australia and Australia. The
        courts and tribunals that have jurisdiction may hear disputes, subject to any mandatory
        consumer protection or jurisdictional right available to you.
      </p>
    ),
  },
  {
    id: "changes-to-terms",
    title: "Changes to these terms",
    content: (
      <p>
        We may update these terms when the service, business practices or law changes. The
        version applying to an order is the version made available when you submit it, unless
        the law or an agreed change requires otherwise. The current version will show its “Last
        updated” date.
      </p>
    ),
  },
];

const returnsSections: readonly LegalSection[] = [
  {
    id: "consumer-law-rights",
    title: "Your Australian Consumer Law rights",
    content: (
      <>
        <LegalNote tone="important">
          <p>
            Nothing in this policy excludes, restricts or modifies rights or remedies that
            cannot be excluded under the Australian Consumer Law.
          </p>
        </LegalNote>
        <p>
          Consumer guarantees apply automatically where required. This policy distinguishes
          those statutory remedies from any discretionary change-of-mind arrangement.
        </p>
      </>
    ),
  },
  {
    id: "problems-covered",
    title: "Faulty, damaged, unsafe, missing or incorrect products",
    content: (
      <>
        <p>Contact us if a product is:</p>
        <ul>
          <li>faulty, unsafe, damaged, spoiled or not of acceptable quality;</li>
          <li>materially different from its description or the product ordered;</li>
          <li>incorrect, missing from the fulfilled order or supplied in the wrong quantity;</li>
          <li>not fit for a purpose you made known and reasonably relied on; or</li>
          <li>subject to a safety recall or another applicable consumer-guarantee problem.</li>
        </ul>
        <p>
          An opened product may still qualify for a remedy. Original packaging is helpful where
          available but is not a condition that overrides a statutory right.
        </p>
      </>
    ),
  },
  {
    id: "major-and-minor-problems",
    title: "Major and minor problems",
    content: (
      <>
        <LegalSubsection id="major-problems" title="Major problems">
          <p>
            A problem may be major where, for example, the goods are unsafe, very different from
            their description, substantially unfit for their normal or disclosed purpose, or
            have a serious problem that would have stopped a reasonable customer buying them.
            Where the law gives you the choice, you may choose a refund or replacement of the
            same type.
          </p>
        </LegalSubsection>
        <LegalSubsection id="minor-problems" title="Minor problems">
          <p>
            For a minor problem, we may choose an appropriate free remedy. Grocery products are
            often not practically repairable, so the suitable remedy may be replacement, refund
            or another outcome required by law. If a minor problem is not addressed within a
            reasonable time, further remedies may be available.
          </p>
        </LegalSubsection>
      </>
    ),
  },
  {
    id: "how-to-contact-us",
    title: "How to make a claim",
    content: (
      <>
        <p>
          Email us as soon as reasonably practicable after you notice the issue. Include your
          name, contact details, order number if available, the affected product, what happened
          and the remedy you are seeking.
        </p>
        <p>
          A receipt, online order number, invoice, payment record or other reasonable evidence
          can help establish purchase. Clear photographs of the product, label, use-by date,
          damage or temperature condition may help us assess the issue, particularly for
          perishable goods. These items are useful evidence, not blanket conditions that remove
          a legal right.
        </p>
      </>
    ),
  },
  {
    id: "assessment-and-remedies",
    title: "Assessment and available remedies",
    content: (
      <>
        <p>
          We may ask reasonable questions or inspect the goods where practical so we can confirm
          the issue and the appropriate remedy. The seller remains responsible for handling a
          valid claim; we will not simply require you to deal only with the manufacturer.
        </p>
        <p>
          Depending on the facts and applicable law, the remedy may include a refund,
          replacement, correction of a missing or incorrect item, reimbursement of a reasonable
          loss, or another remedy. We will tell you the outcome and any next steps.
        </p>
      </>
    ),
  },
  {
    id: "refunds-and-delivery-costs",
    title: "Refund method and delivery costs",
    content: (
      <>
        <p>
          Current orders are paid on delivery or at pickup; the website does not process an
          online payment. Where a refund is due, it will generally be returned in the same form
          as payment unless you agree to another lawful method. We will confirm the practical
          method during assessment because supported in-store methods have not been verified for
          publication.
        </p>
        <p>
          Delivery or reasonable return costs are assessed according to the cause of the
          problem and applicable law. We do not apply a blanket rule that delivery fees are
          never refundable. We do not charge a restocking fee for a statutory remedy.
        </p>
      </>
    ),
  },
  {
    id: "perishable-and-temperature-controlled-goods",
    title: "Perishable, chilled and frozen goods",
    content: (
      <>
        <p>
          For spoiled, thawed, damaged or otherwise unsafe groceries, stop using the product and
          preserve relevant evidence where it is safe to do so. Contact us promptly because
          condition can change quickly, but no short notice period in this policy extinguishes a
          right that applies under law.
        </p>
        <p>
          We will consider product type, use-by information, delivery or pickup handling,
          customer storage after receipt, and other relevant evidence. Prompt refrigeration or
          freezing by the customer is important, but it does not excuse improper storage or
          delivery handling for which we are responsible.
        </p>
      </>
    ),
  },
  {
    id: "change-of-mind",
    title: "Change-of-mind requests",
    content: (
      <>
        <p>
          {BUSINESS_CONFIG.tradingName} does not currently publish an approved general
          change-of-mind return promise. A request that is solely a change of mind may be
          considered case by case, but no discretionary return is guaranteed by this draft.
        </p>
        <p>
          This does not affect remedies for faulty, unsafe, damaged, wrongly described,
          incorrect or otherwise non-compliant products. Any future approved change-of-mind
          policy will be stated separately and honoured according to its terms.
        </p>
      </>
    ),
  },
  {
    id: "recalls-and-safety",
    title: "Recalls and urgent safety issues",
    content: (
      <>
        <p>
          Stop using a recalled or potentially unsafe product. Follow the recall notice and
          contact us with the product and order details. You can also check current Australian
          recall notices at{" "}
          <ExternalLegalLink href="https://www.productsafety.gov.au/recalls">
            Product Safety Australia
          </ExternalLegalLink>
          .
        </p>
        <p>
          If there is an immediate risk to health or safety, seek appropriate emergency or
          medical assistance first. Do not consume a product merely to prove a problem.
        </p>
      </>
    ),
  },
  {
    id: "processing-expectations",
    title: "Processing expectations",
    content: (
      <p>
        We will acknowledge and assess a claim within a reasonable period having regard to its
        urgency, product type, evidence and the remedy required. We do not publish an invented
        fixed refund deadline. We will keep you informed if an assessment reasonably needs more
        information or time.
      </p>
    ),
  },
];

const deliverySections: readonly LegalSection[] = [
  {
    id: "available-options",
    title: "Available fulfilment options",
    content: (
      <p>
        The checkout offers local delivery and free pickup from{" "}
        {BUSINESS_CONFIG.address.formatted}. Payment is made on delivery or at pickup. Stock is
        checked when the order request is submitted and again as needed before confirmation.
      </p>
    ),
  },
  {
    id: "delivery-area",
    title: "Delivery area",
    content: (
      <>
        <p>
          A verified list of delivery suburbs or a delivery radius is not configured or
          published by the current application. Enter an accurate delivery address at checkout;
          our team will check whether local delivery is available before accepting the delivery
          arrangement.
        </p>
        <p>
          Submitting an address does not guarantee that it is within the service area. If we
          cannot deliver, we will contact you about pickup or cancellation.
        </p>
      </>
    ),
  },
  {
    id: "fees-and-minimum-order",
    title: "Delivery fees and minimum order",
    content: (
      <>
        <p>
          The delivery checkout displays the items total and clearly indicates that any
          delivery fee is added after our team confirms availability. We will tell you any fee
          before the order is accepted and fulfilled. Pickup is free.
        </p>
        <p>
          No verified fixed delivery fee, free-delivery threshold or minimum order is published
          in the current configuration. We will not invent or silently apply one through this
          policy. Any requirement must be disclosed before you agree to proceed.
        </p>
      </>
    ),
  },
  {
    id: "timing-and-confirmation",
    title: "Timing, requested windows and confirmation",
    content: (
      <>
        <p>
          The current checkout does not offer a guaranteed delivery or pickup time-slot
          selector. Notes can communicate a preference, but they do not create a guaranteed
          time. We will contact you to confirm stock and the fulfilment arrangement.
        </p>
        <p>
          Estimates may change because of stock preparation, traffic, weather, supplier delays,
          safety issues or other events outside reasonable control. We will use reasonable
          efforts to update you about a material delay and discuss a suitable next step.
        </p>
      </>
    ),
  },
  {
    id: "customer-responsibilities",
    title: "Accurate details and safe access",
    content: (
      <>
        <p>
          Provide the correct recipient name, telephone number, email, address, postcode, access
          instructions and relevant delivery notes. Keep your contact method available when
          delivery is expected.
        </p>
        <p>
          The delivery location must be reasonably and safely accessible. Tell us about gates,
          apartment access or hazards. Do not put passwords, payment details or unnecessary
          sensitive information in delivery notes.
        </p>
      </>
    ),
  },
  {
    id: "unattended-delivery",
    title: "Unattended delivery",
    content: (
      <>
        <p>
          The current checkout does not provide a supported “leave in a safe place” or
          unattended-delivery option. A free-text delivery note is not, by itself, confirmation
          that groceries—particularly chilled or frozen goods—will be left unattended.
        </p>
        <p>
          If an unattended arrangement is discussed directly, we will confirm whether it can be
          accepted and any conditions before fulfilment. We will not leave goods where access is
          unsafe or temperature-sensitive products cannot be handled appropriately.
        </p>
      </>
    ),
  },
  {
    id: "failed-delivery",
    title: "If delivery cannot be completed",
    content: (
      <>
        <p>
          Delivery may fail if nobody is available, the address or access details are incorrect,
          the location is unsafe, or we cannot make contact. We will try to contact you and
          discuss collection, a new arrangement or cancellation as appropriate.
        </p>
        <p>
          This policy does not invent or authorise a redelivery fee. If a new cost is proposed,
          it must be disclosed and agreed before the new arrangement, subject to any rights you
          have where the failed delivery was our responsibility.
        </p>
      </>
    ),
  },
  {
    id: "store-pickup",
    title: "Store pickup",
    content: (
      <>
        <p>
          Pickup is from {BUSINESS_CONFIG.address.formatted}. Store hours are{" "}
          {BUSINESS_CONFIG.openingHours.display}. Wait until we contact you to say the order is
          packed and ready before travelling to collect it.
        </p>
        <p>
          Bring the order number and the name used at checkout. We may ask for reasonable
          confirmation that you are collecting the correct order. The application does not have
          an online setting to nominate another collector, so contact us before sending someone
          else.
        </p>
        <p>
          If an order is not collected, we will try to contact you. Perishable items may limit
          how long an order can safely be held. Any cancellation, payment or remedy will be
          assessed in light of the circumstances and applicable law; this draft does not impose
          an invented storage fee or automatic forfeiture.
        </p>
      </>
    ),
  },
  {
    id: "fresh-chilled-and-frozen-goods",
    title: "Fresh, chilled and frozen goods",
    content: (
      <>
        <p>
          Refrigerate or freeze products promptly after receipt or collection according to the
          physical label. Check temperature-sensitive goods when you receive them and contact us
          if there is a quality or safety concern.
        </p>
        <p>
          Customer storage after handover is relevant to product condition, but this does not
          remove our responsibility for improper handling before or during delivery or pickup.
          See our{" "}
          <PolicyLink documentKey="returnsRefunds">
            Returns, Refunds and Replacements Policy
          </PolicyLink>{" "}
          for product problems.
        </p>
      </>
    ),
  },
  {
    id: "changes-and-cancellations",
    title: "Order changes and cancellations",
    content: (
      <p>
        Contact us promptly if fulfilment details change. Preparation or dispatch may affect
        what can be changed, but statutory rights are preserved. The cancellation process and
        order-acceptance point are explained in our{" "}
        <PolicyLink documentKey="terms">Terms and Conditions</PolicyLink>.
      </p>
    ),
  },
];

const cookieSections: readonly LegalSection[] = [
  {
    id: "what-we-use",
    title: "What the site uses",
    content: (
      <>
        <p>
          A cookie is a small value stored by a browser and sent with relevant web requests.
          Local storage keeps values in the browser without sending them automatically on every
          request. The current site uses both for core account, cart, checkout and password
          recovery functions.
        </p>
        <p>
          The audit found no session-storage use, analytics cookies, advertising pixels or
          marketing trackers. Because only essential storage is currently used, the site does
          not display a non-essential cookie-consent banner or preference centre.
        </p>
      </>
    ),
  },
  {
    id: "storage-table",
    title: "Cookie and browser-storage register",
    content: (
      <LegalTable
        caption={`Audited cookies and local browser storage used by ${BUSINESS_CONFIG.tradingName}`}
      >
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Provider</th>
            <th scope="col">Purpose</th>
            <th scope="col">Category</th>
            <th scope="col">Approximate duration</th>
            <th scope="col">Essential</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              <code>gsp_session</code>
            </th>
            <td>{BUSINESS_CONFIG.tradingName}</td>
            <td>Authenticates a signed-in storefront or admin session using an HTTP-only token.</td>
            <td>Strictly necessary</td>
            <td>7 days, or until sign-out/expiry</td>
            <td>Yes</td>
          </tr>
          <tr>
            <th scope="row">
              <code>gsp_checkout_completion</code>
            </th>
            <td>{BUSINESS_CONFIG.tradingName}</td>
            <td>Validates the immediate order-success flow and permits the submitted cart to clear once.</td>
            <td>Strictly necessary</td>
            <td>5 minutes</td>
            <td>Yes</td>
          </tr>
          <tr>
            <th scope="row">
              <code>a1_recovery_access</code>
            </th>
            <td>{BUSINESS_CONFIG.tradingName} / Supabase</td>
            <td>Short-lived HTTP-only password-recovery access token.</td>
            <td>Strictly necessary</td>
            <td>30 minutes or until cleared</td>
            <td>Yes</td>
          </tr>
          <tr>
            <th scope="row">
              <code>a1_recovery_refresh</code>
            </th>
            <td>{BUSINESS_CONFIG.tradingName} / Supabase</td>
            <td>Short-lived HTTP-only password-recovery refresh token.</td>
            <td>Strictly necessary</td>
            <td>30 minutes or until cleared</td>
            <td>Yes</td>
          </tr>
          <tr>
            <th scope="row">
              <code>grocery-store-pro.cart.v1</code>
            </th>
            <td>{BUSINESS_CONFIG.tradingName}</td>
            <td>Keeps product and variant identifiers and quantities in the browser cart.</td>
            <td>Strictly necessary</td>
            <td>Until cart/browser data is cleared</td>
            <td>Yes</td>
          </tr>
          <tr>
            <th scope="row">
              <code>grocery-store-pro.checkout-cleared.v1</code>
            </th>
            <td>{BUSINESS_CONFIG.tradingName}</td>
            <td>Remembers up to 25 order numbers whose successful checkout already cleared the cart.</td>
            <td>Strictly necessary</td>
            <td>Until browser data is cleared</td>
            <td>Yes</td>
          </tr>
          <tr>
            <th scope="row">
              Supabase PKCE verifier (
              <code>sb-…-auth-token-code-verifier</code>)
            </th>
            <td>Supabase</td>
            <td>Links a password-reset request to its secure callback; the middle part varies by Supabase project.</td>
            <td>Strictly necessary</td>
            <td>Until recovery completes; otherwise until browser data is cleared</td>
            <td>Yes</td>
          </tr>
        </tbody>
      </LegalTable>
    ),
  },
  {
    id: "categories",
    title: "Storage categories",
    content: (
      <>
        <ul>
          <li>
            <strong>Strictly necessary:</strong> required for sign-in, security, cart, checkout
            and password recovery. The audited site uses this category.
          </li>
          <li>
            <strong>Preferences:</strong> remembers optional display or experience choices. No
            separate preference storage was found.
          </li>
          <li>
            <strong>Analytics:</strong> measures audience or site use. No analytics integration
            was found.
          </li>
          <li>
            <strong>Marketing:</strong> profiles or tracks people for advertising. No marketing
            tracker was found.
          </li>
        </ul>
        <p>
          We will not reclassify non-essential analytics or marketing storage as “necessary”. If
          those technologies are added, we will update this register and implement controls
          appropriate to the intended compliance approach before enabling them.
        </p>
      </>
    ),
  },
  {
    id: "managing-storage",
    title: "Managing cookies and local storage",
    content: (
      <>
        <p>
          Browser settings can block or delete cookies and local storage. Blocking necessary
          storage may sign you out, empty the local cart, interrupt password recovery or prevent
          the order-success flow from working correctly.
        </p>
        <p>
          Signing out clears the main A1 session cookie. You can clear cart items within the
          site or use browser controls to clear stored site data. There are currently no
          non-essential choices to revisit; if a preference centre is later introduced, a link
          to reopen it will be provided here and in an accessible location.
        </p>
      </>
    ),
  },
  {
    id: "google-maps",
    title: "Google Maps",
    content: (
      <>
        <p>
          The homepage loads an embedded Google Map and the directions button opens Google Maps.
          When Google content is loaded or used, the browser connects to Google and Google may
          receive technical information and interact with its own cookies or storage according
          to the user’s Google settings and Google’s policies.
        </p>
        <p>
          Google controls the names and durations of its service storage, so we do not invent a
          fixed Google cookie list in the first-party table above. You can browse store products
          and use the written address without using the directions link.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We will update this policy and its “Last updated” date if storage names, purposes,
        providers or categories change. Material non-essential tracking changes will be
        accompanied by the controls required for the chosen compliance approach.
      </p>
    ),
  },
];

const productSections: readonly LegalSection[] = [
  {
    id: "representative-information",
    title: "Images and online descriptions",
    content: (
      <>
        <p>
          Product images are representative. Screens, lighting, seasonal supply and packaging
          updates can make the delivered product look different from a photograph. Online
          descriptions may be abbreviated for browsing.
        </p>
        <p>
          We aim to keep listings useful and accurate, but the physical product and its current
          manufacturer label are the most current source for packaging-specific information.
          Contact us before ordering if a particular pack, size, origin or formulation is
          important.
        </p>
      </>
    ),
  },
  {
    id: "ingredients-allergens-and-diet",
    title: "Ingredients, allergens and dietary requirements",
    content: (
      <>
        <p>
          Ingredients, allergen declarations, nutrition panels, dietary claims, preparation
          instructions and manufacturing statements can change. Check the physical packaging
          before consuming or serving a product.
        </p>
        <p>
          If you have an allergy, intolerance or dietary requirement, do not rely solely on a
          product title, category, tag or abbreviated website description. Contact us before
          ordering where clarification is needed, and verify the manufacturer’s current label
          when the product arrives.
        </p>
        <p>
          We do not claim that our store, suppliers or fulfilment environment is free from any
          particular allergen.
        </p>
      </>
    ),
  },
  {
    id: "fresh-produce-and-weight",
    title: "Fresh produce, size and weight",
    content: (
      <>
        <p>
          Fresh vegetables naturally vary in shape, colour, ripeness, size and appearance.
          Reasonable visual variation does not, by itself, mean the product is defective, but
          produce must still meet applicable quality and description obligations.
        </p>
        <p>
          Product variants may state a weight, volume, size or pack count. The current checkout
          charges the listed variant price and does not implement a later final-weight
          adjustment. We will update this page before introducing a variable-weight pricing
          process.
        </p>
      </>
    ),
  },
  {
    id: "storage-and-preparation",
    title: "Storage and preparation",
    content: (
      <>
        <p>
          Follow storage, refrigeration, freezing, cooking, heating and use-by instructions on
          the physical product. Transfer chilled and frozen goods to suitable storage promptly
          after delivery or pickup.
        </p>
        <p>
          Website storage notes are general shopping information and do not replace the current
          label or appropriate food-safety advice. Contact us if a temperature-sensitive product
          arrives in a condition that may be unsafe.
        </p>
      </>
    ),
  },
  {
    id: "origin-and-manufacturer-information",
    title: "Origin and manufacturer information",
    content: (
      <>
        <p>
          Country-of-origin statements, import details and manufacturer information should be
          checked on the current package because sourcing may change. The product catalogue has
          fields for origin, ingredients, allergens and storage, but not every product is
          guaranteed to have complete information online.
        </p>
        <p>
          Manufacturer links are not currently provided on every listing. Use the contact
          details printed on the product or ask us for help identifying the relevant
          manufacturer information.
        </p>
      </>
    ),
  },
  {
    id: "recalls-and-safety-notices",
    title: "Recalls and safety notices",
    content: (
      <>
        <p>
          Stop using a product if you become aware of a recall or safety warning and follow the
          notice instructions. Contact us with the product, batch or date information and your
          order details where available.
        </p>
        <p>
          The site does not currently provide an automated product-recall feed. Current
          Australian recall notices are published by{" "}
          <ExternalLegalLink href="https://www.productsafety.gov.au/recalls">
            Product Safety Australia
          </ExternalLegalLink>
          , and manufacturers may publish additional notices.
        </p>
      </>
    ),
  },
  {
    id: "consumer-rights",
    title: "Consumer rights",
    content: (
      <>
        <p>
          The cautions on this page help customers use current product information; they do not
          permit misleading descriptions or override rights that cannot be excluded under the
          Australian Consumer Law.
        </p>
        <p>
          If a product is unsafe, faulty, damaged, wrongly described, incorrect or otherwise
          does not comply with an applicable guarantee, see our{" "}
          <PolicyLink documentKey="returnsRefunds">
            Returns, Refunds and Replacements Policy
          </PolicyLink>
          .
        </p>
      </>
    ),
  },
];

const accessibilitySections: readonly LegalSection[] = [
  {
    id: "our-commitment",
    title: "Our commitment",
    content: (
      <p>
        We aim to make online grocery shopping practical for customers using keyboards, touch,
        screen readers, zoom, larger text and reduced-motion settings. Accessibility is an
        ongoing responsibility, and we welcome specific feedback when something creates a
        barrier.
      </p>
    ),
  },
  {
    id: "current-support",
    title: "Current accessibility support",
    content: (
      <>
        <p>The current storefront includes:</p>
        <ul>
          <li>a skip link and semantic header, navigation, main-content and footer landmarks;</li>
          <li>keyboard-accessible links, buttons, forms and native footer disclosures;</li>
          <li>visible focus styles and minimum touch-target guidance for core controls;</li>
          <li>responsive layouts and text that adapts across common mobile and desktop widths;</li>
          <li>alternative text fields for product images and labelled form controls;</li>
          <li>reduced-motion CSS that suppresses non-essential animation; and</li>
          <li>heading and status patterns intended to support assistive technology.</li>
        </ul>
        <p>
          These features describe the implementation goals and code reviewed for this statement.
          They are not a claim of a specific WCAG conformance level.
        </p>
      </>
    ),
  },
  {
    id: "screen-reader-and-keyboard-goals",
    title: "Keyboard, screen-reader and visual-access goals",
    content: (
      <>
        <p>
          We aim to keep important shopping actions reachable without a mouse, preserve logical
          focus order, announce errors and status changes appropriately, use meaningful labels
          and headings, and avoid conveying essential information by colour alone.
        </p>
        <p>
          Customers should be able to zoom and use responsive text without horizontal page
          scrolling in ordinary content. We also aim to provide useful image alternatives and
          ensure fixed mobile navigation does not cover the last actionable content.
        </p>
      </>
    ),
  },
  {
    id: "known-limitations",
    title: "Known limitations",
    content: (
      <>
        <p>
          A formal independent accessibility audit has not been completed, so we do not claim a
          tested WCAG conformance level. Known areas requiring continued review include:
        </p>
        <ul>
          <li>the completeness and quality of alternative text across all catalogue images;</li>
          <li>third-party Google Maps content and controls that we do not fully control;</li>
          <li>dynamic cart, wishlist, checkout and validation announcements in varied screen readers;</li>
          <li>very long product names, imported label content or incomplete catalogue details; and</li>
          <li>full keyboard, zoom, reflow and screen-reader testing across the supported browser matrix.</li>
        </ul>
        <p>
          If the embedded map is difficult to use, the written store address and email contact
          remain available, and you can{" "}
          <a
            href={BUSINESS_CONFIG.directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            open directions separately
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "reporting-a-problem",
    title: "Reporting an accessibility problem",
    content: (
      <>
        <p>
          Email {BUSINESS_CONFIG.publicEmail} and describe the page or task, what you expected,
          what happened, and the format or assistance that would help. If you are comfortable
          doing so, include:
        </p>
        <ul>
          <li>the page address and approximate date or time;</li>
          <li>your device, browser and assistive technology;</li>
          <li>the steps that led to the barrier; and</li>
          <li>a screenshot that does not expose private account or payment information.</li>
        </ul>
        <p>
          We will review the report and respond within a reasonable period. We can also discuss
          an alternative way to obtain store or policy information while an issue is assessed.
        </p>
      </>
    ),
  },
  {
    id: "ongoing-review",
    title: "Ongoing review",
    content: (
      <>
        <p>
          This statement was reviewed on 25 July 2026 alongside the current storefront code. We
          will update it after material interface changes, verified accessibility testing or a
          change to known limitations.
        </p>
        <p>
          You can <StoreLink>continue shopping</StoreLink> or read our{" "}
          <PolicyLink documentKey="privacy">Privacy Policy</PolicyLink> to understand how we
          handle information included in an accessibility report.
        </p>
      </>
    ),
  },
];

export const LEGAL_DOCUMENT_CONTENT = {
  privacy: {
    related: ["cookies", "terms", "accessibility"],
    sections: privacySections,
  },
  terms: {
    related: ["deliveryPickup", "returnsRefunds", "productInformation", "privacy"],
    sections: termsSections,
  },
  returnsRefunds: {
    related: ["terms", "deliveryPickup", "productInformation"],
    sections: returnsSections,
  },
  deliveryPickup: {
    related: ["terms", "returnsRefunds", "productInformation"],
    sections: deliverySections,
  },
  cookies: {
    related: ["privacy", "terms", "accessibility"],
    sections: cookieSections,
  },
  productInformation: {
    related: ["returnsRefunds", "deliveryPickup", "terms"],
    sections: productSections,
  },
  accessibility: {
    related: ["privacy", "cookies", "terms"],
    sections: accessibilitySections,
  },
} satisfies Record<LegalDocumentKey, LegalDocumentContent>;

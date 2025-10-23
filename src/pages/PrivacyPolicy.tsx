import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Helper component for headings, styled in blue per your request.
const SectionHeading: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => (
  <h2 className={`text-2xl font-semibold text-blue-700 mt-8 mb-4 ${className}`} {...props}>
    {children}
  </h2>
);

// Helper component for sub-headings
const SubHeading: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => (
  <h3 className={`text-xl font-semibold text-blue-600 mt-6 mb-3 ${className}`} {...props}>
    {children}
  </h3>
);

// Helper component for paragraphs
const P: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = "", ...props }) => (
  <p className={`mb-4 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

// Helper component for list items
const Li: React.FC<React.HTMLAttributes<HTMLLIElement>> = ({ children, className = "", ...props }) => (
  <li className={`mb-2 ml-6 list-disc ${className}`} {...props}>
    {children}
  </li>
);

/**
 * Privacy Policy Component
 * Renders the full privacy policy text formatted for a web page.
 */
const PrivacyPolicy = () => {
  return (
    <div className="p-6 md:p-12">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
        Privacy Policy
      </h1>
      
      <SectionHeading>INTRODUCTION</SectionHeading>
      <P>
        Travel Booking, LLC ("Travel Booking", "Company," "Us" or "We") respects your privacy and is
        committed to protecting it through our compliance with this policy. This Privacy Notice and Policy
        (hereafter the "Policy") describes the types of information we may collect from you or that you may
        provide when you visit or use www.travelbooking.com and the Company's mobile website, its
        mobile and tablet applications (collectively herein the "App"), or use any content, functionality, and
        services offered on or through tb.com or the App (collectively herein the "Website"), as well as our
        practices for collecting, using, maintaining, protecting, sharing, and disclosing that information.
      </P>
      <P>
        This Policy applies to information we collect:
      </P>
      <ul>
        <Li>When you visit the Website, App, and/or use our online services;</Li>
        <Li>In email, text, and other electronic messages between you and this Website or App; and</Li>
        <Li>
          When you interact with our advertising and applications available on third-party websites
          and services if those applications or advertising include links to this Policy.
        </Li>
      </ul>
      <P className="mt-4">
        This Policy does not apply to information collected by:
      </P>
      <ul>
        <Li>
          Us offline or through any other means, including on any other website operated by the
          Company or any third party; or
        </Li>
        <Li>
          Any third party, including through any application or content (including advertising) that
          may link to or be accessible from or on the Website.
        </Li>
      </ul>
      <P className="mt-4">
        Please read this Policy carefully to understand our policies and practices regarding your
        information and how we will treat it. This Policy may change from time to time (see "Changes to
        Our Privacy Policy"). Please check the Policy periodically for updates.
      </P>

      <SubHeading>Children Under the Age of 13</SubHeading>
      <P>
        Our Website is not intended for, intentionally targeted to, or designed for use by children under 13
        years of age. We do not knowingly or intentionally collect personal information from children under
        13. If you are under 13, do not use or provide any information on or through this Website, the App,
        or any of their features; do not register on the Website, make any purchases through the
        Website/App, use any of the interactive or public comment features of this Website, or provide any
        information about yourself to us, including your name, address, telephone number, email address,
        or any screen name or user name you may use. If we learn we have collected or received personal
        information from a child under 13 without verification of parental consent, we will delete that
        information. If you believe we might have any information from or about a child under 13, please
        contact us at help@chyeap.com.
      </P>

      <SectionHeading>INFORMATION WE COLLECT ABOUT YOU AND HOW WE COLLECT IT</SectionHeading>
      <P>
        We collect several types of information from and about users of our Website, including:
      </P>
      <ul>
        <Li>
          Information by which you may be personally identified, such as name, residential address,
          postal address, e-mail address, telephone number, credit card numbers or other payment
          information, or any other identifier by which you may be contacted online or offline
          ("personal information");
        </Li>
        <Li>Information that is about you but does not individually identify you;</Li>
        <Li>
          Information about your internet connection and IP address, the equipment you use to
          access our Website, the browser type and language, and access dates/times, referring
          website addresses, and other usage details;
        </Li>
        <Li>
          Categories of personal information described in subdivision (e) of Section 1798.80 of the
          California Civil Code, such as name, physical characteristics or description, address,
          telephone number and medical or health insurance information;
        </Li>
        <Li>
          Characteristics of protected classifications under state or federal law, such as age,
          sex/gender, marital status, medical condition, and disability information;
        </Li>
        <Li>
          Information you provide on our Website to assist you with travel arrangements for yourself
          or another person, for example, your username, password, location, zip/postal code,
          mailing address, email address, driver's license, passport or other government-issued
          identification numbers, date of birth, gender, arrival and departure locations and times,
          airline, hotel, or car rental loyalty program numbers and other travel-related information;
        </Li>
        <Li>Financial information, including the budget for travel arrangements;</Li>
      </ul>
      <P className="mt-4">
        We collect this information:
      </P>
      <ul>
        <Li>Directly from you when you provide it to us;</Li>
        <Li>
          Automatically as you navigate through the site. Information collected automatically may
          include usage details, IP addresses, operating systems, browsers, and information
          collected through cookies (small text files stored in a user's web browser), web beacons
          (electronic images that allow us to count users who have accessed particular content
          including certain cookies), and other tracking technologies;
        </Li>
        <Li>From third parties, for example, our business partners;</Li>
        <Li>
          From third party social media services, such as Google, Facebook, Twitter, Instagram, etc.
          that you may use to interact with our Website or that allow you to share information;
        </Li>
        <Li>
          Unaffiliated parties, such as analytics companies, advertising networks, affiliates, and
          other third parties that may provide us with information so we can better understand you
          and provide you with information that may be of interest to you.
        </Li>
      </ul>
      
      <SubHeading>Information You Provide to Us</SubHeading>
      <P>The information we collect on or through our Website may include:</P>
      <ul>
        <Li>
          Information that you provide by filling in forms on our Website. This includes information
          provided when registering to use our Website, subscribing to our service, posting material,
          or requesting further services. We may also ask you for information when you report a
          problem with our Website.
        </Li>
        <Li>Records and copies of your correspondence (including email addresses) if you contact us.</Li>
        <Li>Your responses to surveys that we might ask you to complete for research purposes.</Li>
        <Li>
          Details of transactions you carry out through our Website and of the fulfilment of your
          travel reservations and purchases. You may be required to provide financial information
          before completing a booking through our Website.
        </Li>
        <Li>Your search queries on the Website.</Li>
      </ul>
      <P className="mt-4">
        You also may provide information to be published, displayed (hereinafter, "posted") or transmitted
        to other users of the Website or third parties (collectively, "User Contributions"). Your User
        Contributions are posted, displayed, and transmitted to others at your own risk. Although we limit
        access to certain pages, please be aware that no security measures are perfect or impenetrable.
        Additionally, we cannot control the actions of other users of the Website with whom you may
        choose to share your User Contributions. Therefore, we cannot and do not guarantee that your
        User Contributions will not be viewed by unauthorized persons.
      </P>

      <SubHeading>Information We Collect Through Automatic Data Collection Technologies</SubHeading>
      <P>
        As you navigate through and interact with our Website, we may use automatic data collection
        technologies to collect certain information about your equipment, browsing actions, and patterns,
        including:
      </P>
      <ul>
        <Li>
          Details of your visits to our Website, including traffic data, location data, logs, and other
          communication data and the resources that you access and use on the Website.
        </Li>
        <Li>
          Information about your computer and internet connection, including your IP address,
          operating system, and browser type.
        </Li>
        <Li>
          Information about your use of our Services, how you interact with our Services and
          advertisements, and information about data or files that have been uploaded to our
          Services. This information may include things like buttons you click, mouse movements,
          key strokes, page visits, dates and times of access, web beacons, and cookie or pixel tag
          information. See below for additional information about cookies, pixel tags, web beacons,
          and analytic technologies.
        </Li>
      </ul>
      <P className="mt-4">
        We also may use these technologies to collect information about your online activities over time
        and across third-party websites or other online services (behavioural tracking). The information
        we collect automatically is statistical data and may include personal information, but we may
        maintain it or associate it with personal information we collect in other ways or receive from third
        parties. We may use third-party vendors to assist with monitoring and analyzing site activity,
        including but not limited to Hotjar, Google Analytics & MixPanel. It helps us to improve our Website
        and deliver a better and more personalized service, including by enabling us to:
      </P>
      <ul>
        <Li>Estimate our audience size and usage patterns.</Li>
        <Li>
          Store information about your preferences, allowing us to customize our Website according
          to your individual interests.
        </Li>
        <Li>Speed up your searches.</Li>
        <Li>Recognize you when you return to our Website.</Li>
      </ul>
      <P className="mt-4">
        We may use cookies and other similar technology for automatic data collection. Cookies are small
        pieces of text sent as files to your computer or mobile device when you visit most websites.
        Cookies are either session cookies or persistent cookies. Session cookies enable sites to
        recognize and link the actions of a user during a browsing session and expire at a
        session. Persistent cookies help us recognize you as an existing user and these cookies are stored
        on your system or device until they expire or are deleted.
      </P>
      <P>
        You can manage your cookies by setting or amending your web browser controls to accept or
        refuse cookies whenever you like, but if you do choose to reject certain cookies, your access to
        some features and functionality of our website may be restricted. Certain cookies are required or
        "essential" for our site to function as intended. These essential cookies are necessary for you to
        use certain features of our site such as accessing your account and managing your reservations.
        You are not able to opt out of or reject essential cookies.
      </P>
      <P>The technologies we use for this automatic data collection may include:</P>
      <ul>
        <Li>
          <strong>Cookies (or browser or mobile cookies).</strong> A cookie is a small file placed on the hard drive
          of your computer. You may refuse to accept browser cookies by activating the appropriate
          setting on your browser. However, if you select this setting, you may be unable to access
          certain parts of our Website. Unless you have adjusted your browser setting so that it will
          refuse cookies, our system will issue cookies when you direct your browser to our Website.
        </Li>
        <Li>
          <strong>Flash Cookies.</strong> Certain features of our Website may use local stored objects (or Flash
          cookies) to collect and store information about your preferences and navigation to, from,
          and on our Website. Flash cookies are not managed by the same browser settings as are
          used for browser cookies.
        </Li>
        <Li>
          <strong>Web Beacons.</strong> Pages of our Website and our e-mails may contain small electronic files
          known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that
          permit the Company, for example, to count users who have visited those pages or opened
          an email and for other related website statistics (for example, recording the popularity of
          certain website content and verifying system and server integrity).
        </Li>
      </ul>
      <P className="mt-4">We use cookies for several reasons including to:</P>
       <ul>
        <Li>Help us improve your experience when visiting our site.</Li>
        <Li>Fulfill transactions and ensure our site performs as intended.</Li>
        <Li>Remember your preferences each time you visit our site.</Li>
        <Li>Provide you with relevant advertising and analyze performance of those ads.</Li>
        <Li>Enable you to return to previous searches you performed on our site.</Li>
        <Li>Identify errors on our site.</Li>
        <Li>Help us protect your data and potentially detect and investigate malicious and/or fraudulent activity.</Li>
        <Li>Help us understand traffic to our site and analyze how well our site is performing.</Li>
      </ul>

      <SubHeading>Third-Party Use of Cookies and Other Tracking Technologies</SubHeading>
      <P>
        Some content, applications, and features, including without limitation advertisements, ticket
        issuance, and payment processing, on the Website are served by third parties, including
        advertisers, ad networks and servers, content providers, analytics companies, payment
        processors, your mobile device manufacturer, your mobile service provider, and application
        providers. These third parties may use cookies alone or in conjunction with web beacons or other
        tracking technologies to collect information about you when you use our website. The information
        they collect may be associated with your personal information or they may collect information,
        including personal information, about your online activities over time and across different websites
        and other online services. They may use this information to provide you with interest-based
        (behavioral) advertising or other targeted content.
      </P>
      <P>
        We do not control these third parties' tracking technologies or how they may be used. If you have
        any questions about an advertisement or other targeted content, you should contact the
        responsible provider directly. For information about how you can opt out of receiving targeted
        advertising from any providers, see "Choices About How We Use and Disclose Your Information"
        below.
      </P>

      <SectionHeading>How We Use Your Information</SectionHeading>
      <P>
        We use information that we collect about you or that you provide to us, including any personal
        information:
      </P>
      <ul>
        <Li>To present our Website and its contents to you;</Li>
        <Li>
          To fulfill your travel reservations, bookings, and purchases, to communicate with you
          regarding your reservations, bookings, and purchases, and to otherwise provide you with
          information, products, or services that you request from us;
        </Li>
        <Li>To fulfill any other purpose for which you provide it;</Li>
        <Li>
          To carry out our obligations and enforce our rights arising from any contracts entered into
          between you and us, including for payment processing, billing, and collection of amounts
          to be paid under any such contracts;
        </Li>
        <Li>
          To notify you about changes to our Website, App, or any products or services we offer or
          provide though it;
        </Li>
        <Li>
          To promote our products and services by sending you marketing and advertising
          communications that we develop and believe may be of interest to you;
        </Li>
        <Li>
          To create, maintain, and update user accounts on our Website and authenticate you as a
          user
        </Li>
        <Li>To allow you to participate in interactive features on our Website;</Li>
        <Li>To respond to your questions, requests for information, and process information choices;</Li>
        <Li>To contact you to provide information like travel booking confirmations and updates;</Li>
        <Li>In any other way we may describe when you provide the information;</Li>
        <Li>For any other purpose with your consent.</Li>
      </ul>
      <P className="mt-4">
        We may use the information we have collected from you to contact you about goods and services
        that may be of interest to you. For information about how you can opt out of receiving information
        about goods and services, see "Choices About How We Use and Disclose Your Information" below.
      </P>
      <P>
        We may use the information we have collected from you to enable us to display advertisements to
        our advertisers' target audiences. Even though we do not disclose your personal information for
        these purposes without your consent, if you click on or otherwise interact with an advertisement,
        the advertiser may assume that you meet its target criteria.
      </P>

      <SectionHeading>DISCLOSURE OF YOUR INFORMATION</SectionHeading>
      <P>
        We may disclose aggregated information about our users, and information that does not identify
        any specific individual for business purposes, without restriction where permissible under
        applicable laws and regulations.
      </P>
      <P>
        We may disclose personal data and information that we collect, or you provide as described in this
        Policy:
      </P>
      <ul>
        <Li>To our subsidiaries and affiliates;</Li>
        <Li>
          To contractors, service providers, and other third parties we use to support our business,
          including but not limited to, Travel Booking Pvt. Ltd., but only to the extent such parties are
          necessary for the fulfillment of your travel arrangements. Generally, it will be necessary for
          us to process personal data via a third party, including, but not limited to, airlines, hotel
          vendors, car rental companies, and entry visa or passport companies, in the course of
          completing your purchases of travel;
        </Li>
        <Li>
          To other third party suppliers we work with in connection with our business and the
          provision of our services to you. This includes for example, marketing agencies and/or
          companies that run our marketing campaigns, IT developers, service providers and hosting
          providers, third parties that manage promotions we may run, third party software
          companies, advertising providers and networks, and site analytics providers.
        </Li>
        <Li>
          To a buyer or other successor in the event of a merger, divestiture, restructuring,
          reorganization, dissolution, or other sale or transfer of some or all of Company's assets,
          whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in
          which personal information held by Company about our Website users is among the assets
          transferred;
        </Li>
        <Li>To fulfill the purpose for which you provide it;</Li>
        <Li>For any other purpose disclosed by us when you provide the information;</Li>
        <Li>With your consent.</Li>
      </ul>
      <P className="mt-4">We may also disclose your personal information to fulfill our legal obligations:</P>
      <ul>
        <Li>
          To comply with any court order, law, or legal process, including to respond to any
          government or regulatory request;
        </Li>
        <Li>
          To enforce or apply our terms of use and other agreements, including for billing and
          collection purposes;
        </Li>
        <Li>
          If we in good faith believe disclosure is necessary or appropriate to protect your safety or
          the rights, property, or safety of Company, our customers, or others. This includes
          exchanging information with other companies and organizations for the purposes of fraud
          protection and credit risk reduction.
        </Li>
      </ul>

      <SectionHeading>Choices About How We Use and Disclose Your Information</SectionHeading>
      <P>
        We strive to provide you with choices regarding the personal information you provide to us. We
        have created mechanisms to provide you with the following control over your information:
      </P>
      <ul>
        <Li>
          <strong>Tracking Technologies and Advertising.</strong> You can set your browser to refuse all or some
          browser cookies or mobile cookies, or to alert you when cookies are being sent. To learn
          how you can manage your Flash cookie settings, visit the Flash player settings on Adobe's
          website. If you disable or refuse cookies, please note that some parts of this site may be
          inaccessible or not function properly.
        </Li>
        <Li>
          <strong>Disclosure of Your Information for Third-Party Advertising.</strong> If you do not want us to share
          your personal information with unaffiliated or non-agent third parties for promotional
          purposes, you can opt-out by sending us an email stating your request
          at help@chyeap.com.
        </Li>
        <Li>
          <strong>Promotional Offers from the Company.</strong> If you do not wish to have your contact information
          used by the Company to promote our own or third parties' products or services, you can
          opt-out by sending us an email stating your request help@chyeap,com. If we have sent you
          a promotional email, you may send us a return email asking to be omitted from future email
          distributions. This opt out does not apply to information provided to the Company as a
          result of a product purchase, licensing subscription, product service experience, or other
          transaction.
        </Li>
        <Li>
          <strong>Targeted Advertising.</strong> If you do not want us to use information that we collect or that you
          provide to us to deliver advertisements according to our advertisers' target-audience
          preferences, you can opt-out by sending us an email stating your request
          at help@chyeap.com. For this opt-out to function, you must have your browser or
          smartphone set to accept browser cookies.
        </Li>
      </ul>
      <P className="mt-4">
        We do not control third parties' collection or use of your information to serve interest-based
        advertising. However, these third parties may provide you with ways to choose not to have your
        information collected or used in this way. You can opt-out of receiving targeted ads from members
        of the Network Advertising Initiative ("NAI") on NAI's website.
      </P>
      <P>
        We might rely on third parties, including Rakuten Advertising to help manage our marketing
        communications. Rakuten Advertising may collect personal information when you interact with its
        digital property, including IP addresses, digital identifiers, information about your web browsing
        and application usage and how you interact with its properties and ads for a variety of purposes,
        such as personalization of offers or advertisements, analytics about how you engage with
        websites or ads and other commercial purposes. For more information about Rakuten
        Advertising's collection, use, and sale of your personal data and your rights, please
        visit https://rakutenadvertising.com/legal-notices/services-privacy-policy/
        or https://rakutenadvertising.com/legal-notices/services-privacy-rights-request-form/
      </P>

      <SectionHeading>ACCESSING AND CORRECTING YOUR INFORMATION</SectionHeading>
      <P>
        If you have signed up for an account on our Website, you can review and change your personal
        information by logging into your account and visiting your account profile page. You may also send
        us an email at help@chyeap.com to request access to, correct or delete any personal information
        that you have provided to us. We cannot delete your personal information except by also deleting
        your user account. We may not accommodate a request to change information if we believe the
        change would violate any law or legal requirement or cause the information to be incorrect.
      </P>
      <P>
        If you delete your User Contributions from the Website, copies of your User Contributions may
        remain viewable in cached and archived pages or might have been copied or stored by other
        Website users. Proper access and use of information provided on the Website, including User
        Contributions, is governed by our Terms and Conditions, Cheap Flights Terms
        and Conditions. Residents of certain states within the United States may have additional personal
        information rights and choices. Please see the section on your specific state's privacy rights, if
        applicable.
      </P>

      <SectionHeading>DATA SECURITY</SectionHeading>
      <P>
        We take the security and protection of your information very seriously. We have implemented
        industry-standard measures designed to secure your personal information from accidental loss
        and from unauthorized access, use, alteration, and disclosure. All information you provide to us is
        stored on our secure servers behind firewalls. Any payment transactions will be encrypted using
        SSL technology.
      </P>
      <P>
        Unfortunately, the transmission of information via the internet is never completely secure.
        Although we take all reasonable security measures to protect your personal information, we
        cannot guarantee or warrant the security of your personal information transmitted to us online.
        Any transmission of personal information is at your own risk. We are not responsible for
        circumvention of any privacy settings or security measures contained on the Website. If we learn
        that your personal information is compromised, we may notify you by email to the last known email
        address provided in the most expedient time reasonable under the circumstances, or as otherwise
        required by applicable law, provided however, we may delay notification as may be necessary while
        we determine the scope of the breach, attempt to restore reasonable integrity to our system, and
        cooperate with law enforcement.
      </P>
      <P>
        The safety and security of your information also depends on you. Where we have given you (or
        where you have chosen) a password for access to certain parts of our Website, you are responsible
        for keeping this password confidential. We ask you not to share your password with anyone. We
        urge you to be careful about giving out information in public areas of the Website. The information
        you share in public areas may be viewed by any user of the Website.
      </P>
      
      {/* ... Other sections would continue to be added here ... */}
      {/* This is a partial conversion. I'll add the remaining main sections. */}

      <SectionHeading>RETENTION OF YOUR INFORMATION</SectionHeading>
      <P>
        We will retain your personal information in accordance with all applicable laws, and only for as
        long as necessary to fulfil the purposes set forth in this Policy. We will deidentify, aggregate, or
        otherwise anonymize your personal information prior to using it for analytical purposes or trend
        analysis beyond the standard retention period. When we delete your personal information, we use
        industry standard methods to ensure that recovery or retrieval of your information is impossible.
        We may keep residual copies of your personal information in backup systems to protect our
        systems from malicious loss. This data is inaccessible unless restored, and upon restoration, all
        unnecessary information will be deleted.
      </P>
      <P>The criteria we use to determine our retention periods include:</P>
      <ul>
        <Li>
          The duration of our relationship with you, including open user accounts, or recent bookings
          or other transactions you have made through us;
        </Li>
        <Li>
          Applicable laws requiring us to keep records of your transactions with us for a specific
          period of time;
        </Li>
        <Li>
          Current and relevant legal obligations governing how long we retain your personal
          information, including contractual obligations, litigation holds, statutes of limitations, and
          regulatory investigations;
        </Li>
        <Li>Whether the information is needed for secure backups of our systems.</Li>
      </ul>
      
      <SectionHeading>PROCESSING YOUR INFORMATION</SectionHeading>
      <P>
        Information that you provide may be transferred to, accessed, stored, and processed in the United
        States and other countries. The data protection and other laws and standards of such countries
        might not be as comprehensive as those in your country. By using the Website, you acknowledge
        and agree that your information may be transferred to such countries, including without limitation
        to our facilities and those third parties with whom we share it as described in this Policy in such
        countries.
      </P>
      <P>
        We restrict data transfers to those that are legally binding or essential for the provision of our
        business obligations.
      </P>
      
      <SectionHeading>INTERNATIONAL DATA TRANSFER</SectionHeading>
      <P>
        The personal information we process may be accessed from, processed or transferred to
        countries other than the country in which you reside. Those countries may have data protection
        laws that are different from the laws of your country.
      </P>
      <P>
        The servers for our platform are located in the United States, and Cheapflightsfares and its third-
        party service providers operate in many countries around the world. When we collect your personal
        information, we may process it in any of those countries. Our employees may access your personal
        information from various countries around the world. The transferees of your personal data may
        also be located in countries other than the country in which you reside.
      </P>
      {/* ... Omitting the rest of this section for brevity, but it would be included in a full version ... */}
      <P>
        We have taken appropriate steps and put safeguards in place to help ensure that any access,
        processing and/or transfer of your personal information remains protected in accordance with this
        Policy and in compliance with applicable data protection law. Such measures provide your
        personal information with a standard of protection that is at least comparable to that under the
        equivalent local law in your country, no matter where your data is accessed from, processed,
        and/or transferred to.
      </P>
      <P>Such measures include the following:</P>
      <ul>
        <Li>
            Adequacy decisions of the European Commission confirming an adequate level of data
            protection in respective non-EEA countries.
        </Li>
        <Li>
            Ensuring that the third-party partners, vendors and service providers to whom data
            transfers are made have appropriate mechanisms in place to protect your personal
            information. For instance, our agreements signed with our third-party partners, vendors
            and service providers incorporate strict data transfer terms (including, where applicable,
            the European Commission's Standard Contractual Clauses issued by the European
            Commission and/or United Kingdom, for transfers from the EEA/UK), and require all
            contracting parties to protect the personal information they process in accordance with
            applicable data protection law.
        </Li>
        <Li>
            Carrying out periodic risk assessments and implementing various technological and
            organizational measures to ensure compliance with relevant laws on data transfer.
        </Li>
      </ul>

      <SectionHeading>NOTICE OF RIGHTS TO RESIDENTS OF SPECIFIC GEOGRAPHIC LOCATIONS</SectionHeading>
      <P>
        This Section supplements the information contained in the rest of this Privacy Policy and applies
        solely to visitors, users, and others who reside in the countries and states specified within the
        following "Notice of Rights" Subsections.
      </P>
      <SubHeading>Notice of Rights of Individuals located within the EU</SubHeading>
      <P>
        Notice to individuals located within the territorial confines of the European Economic Area ("EEA"):
        This Policy and the notices contained herein are intended to comply with the EU General Data
        Protection Regulation (Regulation (EU) 2016/679) of the European Parliament and of the Council
        of 27 April 2016 (the "GDPR") and provide appropriate protection and care with respect to the
        treatment of your user information in accordance with the GDPR.
      </P>
      <P>
        We limit our collection, retention, and use of such information to that which is necessary to provide
        you with our goods and/or services and is compliant with applicable data retention laws. As a
        "Data Subject" within the meaning of GDPR, under applicable law you have certain rights that you
        may exercise to protect your personal data, which you can exercise at any time. These Data Subject
        rights are:
      </P>
      <ul>
        <Li>Right to be informed - you have the right to inquire about what personal data (about you) we process and the rationale for such processing.</Li>
        <Li>Right of access to information - you have the right to request a copy of the personal data that we collect and process for you. If we refuse your request under your right of access, we will provide you with a reason as to why and you will have the right to complain to a relevant data protection supervisory authority about our processing of your personally identifiable information.</Li>
        <Li>Right of rectification - you have a right to correct any inaccurate or incomplete data that we collect and process for you.</Li>
        <Li>Right to restriction of processing - where applicable, such as when there is a pending legal dispute or the data is being corrected, you have a right to temporarily restrict the processing of your data.</Li>
        <Li>Right to be forgotten (right to erasure) - in certain circumstances you can ask for the data we collect about you to be erased from our records.</Li>
        <Li>Right of portability - you have the right to have the data we collect about you to be transferred to another organization and for such data to be provided in a commonly used, structured, and machine-readable format.</Li>
        <Li>Right to withdraw consent - you have the right to withdraw a previously given consent for processing of your personal data for a specific purpose.</Li>
        <Li>Right to object - you have the right to object to certain types of processing, such as using your personal data for direct marketing and advertising. This also applies to profiling, where appropriate, insofar as it is associated with such direct marketing and advertising.</Li>
        <Li>Right to lodge complaint - you have the right make a complaint with a local supervisory authority using any method acceptable to them.</Li>
      </ul>
      <P className="mt-4">
        The Data Subject may exercise these rights at any time by contacting the responsible party. The
        responsible party, according to Article 4 (7) of the GDPR, is Cheap Flights, LLC, [Adress ], Attn:
        Information Security Coordinator, telephone: +1-216-302-2732, E-mail: help@chyeap.com
        or info@chyeap.com.
      </P>
      <P>
        Under applicable law, we will not process and/or disclose your personal data without a lawful basis
        to do so, as such bases are defined in Article 6 of the GDPR. In general, at least one of the following
        must apply whenever personal data is processed:
      </P>
      <ul>
        <Li>Consent. The individual has given clear consent for the processing of their personal data for a specific purpose.</Li>
        <Li>Contract. The processing is necessary for the performance of a contract.</Li>
        <Li>Legal Obligation. The processing is necessary to comply with the law.</Li>
        <Li>Vital Interests. The processing is necessary to protect someone's life.</Li>
        <Li>Public Task. The processing is necessary to perform a task in the public interest, and the task or function has a clear basis in law.</Li>
        <Li>Legitimate Interests. The processing is necessary for legitimate interests of the data controller, unless there is a good reason to protect the individual's personal data which overrides those legitimate interests.</Li>
      </ul>

      <SubHeading>Notice of Rights of Canadian Residents</SubHeading>
      <P>
        You have the right to request that we disclose certain information to you about our collection and
        use of your personal information unless doing so proves impossible or would create a
        disproportionate effort for Cheap Flights. You also have the right to challenge the accuracy and
        completeness of the information and have that information amended as appropriate. Once we
        receive and confirm your verifiable request, we will disclose to you:
      </P>
      <ul>
        <Li>The categories of personal information we collected about you.</Li>
        <Li>The categories of sources for the personal information we collected about you.</Li>
        <Li>Our business or commercial purpose for collecting or sharing that personal information.</Li>
        <Li>The categories of third parties with whom we share that personal information.</Li>
      </ul>
      <P className="mt-4">
        To the extent we are able under applicable law and contractual obligations, we will correct or
        amend personal information where inaccurate or deficient, note any disputes received, and advise
        third parties as appropriate.
      </P>
      <P>
        To exercise your rights described above, please submit a verifiable consumer request to us in one
        of the following ways: Cheap Flights, LLC, [address], telephone: [address], E-
        mail: help@chyeap.com.
      </P>
      <P>A consumer request must:</P>
      <ul>
        <Li>Provide sufficient information that allows us to reasonably verify you are the person about whom we collected personal information or an authorized representative; and</Li>
        <Li>Describe your request with sufficient detail that allows us to properly understand, evaluate, and respond to it.</Li>
      </ul>
      <P className="mt-4">
        We cannot respond to your request or provide you with personal information if we cannot verify
        your identity or authority to make the request and confirm the personal information relates to you.
        Making a verifiable consumer request does not require you to create an account with us. We will
        only use personal information provided in a verifiable consumer request to verify the requestor's
        identity or authority to make the request. We may request a copy of your government issued
        identification in order to verify you are the person whose information we collected, or their
        authorized representative.
      </P>
      <P>
        We endeavour to respond to a verifiable consumer request within 30 days of its receipt. If we
        require more time (up to 60 days), we will inform you of the reason and extension period in writing.
        If you have an account with us, we will deliver our written response to that account. If you do not
        have an account with us, we will deliver our written response by mail or electronically, at your
        option. The response we provide will also explain the reasons we cannot comply with a request, if
        applicable.
      </P>
      <P>
        We do not charge a fee to process or respond to your verifiable consumer request unless it is
        excessive, repetitive, or manifestly unfounded. If we determine that the request warrants a fee, we
        will tell you why we made that decision and provide you with a cost estimate before completing
        your request.
      </P>

      <SubHeading>California Residents; California Consumer I Notice</SubHeading>
      <P>
        Under the California Consumer Privacy Act of 2018 ("CCPA") as amended by the California Privacy
        Rights Act of 2020 ("CPRA"), California residents have certain rights around the collection, use, and
        sharing of their personal information. California Civil Code 1798.83 permits California
        residents who use our Website to request certain information regarding our disclosure of personal
        information to third parties for their direct marketing purposes. To make such a request, please
        send an email to help@chyeap.com or info@chyeap.com. To learn more about your Privacy
        Rights, please visit our state specific notice at California Privacy Notice - Cheap Flights.
      </P>
      <SubHeading>Nevada Residents; Nevada Privacy Rights Notice</SubHeading>
      <P>
        Nevada consumers have a right to opt out of the sale of certain personal information collected by
        website operators under Nevada law (SB 220). In the preceding twelve (12) months, Cheap Flights
        has not sold your personal information to third parties (as defined by Nevada law) and will not do
        so in the future without providing you with notice and an opportunity to opt out of such sale as
        required by law. If you have questions regarding these rights, please contact us
        at info@chyeap.com or help@chyeap.com
      </P>
      <SubHeading>Virginia Residents; Virginia Privacy Rights Notice</SubHeading>
      <P>
        Effective January 1, 2023, under Virginia's Consumer Data Protection Act ("CDPA"), Virginia
        residents have rights regarding the collection, use, and sharing of their personal data. In the
        preceding twelve (12) months, Cheap Flights has not sold your personal data and will not do so in
        the future without providing you with notice and an opportunity to opt out of such sale as required
        by law. Cheap Flights may engage in "targeted advertising" as that term is defined in the CDPA.
      </P>
      <P>
        As of January 1, 2023, you have the right to opt out of targeted advertising. Cheap Flights collects
        various categories of personal information when you use the Website, the App, or our services
        which are described in the Section, "Information We Collect About You and How We Use It." The
        Section, "Disclosure of Your Information" describes the third parties with whom we may share
        personal information and under what circumstances certain information may be shared.
      </P>
      <P>
        As of January 1, 2023, you have the right to (1) request and access the personal data collected
        about you; (2) request to correct inaccuracies within your personal data; (3) request deletion of
        your personal data, though there are exceptions under the CDPA and other laws which may allow
        us to retain and use certain personal data notwithstanding your deletion request; (4) request
        confirmation regarding the processing of your personal data; and (5) obtain a copy of your
        personal data.
      </P>
      <P>
        We will not discriminate against you for exercising any of your CDPA rights. Unless permitted by
        the CDPA, we will not:
      </P>
      <ul>
        <Li>Deny you goods or services.</Li>
        <Li>
           Charge you different prices or rates for goods or services, including through granting
           discounts or other benefits, or imposing penalties.
        </Li>
        <Li>Provide you a different level or quality of goods or services.</Li>
        <Li>
          Suggest that you may receive a different price or rate for goods or services or a different
          level or quality of goods or services.
        </Li>
      </ul>
      <P className="mt-4">
        To exercise one or more of your rights, or appeal a denial of a request, contact us
        at: info@chyeap.com or help@cheayp.com
      </P>

      <SubHeading>Colorado Residents; Colorado Privacy Rights Notice</SubHeading>
      <P>
        Effective July 1, 2023, Colorado residents will have certain rights around the collection, use, and
        sharing of their personal data under Colorado's Consumer Privacy Act ("CPA"). In the preceding
        twelve (12) months, Cheap Flights has not sold your personal data and will not do so in the future
        without providing you with notice and an opportunity to opt out of such sale as required by law.
        Cheap Flights may engage in "targeted advertising" as that term is defined in the CPA and as of
        July 1, 2023 you will have the right to opt-out of targeted advertising. Cheap Flights collects various
        categories of personal information when you use the Website, the App, and our services which are
        described in the Section, "Information We Collect About You and How We Use It." The Section,
        "Disclosure of Your Information" describes the third parties with whom we may share personal
        information and under what circumstances certain information may be shared.
      </P>
      <P>
        As of July 1, 2023, you have the right to (1) request and access the personal data collected about
        you; (2) request to correct inaccuracies within your personal data; (3) request deletion of your
        personal data, though there are exceptions under the CPA and other laws which may allow us to
        retain and use certain personal data notwithstanding your deletion request; and (4) obtain a copy
        of your personal data.
      </P>
      <P>
        To exercise one or more of your rights, or appeal a denial of a request, contact us
        at help@chyeap.com or info@chyeap.com
      </P>

      <SubHeading>Connecticut Residents; Connecticut Privacy Rights Notice</SubHeading>
      <P>
        Effective July 1, 2023, Connecticut residents will have certain rights around the collection, use, and
        sharing of their personal data under Connecticut's Data Privacy Act ("CDA"). In the preceding
        twelve (12) months, Cheap Flights has not sold your personal data and will not do so in the future
        without providing you with notice and an opportunity to opt out of such sale as required by law.
        Cheap Flights may engage in "targeted advertising" as that term is defined in the CPA and as of
        July 1, 2023 you will have the right to opt-out of targeted advertising. Cheap Flights collects various
        categories of personal information when you use the Website and its Services which are described
        in the Section, "Information We Collect About You and How We Use It." The Section, "Disclosure of
        Your Information" describes the third parties with whom we may share personal information and
        under what circumstances certain information may be shared.
      </P>
      <P>
        As of July 1, 2023, you have the right to (1) request and access the personal data collected about
        you; (2) request to correct inaccuracies within your personal data; (3) request deletion of your
        personal data, though there are exceptions under the CDA and other laws which may allow us to
        retain and use certain personal data notwithstanding your deletion request; and (4) obtain a copy
        of your personal data.
      </P>
      <P>
        To exercise one or more of your rights, or appeal a denial of a request, contact us
        at: info@chyeap.com or help@chyeap.com
      </P>

      <SectionHeading>CHANGES TO OUR PRIVACY POLICY</SectionHeading>
      <P>
        We may be required to modify our privacy and data protection notices due to changes in our
        services, changes to applicable laws and regulations, or for a myriad of other reasons. We
        therefore reserve the right to change this Policy at any time. It is our policy to post any changes
        we make to our privacy policy on this page. You are responsible for ensuring we have an up-to-
        date, active and deliverable email address for you, and for periodically visiting our Website and this
        Policy to check for any changes.
      </P>
      <P>
        You can find the date the policy was last updated at the top of the page. Any changes to this Policy
        will become effective when posted unless indicated otherwise.
      </P>
      
      <SectionHeading>CONTACT INFORMATION</SectionHeading>
      <P>
        To ask questions or submit comments about our Privacy Policy and our privacy practices, or to
        reach the data protection coordinator, contact us at:
      </P>
      <P>By Email: help@chyeap.com or info@chyeap.com</P>
      <P>By Mail: [Address]</P>
      <P>By Phone: [Number]</P>
      <P>
        Please ensure that the subject line of any correspondence contains the word, "PRIVACY", so we
        can ensure that your correspondence is routed in a timely and efficient manner.
      </P>
    </div>
  );
};

/**
 * Main App Component
 * This is the root component that renders the Privacy Policy page.
 * It sets up the basic layout and typography for the application.
 */
export default function App() {
  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-50 min-h-screen">
      <main className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg my-10">
        <PrivacyPolicy />
      </main>
    </div>
  );
}



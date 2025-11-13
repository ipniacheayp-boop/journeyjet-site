import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  const mainRef = useRef<HTMLElement | null>(null);

  // Set meta + title
  useEffect(() => {
    document.title = "Terms & Conditions | Chyeap - Travel Booking Terms of Service";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Read Chyeap's terms and conditions for booking flights, hotels, and travel services. Understand your rights and responsibilities when using our travel platform."
      );
    }
  }, []);

  // Ensure content is pushed below the header (works if header is fixed/sticky)
  useEffect(() => {
    function updateTopPadding() {
      const hdr = document.querySelector("header");
      if (!mainRef.current) return;
      if (hdr) {
        const h = Math.ceil(hdr.getBoundingClientRect().height);
        mainRef.current.style.paddingTop = `${h + 16}px`; // +16 for small breathing room
      } else {
        // fallback
        mainRef.current.style.paddingTop = "";
      }
    }

    // initial set and on resize
    updateTopPadding();
    window.addEventListener("resize", updateTopPadding);
    // in case header content loads late (images / fonts) update after a tick
    const t = setTimeout(updateTopPadding, 300);

    return () => {
      window.removeEventListener("resize", updateTopPadding);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* main has a fallback pt-24 so content isn't hidden before JS runs */}
      <main ref={mainRef} className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <article className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <header className="mb-12 text-center border-b border-border pb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Terms & Conditions
              </h1>
              <p className="text-sm text-muted-foreground">Last Updated: October 7, 2025</p>
            </header>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The website — <a href="https://www.chyeap.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.chyeap.com</a> — is solely designed to serve and assist customers across the globe in planning their travel itineraries. By using the website for all your travel needs, you agree to adhere to the terms and conditions mentioned herein. These terms and conditions are attributed to all sorts of travel related transactions taking place on the website and are in compliance with the legal obligations.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  These terms of use are entered into by and between you and Cheap Flights. The following terms and conditions, together with any documents they expressly incorporate by reference (collectively, these "Terms of Use"), govern your access to and use of Cheap Flights along with the Company's mobile website and mobile and tablet applications (the "App"), including any content, functionality and services offered on or through <a href="https://www.chyeap.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.chyeap.com</a>, the Company's mobile website and mobile and tablet applications (collectively, the "Website"), whether as a guest or a registered user. The Website is provided solely to assist you in gathering travel information, determining the availability of travel, related goods and services, making legitimate reservations or otherwise transacting business with travel suppliers, and for no other purpose.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Please read the Terms of Use carefully before you start to use the Website. By using the Website or by clicking to accept or agree to the Terms of Use when this option is made available to you, you accept and agree to be bound and abide by these Terms of Use and our Privacy Policy, found at <a href="https://www.chyeap.com/privacy-policy" className="text-primary hover:underline">https://www.chyeap.com/privacy-policy</a>, incorporated herein by reference. If you do not want to agree to these Terms of Use or the Privacy Policy, you must not access or use the Website.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  This Website is offered and available to users who are 18 years of age or older, and reside in the United States or any of its territories or possessions or Canada. By using this Website, you represent and warrant that you meet all of the foregoing eligibility requirements. If you do not meet all of these requirements, you must not access or use the Website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">User Representation</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">By using the website you imply that:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>You are 18 years of age or older.</li>
                  <li>You possess the legal authority to create a binding legal obligation.</li>
                  <li>All information provided by you on the website is true, accurate and complete.</li>
                  <li>Your use of this website is limited but not restricted to making or managing travel reservation for yourself or on behalf of someone.</li>
                  <li>Cheap Flights LLC reserves the right to request documentation for any reservation that requires further validation from the card holder. Cancellation may happen, if the requested documents are not provided.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to the Terms of Use</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  We may revise and update these Terms of Use from time to time in our sole discretion. All changes are effective immediately when we post them, and apply to all access to and use of the Website thereafter. Your continued use of the Website following the posting of revised Terms of Use means that you accept and agree to the changes. You are expected to check this page each time you access the Website so you are aware of any changes, as they are binding on you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">License Grant Specifically for App</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">Subject to these Terms of Use, the Company grants you a limited, non-exclusive and nontransferable license to:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Download, install, and use the App for your personal, non-commercial use on a single mobile device owned or otherwise controlled by you strictly in accordance with any documentation provided and amended by us from time to time in our sole discretion.</li>
                  <li>Access, stream, download, and use on such mobile device the content and services made available in or otherwise accessible through the Application, strictly in accordance with the Terms of Use applicable to such content and services.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You acknowledge and agree that the App is provided under license, and not sold, to you. You do not acquire any ownership interest in the App, or any other rights thereto other than to use the App in accordance with the license granted, and subject to all terms, conditions, and restrictions, under these Terms of Use. The Company and its licensors and service providers reserve and shall retain their entire right, title, and interest in and to the App, including all copyrights, trademarks, and other intellectual property rights therein or relating thereto, except as expressly granted to you in these Terms of Use.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Updates Specifically for App</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The Company may from time to time in its sole discretion develop and provide App updates, which may include upgrades, bug fixes, patches, other error corrections, and/or new features (collectively, including related documentation, "Updates"). Updates may also modify or delete in their entirety certain features and functionality. You agree that the Company has no obligation to provide any Updates or to continue to provide or enable any particular features or functionality.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">Based on your mobile device settings, when your mobile device is connected to the internet:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>The App may automatically download and install all available Updates.</li>
                  <li>You may receive notice of or be prompted to download and install available Updates.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You shall promptly download and install all Updates, and you acknowledge and agree that the App or portions thereof may not properly operate should you fail to do so. You further agree that all Updates will be deemed part of the App and be subject to these Terms of Use.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Export Regulation and U.S. Government Rights Specific to the App</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The App may be subject to United States export control laws, including the U.S. Export Administration Act and its associated regulations. You shall not, directly or indirectly, export, re-export, or release the App to, or make the App accessible from, any jurisdiction or country to which export, re-export, release, or use is prohibited by law, rule, or regulation. You shall comply with all applicable federal laws, regulations, and rules, and complete all required undertakings (including obtaining any necessary export license or other governmental approval), prior to using, exporting, re-exporting, releasing, or otherwise making the App available outside the United States.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The App is commercial computer software, as such term is defined in 48 C.F.R. §2.101. Accordingly, if you are an agency of the U.S. Government or any contractor therefor, you receive only those rights with respect to the App as are granted to all other end users under license, in accordance with (a) 48 C.F.R. §227.7201 through 48 C.F.R. §227.7202-4, with respect to the Department of Defense and their contractors, or (b) 48 C.F.R. §12.212, with respect to all other U.S. Government licensees and their contractors.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Accessing the Website and Account Security</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  We reserve the right to withdraw or amend this Website, and any service or material we provide on or through the Website, in our sole discretion without notice. We will not be liable if for any reason, all or any part of the Website is unavailable at any time or for any period. From time to time, we may restrict access to some parts of the Website, or the entire Website, to users, including registered users.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Making all arrangements necessary for you to have access to the Website.</li>
                  <li>Ensuring that all persons who access the Website through your internet connection are aware of these Terms of Use and comply with them.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  To access the Website or some of the resources it offers, you may be asked to provide certain registration details or other information. It is a condition of your use of the Website that all the information you provide on the Website is correct, current and complete. You agree that all information you provide to register with this Website or otherwise, including but not limited to through the use of any interactive features on the Website, is governed by our Privacy Policy, and you consent to all actions we take with respect to your information consistent with our Privacy Policy.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  If you choose, or are provided with, a user name, password or any other piece of information as part of our security procedures, you must treat such information as confidential, and you must not disclose it to any other person or entity. You also acknowledge that your account is personal to you and agree not to provide any other person with access to this Website or portions of it using your user name, password or other security information. You agree to notify us immediately of any unauthorized access to or use of your username or password or any other breach of security. You also agree to ensure that you exit from your account at the end of each session. You should use particular caution when accessing your account from a public or shared computer so that others are not able to view or record your password or other personal information.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  We have the right to disable any username, password or other identifier, whether chosen by you or provided by us, at any time in our sole discretion for any or no reason, including if, in our opinion, you have violated any provision of these Terms of Use.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property Rights</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The Website and its entire contents, features and functionality (including but not limited to all information, software, text, displays, images, video and audio, and the design, selection and arrangement thereof), are owned by the Company, its licensors or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret and other intellectual property or proprietary rights laws.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  These Terms of Use permit you to use the Website for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store or transmit any of the material on our Website, except as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.</li>
                  <li>You may store files that are automatically cached by your Web browser for display enhancement purposes.</li>
                  <li>You may print one copy of a reasonable number of pages of the Website for your own personal, non-commercial use and not for further reproduction, publication or distribution.</li>
                  <li>If we provide desktop, mobile or other applications for download, you may download a single copy to your computer or mobile device solely for your own personal, non-commercial use, provided you agree to be bound by our end user license agreement for such applications.</li>
                  <li>If we provide social media features with certain content, you may take such actions as are enabled by such features.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">You must not:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Modify copies of any materials from this site.</li>
                  <li>Use any illustrations, photographs, video or audio sequences or any graphics separately from the accompanying text.</li>
                  <li>Delete or alter any copyright, trademark or other proprietary rights notices from copies of materials from this site.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You must not access or use for any commercial purposes any part of the Website or any services or materials available through the Website. If you wish to make any use of material on the Website other than that set out in this section, please address your request to: <a href="mailto:help@chyeap.com" className="text-primary hover:underline">help@chyeap.com</a>
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  If you print, copy, modify, download or otherwise use or provide any other person with access to any part of the Website in breach of the Terms of Use, your right to use the Website will cease immediately and you must, at our option, return or destroy any copies of the materials you have made. No right, title or interest in or to the Website or any content on or obtained through the Website is transferred to you, and all rights not expressly granted are reserved by the Company. Any use of the Website not expressly permitted by these Terms of Use is a breach of these Terms of Use and may violate copyright, trademark and other laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Trademarks</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The Company name, certain terms, the Company logo and all related names, logos, product and service names, designs and slogans are trademarks of the Company or its affiliates or licensors or other third parties. You must not use such marks without the prior written permission of the Company. All other names, logos, product and service names, designs and slogans on this Website are the trademarks of their respective owners.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Prohibited Uses</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You may use the Website only for lawful purposes and in accordance with these Terms of Use. We reserve the right to revoke your access to the Website and any of our services, products, content, or properties at any time. If it is determined or suspected by us in our sole discretion that you are misusing or attempting to misuse or circumvent our Website, or are using or attempting to use our Website for any inappropriate or non-personal use, by engaging in any of the Prohibited Uses contained herein, we reserve the right to immediately terminate your access without notice and to initiate without notice available legal actions or proceedings to seek appropriate remedies and/or damages, including but not limited to lost revenue, repairs, legal fees, costs and expenses, and to seek injunctions or other equitable remedies.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The following are considered Prohibited Uses. You acknowledge that a violation of any of the following could result in significant damages to the Company, and you agree you are liable to the Company for any such damages, and you will indemnify the Company in the event of any claims against the Company based on or arising from your violation of any of the following.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">You agree not to use the Website:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>In any way that violates any applicable federal, state, local or international law or regulation (including, without limitation, any laws regarding the export of data or software to and from the US or other countries).</li>
                  <li>For the purpose of exploiting, harming or attempting to exploit or harm minors in any way by exposing them to inappropriate content, asking for personally identifiable information or otherwise.</li>
                  <li>To send, knowingly receive, upload, download, use or re-use any material which does not comply with the Content Standards set out in these Terms of Use.</li>
                  <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter" or "spam" or any other similar solicitation.</li>
                  <li>To impersonate or attempt to impersonate the Company, a Company employee, another user or any other person or entity (including, without limitation, by using e-mail addresses or user names associated with any of the foregoing).</li>
                  <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Website, or which, as determined by us, may harm the Company or users of the Website or expose them to liability.</li>
                  <li>To recreate or compete with the Company or to solicit or harass the Company or any of its third-party partners.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">Additionally, you agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Use the Website in any manner that could disable, overburden, damage, or impair the site or interfere with any other party's use of the Website, including their ability to engage in real time activities through the Website.</li>
                  <li>Use any robot, spider or other automatic device, process or means to access the Website for any purpose, including monitoring or copying any of the material on the Website.</li>
                  <li>Use any manual process to monitor or copy any of the material on the Website or for any other unauthorized purpose without our prior written consent.</li>
                  <li>Use any device, software or routine that interferes with the proper working of the Website.</li>
                  <li>Introduce any viruses, trojan horses, worms, logic bombs or other material which is malicious or technologically harmful.</li>
                  <li>Attempt to gain unauthorized access to, interfere with, damage or disrupt any parts of the Website, the server on which the Website is stored, or any server, computer or database connected to the Website.</li>
                  <li>Attack the Website via a denial-of-service attack or a distributed denial-of-service attack.</li>
                  <li>Otherwise attempt to interfere with the proper working of the Website.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">User Contributions</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The Website may contain message boards, chat rooms, personal web pages or profiles, forums, bulletin boards and other interactive features (collectively, "Interactive Services") that allow users to post, submit, publish, display or transmit to other users or other persons (hereinafter, "post") content or materials (collectively, "User Contributions") on or through the Website. All User Contributions must comply with the Content Standards set out in these Terms of Use.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Any User Contribution you post to the site will be considered non-confidential and non-proprietary. By providing any User Contribution on the Website, you grant us and our affiliates and service providers, and each of their and our respective licensees, successors and assigns the right to use, reproduce, modify, perform, display, distribute and otherwise disclose to third parties any such material for any purpose.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">You represent and warrant that:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>You own or control all rights in and to the User Contributions and have the right to grant the license granted above to us and our affiliates and service providers, and each of their and our respective licensees, successors and assigns.</li>
                  <li>All of your User Contributions do and will comply with these Terms of Use.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You understand and acknowledge that you are responsible for any User Contributions you submit or contribute, and you, not the Company, have full responsibility for such content, including its legality, reliability, accuracy and appropriateness. We are not responsible, or liable to any third party, for the content or accuracy of any User Contributions posted by you or any other user of the Website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Monitoring and Enforcement: Termination</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">We have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Remove or refuse to post any User Contributions for any or no reason in our sole discretion.</li>
                  <li>Take any action with respect to any User Contribution that we deem necessary or appropriate in our sole discretion, including if we believe that such User Contribution violates the Terms of Use, including the Content Standards, infringes any intellectual property right or other right of any person or entity, threatens the personal safety of users of the Website or the public or could create liability for the Company.</li>
                  <li>Disclose your identity or other information about you to any third party who claims that material posted by you violates their rights, including their intellectual property rights or their right to privacy.</li>
                  <li>Take appropriate legal action, including without limitation, referral to law enforcement, for any illegal or unauthorized use of the Website.</li>
                  <li>Terminate or suspend your access to all or part of the Website for any or no reason, including without limitation, any violation of these Terms of Use.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Without limiting the foregoing, we have the right to fully cooperate with any law enforcement authorities or court order requesting or directing us to disclose the identity or other information of anyone posting any materials on or through the Website. YOU WAIVE AND HOLD HARMLESS THE COMPANY AND ITS AFFILIATES, LICENSEES AND SERVICE PROVIDERS FROM ANY CLAIMS RESULTING FROM ANY ACTION TAKEN BY ANY OF THE FOREGOING PARTIES DURING OR AS A RESULT OF ITS INVESTIGATIONS AND FROM ANY ACTIONS TAKEN AS A CONSEQUENCE OF INVESTIGATIONS BY EITHER SUCH PARTIES OR LAW ENFORCEMENT AUTHORITIES.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  We do not undertake the responsibility to review material before it is posted on the Website, and cannot ensure prompt removal of objectionable material after it has been posted. Accordingly, we assume no liability for any action or inaction regarding transmissions, communications or content provided by any user or third party. We have no liability or responsibility to anyone for performance or nonperformance of the activities described in this section.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Content Standards</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  These content standards apply to any and all User Contributions and use of Interactive Services. User Contributions must in their entirety comply with all applicable federal, state, local and international laws and regulations. Without limiting the foregoing, User Contributions must not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Contain any material which is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory or otherwise objectionable.</li>
                  <li>Promote sexually explicit or pornographic material, violence, or discrimination based on race, sex, religion, nationality, disability, sexual orientation or age.</li>
                  <li>Infringe any patent, trademark, trade secret, copyright or other intellectual property or other rights of any other person.</li>
                  <li>Violate the legal rights (including the rights of publicity and privacy) of others or contain any material that could give rise to any civil or criminal liability under applicable laws or regulations or that otherwise may be in conflict with these Terms of Use and our Privacy Policy.</li>
                  <li>Be likely to deceive any person.</li>
                  <li>Promote any illegal activity, or advocate, promote or assist any unlawful act.</li>
                  <li>Cause annoyance, inconvenience or needless anxiety or be likely to upset, embarrass, alarm or annoy any other person.</li>
                  <li>Impersonate any person, or misrepresent your identity or affiliation with any person or organization.</li>
                  <li>Involve commercial activities or sales, such as contests, sweepstakes and other sales promotions, barter or advertising.</li>
                  <li>Give the impression that they emanate from or are endorsed by us or any other person or entity, if this is not the case.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Copyright Infringement</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  If you believe that any User Contributions violate your copyright, please send us a notice of copyright infringement to <a href="mailto:help@chyeap.com" className="text-primary hover:underline">help@chyeap.com</a>. It is the policy of the Company to terminate the user accounts of repeat infringers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Reliance on Information Posted</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The information presented on or through the Website is made available solely for general information purposes. WE DO NOT WARRANT THE ACCURACY, COMPLETENESS OR USEFULNESS OF THIS INFORMATION. ANY RELIANCE YOU PLACE ON SUCH INFORMATION IS STRICTLY AT YOUR OWN RISK. WE DISCLAIM ALL LIABILITY AND RESPONSIBILITY ARISING FROM ANY RELIANCE PLACED ON SUCH MATERIALS BY YOU OR ANY OTHER VISITOR TO THE WEBSITE, OR BY ANYONE WHO MAY BE INFORMED OF ANY OF ITS CONTENTS.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  This Website includes content provided by third parties, including materials provided by other users, bloggers and third-party licensors, syndicators, aggregators and/or reporting services. All statements and/or opinions expressed in these materials, and all articles and responses to questions and other content, other than the content provided by the Company, are solely the opinions and the responsibility of the person or entity providing those materials. These materials do not necessarily reflect the opinion of the Company. We are not responsible, or liable to you or any third party, for the content or accuracy of any materials provided by any third parties.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to the Website</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  We may update the content on this Website from time to time, but its content is not necessarily complete or up-to-date. Any of the material on the Website may be out of date at any given time, and we are under no obligation to update such material.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Information about You and Your Visits to the Website</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  All information we collect on this Website is subject to our Privacy Policy. By using the Website, you consent to all actions taken by us with respect to your information in compliance with the Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Information You Provide/Telephone Consumer Protection Act Consent</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Upon using the Website, you will be prompted to disclose certain information about yourself, and you will be able to store information on our Website. Some of this information will be sent to our Travel Service Providers who will need this information to respond to your request for services. By providing this information to us, or by submitting a request, you are requesting and expressly consenting to be contacted by us and by our Travel Service Providers via phone, fax, email, mail, text (SMS) messaging, push notifications, or other reasonable means of communication, at any of your contact numbers or addresses irrespective of whether you are listed on any federal, state, or local "Do Not Call" lists or registries for the purposes of providing Services, servicing your account, reasonably addressing matters pertaining to your account, or for other purposes reasonably related to your services request and our business, including marketing-related contact.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You also authorize us to send you automated and/or prerecorded calls regarding our Services and your service requests, along with calls from Travel Service Providers that can help you with your request to any landline or mobile phone number you provided. You consent to Cheap Flights and the Travel Service Provider's use of automated phone technology including auto-dialed and prerecorded messages to communicate with you concerning your account or use of the Services, updates concerning new and existing features on the Website, and communications concerning promotions run by us. If a contact number you have provided to us is no longer your number, you agree to notify us promptly that you can no longer be reached at that number.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You represent that you have received, and are authorized to convey to us, the consent of any authorized users on your account to be contacted by us as described in this Section. You agree that all consents provided in this Section will survive the cancellation of your account. You also acknowledge that Cheap Flights or the Travel Service Providers may record customer service calls after notice to you and with your consent, in order to assist you when you contact customer support services. For complete details on our use of your information, please see our <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  TO KNOWINGLY INPUT FALSE INFORMATION, INCLUDING BUT NOT LIMITED TO NAME, PHONE NUMBER, ADDRESS OR E-MAIL ADDRESS IS A VERY SERIOUS AND FRAUDULENT MATTER THAT COULD RESULT IN SIGNIFICANT COSTS AND DAMAGES INCLUDING INVASION OF PRIVACY RIGHTS, TO CHEAP FLIGHTS AND THE TRAVEL SERVICE PROVIDERS, AND TO CONSUMERS, AS WELL AS THE LOSS OF TIME, EFFORT AND EXPENSE RESPONDING TO AND PURSUING SUCH FALSE INFORMATION AND REQUEST, AND FURTHER, COULD RESULT IN REGULATORY FINES AND PENALTIES. ACCORDINGLY, IF YOU KNOWINGLY INPUT FALSE INFORMATION IN A REQUEST, INCLUDING BUT NOT LIMITED TO SOMEONE ELSE'S NAME, E-MAIL ADDRESS, PHYSICAL ADDRESS, OR PHONE NUMBER OR A RANDOM OR MADE-UP NAME, ADDRESS, E-MAIL, OR PHONE NUMBER, YOU AGREE TO FULLY INDEMNIFY AND BE LIABLE TO CHEAP FLIGHTS AND EACH TRAVEL SERVICE PROVIDER WHO ACCEPTS SUCH REQUESTS.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Online Purchases and Other Terms and Conditions</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  All purchases through our Website or other transactions for the sale of services or information formed through the Website or as a result of visits made by you are governed by our Terms of Sale, which are hereby incorporated into these Terms of Use.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Additional terms and conditions may also apply to specific portions, services or features of the Website. All such additional terms and conditions are hereby incorporated by this reference into these Terms of Use.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Linking to the Website and Social Media Features</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You may link to our homepage, provided you do so in a way that is fair and legal and does not damage our reputation or take advantage of it, but you must not establish a link in such a way as to suggest any form of association, approval or endorsement on our part.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">This Website may provide certain social media features that enable you to:</p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Link from your own or certain third-party websites to certain content on this Website.</li>
                  <li>Send e-mails or other communications with certain content, or links to certain content, on this Website.</li>
                  <li>Cause limited portions of content on this Website to be displayed or appear to be displayed on your own or certain third-party websites.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You may use these features solely as they are provided by us, solely with respect to the content they are displayed with and otherwise in accordance with any additional terms and conditions we provide with respect to such features. Subject to the foregoing, you must not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Establish a link from any website that is not owned by you.</li>
                  <li>Cause the Website or portions of it to be displayed, or appear to be displayed by, for example, framing, deep linking or in-line linking, on any other site.</li>
                  <li>Link to any part of the Website other than the homepage.</li>
                  <li>Otherwise take any action with respect to the materials on this Website that is inconsistent with any other provision of these Terms of Use.</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The website from which you are linking, or on which you make certain content accessible, must comply in all respects with the Content Standards set out in these Terms of Use. You agree to cooperate with us in causing any unauthorized framing or linking immediately to cease. We reserve the right to withdraw linking permission without notice. We may disable all or any social media features and any links at any time without notice in our discretion.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Links from the Website</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  If the Website contains links to other sites and resources provided by third parties, these links are provided for your convenience only. This includes links contained in advertisements, including banner advertisements and sponsored links. WE HAVE NO CONTROL OVER THE CONTENTS OF THOSE SITES OR RESOURCES, AND ACCEPT NO RESPONSIBILITY FOR THEM OR FOR ANY LOSS OR DAMAGE THAT MAY ARISE FROM YOUR USE OF THEM. IF YOU DECIDE TO ACCESS ANY OF THE THIRD PARTY WEBSITES LINKED TO THIS WEBSITE, YOU DO SO ENTIRELY AT YOUR OWN RISK AND SUBJECT TO THE TERMS AND CONDITIONS OF USE FOR SUCH WEBSITES.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Geographic Restrictions</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The owner of the Website is based in the state of New Jersey in the United States of America. We provide this Website for use only by persons located in the United States of America and Canada. We make no claims that the Website or any of its content is accessible or appropriate outside of the United States of America. Access to the Website may not be legal by certain persons or in certain countries. If you access the Website from outside the United States of America, you do so on your own initiative and are responsible for compliance with local laws. If you are a resident in a country other than the United States of America or Canada, you must not transact business with or through the Website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">No Agency Relationship</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The Company does not agree to act as your agent or fiduciary in providing services through the Website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Third Parties</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  If you use the Website to submit requests for or on behalf of a third-party such as a family member or a traveling companion, you are responsible for any error in the accuracy of information provided in connection with such use; including, but not limited to, the billing address and phone number of the credit card holder. These should match what is on file with their financial institution. In addition, you must inform the third-party of all terms and conditions (including these Terms of Use) applicable to all products or services acquired through this website including all rules and restrictions applicable thereto.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  If you are using this Website for or on behalf of a third-party, you agree to indemnify and hold each Covered Party harmless from and against any and all liabilities, losses, damages, suits and claims (including the costs of defense), relating to the third-party's or your failure to fulfill any of its obligations as described above. You are directly responsible for any request submitted including for total charges and performance obligations. You acknowledge that in no event will Company be required to refund any amounts.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimer of Warranties</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You understand that we cannot and do not guarantee or warrant that files or other information available for downloading from the internet or the Website will be free of viruses or other destructive code. You are responsible for implementing sufficient procedures and checkpoints to satisfy your particular requirements for anti-virus protection and accuracy of data input and output, and for maintaining a means external to our site for any reconstruction of any lost data.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, WE WILL NOT BE LIABLE FOR ANY LOSS OR DAMAGE CAUSED BY A DISTRIBUTED DENIAL-OF-SERVICE ATTACK, VIRUSES OR OTHER TECHNOLOGICALLY HARMFUL MATERIAL THAT MAY INFECT YOUR COMPUTER EQUIPMENT, COMPUTER PROGRAMS, DATA OR OTHER PROPRIETARY MATERIAL DUE TO YOUR USE OF THE WEBSITE OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE WEBSITE OR TO YOUR DOWNLOADING OF ANY MATERIAL POSTED ON IT, OR ON ANY WEBSITE LINKED TO IT.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  YOUR USE OF THE WEBSITE, ITS CONTENT AND ANY SERVICES OR ITEMS OBTAINED THROUGH THE WEBSITE IS AT YOUR OWN RISK. THE WEBSITE, ITS CONTENT AND ANY SERVICES OR ITEMS OBTAINED THROUGH THE WEBSITE ARE PROVIDED OR OTHERWISE MADE AVAILABLE ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. NEITHER THE COMPANY NOR ANY PERSON ASSOCIATED WITH THE COMPANY MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY OR AVAILABILITY OF THE WEBSITE.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  WITHOUT LIMITING THE FOREGOING, NEITHER THE COMPANY NOR ANYONE ASSOCIATED WITH THE COMPANY REPRESENTS OR WARRANTS THAT THE WEBSITE, ITS CONTENT OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE WEBSITE WILL BE SUITABLE, AVAILABLE, ACCURATE, RELIABLE, COMPLETE, ERROR-FREE OR UNINTERRUPTED, THAT DEFECTS WILL BE CORRECTED, THAT OUR WEBSITE OR THE SERVER THAT MAKES IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS OR THAT THE WEBSITE OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE WEBSITE WILL OTHERWISE MEET YOUR NEEDS OR EXPECTATIONS.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  THE COMPANY IS NOT RESPONSIBLE FOR ANY FAILURES CAUSED BY SERVER ERRORS, MISDIRECTED TRANSMISSIONS, FAILED INTERNET CONNECTIONS, INTERRUPTIONS IN THE TRANSMISSION OR RECEIPT OF TICKET ORDERS OR, ANY COMPUTER VIRUS OR OTHER TECHNICAL DEFECT, WHETHER HUMAN OR TECHNICAL IN NATURE. THE COMPANY HEREBY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, STATUTORY OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT AND FITNESS FOR PARTICULAR PURPOSE. THE FOREGOING DOES NOT AFFECT ANY WARRANTIES WHICH CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation on Liability</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  TO THE EXTENT PERMITTED BY LAW AND NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, IN NO EVENT WILL THE COMPANY, ITS AFFILIATES OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS OR DIRECTORS (EACH A "COVERED PARTY" AND COLLECTIVELY, THE "COVERED PARTIES") BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE WEBSITE, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE WEBSITE OR SUCH OTHER WEBSITES OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE WEBSITE OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, PERSONAL INJURY, PAIN AND SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS OF USE, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT OR OTHERWISE, EVEN IF FORESEEABLE.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  THE FOREGOING DOES NOT AFFECT ANY LIABILITY WHICH CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Indemnification</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  You agree to defend, indemnify and hold harmless the Company, its affiliates, licensors and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms of Use or your use of the Website, including, but not limited to, your User Contributions, any use of the Website's content, services and products other than as expressly authorized in these Terms of Use or your use of any information obtained from the Website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law and Jurisdiction</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  All matters relating to the Website and these Terms of Use and any dispute or claim arising therefrom or related thereto (in each case, including non-contractual disputes or claims), shall be governed by and construed in accordance with the internal laws of the State of New Jersey without giving effect to any choice or conflict of law provision or rule (whether of the State of New Jersey or any other jurisdiction).
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Any legal suit, action or proceeding arising out of, or related to, these Terms of Use or the Website shall be instituted exclusively in the federal courts of the United States or the courts of the State of New Jersey in each case located in the City of Newark and County of Essex although we retain the right to bring any suit, action or proceeding against you for breach of these Terms of Use in your country of residence or any other relevant country. You waive any and all objections to the exercise of jurisdiction over you by such courts and to venue in such courts.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Arbitration</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  At Company's sole discretion, it may require You to submit any disputes arising from the use of these Terms of Use or the Website, including disputes arising from or concerning their interpretation, violation, invalidity, non-performance, or termination, to final and binding arbitration under the Rules of Arbitration of the American Arbitration Association applying New Jersey law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation on Time to File Claims</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  ANY CAUSE OF ACTION OR CLAIM YOU MAY HAVE ARISING OUT OF OR RELATING TO THESE TERMS OF USE OR THE WEBSITE MUST BE COMMENCED WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION ACCRUES, OTHERWISE, SUCH CAUSE OF ACTION OR CLAIM IS PERMANENTLY BARRED.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Waiver and Severability</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  No waiver by the Company of any term or condition set forth in these Terms of Use shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of the Company to assert a right or provision under these Terms of Use shall not constitute a waiver of such right or provision.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  If any provision of these Terms of Use is held by a court or other tribunal of competent jurisdiction to be invalid, illegal or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of the Terms of Use will continue in full force and effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Entire Agreement</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The Terms of Use, our Privacy Policy and our Terms of Sale constitute the sole and entire agreement between you and Cheap Flights LLC with respect to the Website and supersede all prior and contemporaneous understandings, agreements, representations and warranties, both written and oral, with respect to the Website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Your Comments and Concerns</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  This website is operated by Cheap Flights LLC, 1028 Broad St, Newark, NJ 07102.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  All other feedback, comments, requests for technical support and other communications relating to the Website should be directed to: <a href="mailto:help@chyeap.com" className="text-primary hover:underline">help@chyeap.com</a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Additional Terms for Specific Services</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Flight Booking Terms</h3>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  All flight bookings are subject to availability and confirmation by the airline. Prices displayed on our website are dynamic and may change without notice. We recommend completing your booking as soon as possible to secure the displayed price.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Passengers must comply with all airline requirements, including but not limited to: valid identification, visa requirements, health documentation, and baggage restrictions. It is the passenger's responsibility to verify all requirements with the airline and relevant authorities.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Cancellation and change policies vary by airline and fare type. Please review the specific terms associated with your booking before completing your purchase.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Hotel Booking Terms</h3>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Hotel reservations are subject to the terms and conditions of the individual hotel property. Check-in and check-out times, cancellation policies, and any special requirements are set by the hotel and should be reviewed before booking.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Additional charges such as resort fees, parking fees, taxes, and incidental charges may apply and are the responsibility of the guest. These charges are typically paid directly to the hotel.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  The hotel reserves the right to refuse service or cancel reservations for cause, including but not limited to: failure to meet age requirements, providing false information, or violating hotel policies.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Car Rental Terms</h3>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Car rentals are provided by third-party vendors and are subject to their terms and conditions. Rental agreements typically require:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Valid driver's license held for minimum period specified by rental company</li>
                  <li>Credit card in the driver's name for security deposit</li>
                  <li>Meeting minimum age requirements (typically 25 years)</li>
                  <li>Additional insurance coverage options</li>
                </ul>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Fuel policies, mileage limits, and cross-border travel restrictions vary by rental company and location. Review the rental agreement carefully before accepting the vehicle.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Payment Terms</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  All prices are displayed in USD unless otherwise specified. Payment must be made in full at the time of booking unless otherwise stated. We accept major credit cards, debit cards, and other payment methods as displayed during checkout.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  By providing your payment information, you authorize us and our service providers to charge your payment method for the total amount of your purchase, including any applicable taxes, fees, and surcharges.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  In the event of payment failure or chargeback, we reserve the right to cancel your booking and pursue collection of any outstanding amounts, including reasonable collection costs and legal fees.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Cancellation and Refund Policy</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Cancellation and refund policies vary depending on the type of service booked and the specific terms set by our service providers (airlines, hotels, car rental companies, etc.).
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Non-refundable bookings cannot be cancelled for a refund except where required by law. Partially refundable bookings may incur cancellation fees as specified at the time of booking.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Refunds, where applicable, will be processed within 7-14 business days to the original payment method used for booking. Service fees charged by Cheap Flights may be non-refundable regardless of the booking's refund status.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  To request a cancellation, contact our customer support at <a href="mailto:help@chyeap.com" className="text-primary hover:underline">help@chyeap.com</a> or call 1-800-123-4567. Cancellation requests must be made in accordance with the applicable cancellation policy timeframes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Travel Insurance</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  We strongly recommend purchasing travel insurance to protect your investment. Travel insurance can provide coverage for trip cancellation, medical emergencies, lost baggage, travel delays, and other unforeseen circumstances.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Travel insurance policies are underwritten by third-party insurance providers and are subject to their terms, conditions, and exclusions. Please read the policy documents carefully to understand what is and is not covered.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Force Majeure</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Neither Cheap Flights nor our service providers shall be liable for any failure to perform our obligations where such failure results from any cause beyond our reasonable control, including but not limited to: acts of God, natural disasters, war, terrorism, riots, civil unrest, government actions, pandemic or epidemic, strikes, labor disputes, or failure of telecommunications or information services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Special Requests and Accessibility</h2>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  Special requests such as dietary requirements, accessibility needs, room preferences, or seat assignments are not guaranteed and are subject to availability. We will communicate your requests to service providers, but we cannot guarantee they will be fulfilled.
                </p>
                <p className="text-base leading-7 text-foreground/90 mb-4">
                  If you have specific accessibility requirements, please contact us directly at <a href="mailto:help@chyeap.com" className="text-primary hover:underline">help@chyeap.com</a> or 1-800-123-4567 so we can better assist you in making appropriate arrangements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Parking Services Terms</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">General Parking Terms</h3>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Cheap Flights acts only as an agent for third party parking facility operators (Car Park Operator).</li>
                  <li>Bookings must be made online at least 24 hours prior to arrival.</li>
                  <li>You must be in possession of the credit card with which you have made the booking reservation.</li>
                  <li>The booking customer warrants and represents that the person who signs contract with the featured car park service is the authorized custodian of the vehicle.</li>
                  <li>The featured car park will accept liability for proven acts of their negligence. Claims cannot be considered once your vehicle has left the site.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Parking Requirements</h3>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Please make sure you have the details about the arrival procedure as stated on your booking confirmation. It is your responsibility to obtain this information before departing for the airport - any missed bookings, flights or other problems arising from the customer's failure to obtain this information will not be entertained by Cheap Flights or the featured car park service provider.</li>
                  <li>You must check in at the car park check-in facility at the time stated on your booking receipt. Should the customer not arrive on or before the stated time then Cheap Flights and the featured car park service provider shall not be liable for any customers' failure to meet aircraft arrivals and departures.</li>
                  <li>Please ensure that you have removed all your possessions before parking the car. Leave only the keys/codes required to move your vehicle, only when asked to do so by the authority in charge.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Parking Prices</h3>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>Full payment will be made to the featured car park service provider for completing the booking.</li>
                  <li>Your credit card will be charged twice for booking. Once by the featured car park service provider and by Cheap Flights at the time of booking.</li>
                  <li>We reserve the right to change our tariffs at any time and to withdraw any special, introductory or concessionary rate. This will not affect any reservation made before the change. The applicable tariff will be shown on your booking confirmation.</li>
                  <li>All parking charges must be paid in full before your vehicle can be removed from our featured car park. We shall have the right to retain a vehicle until such time as all sums due are paid. We will not accept cheque payment.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Parking Cancellation Policy</h3>
                <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-foreground/90 mb-4">
                  <li>All cancellation must be made through Cheap Flights in order to be valid.</li>
                  <li>All bookings are subject to a non-refundable booking fee. The refund of booking amount, however, differ from one service provider to other.</li>
                  <li>Cancellation can be made up to the last hour.</li>
                  <li>No refunds are available for unused part stays. All Bookings Fees and MMS charges are non-refundable.</li>
                  <li>Please be absolutely sure of the cancellation and payment terms and conditions for your booking at the time of purchase. All services featured on this website consist of different payment, cancellation and amendment terms and conditions.</li>
                  <li>The customer acknowledges that Cheap Flights may need to cancel parking services due to industrial action, no parking spaces available, technical problems or any event beyond the reasonable control of Cheap Flights. In no circumstances will the Cheap Flights be liable for any losses which a customer may incur as a result of any such occurrence or event.</li>
                </ul>
              </section>

              <footer className="mt-12 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Last Updated: October 7, 2025
                </p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Cheap Flights LLC | 1028 Broad St, Newark, NJ 07102 | <a href="mailto:help@chyeap.com" className="text-primary hover:underline">help@chyeap.com</a>
                </p>
              </footer>
            </article>
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default Terms;

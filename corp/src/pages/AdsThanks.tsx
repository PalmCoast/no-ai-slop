import { Link } from "react-router-dom";
import AdsShell from "../components/AdsShell";

export default function AdsThanks() {
  return (
    <AdsShell skipTo="#route-adsthanks">
      <main className="ads-thanks" id="route-adsthanks">
        <div className="ads-wrap">
          <p className="ads-eyebrow">AI Ad Sprint</p>
          <h1>
            Got it. <span>Your product is in.</span>
          </h1>
          <div className="ads-thanks-body">
            <p className="ads-lede">We have your product page and your email. Here is what happens next.</p>
            <ol>
              <li>
                <strong>We reply by email</strong> to confirm your details and ask anything we still need.
              </li>
              <li>
                <strong>Your sprint starts</strong> once payment and your intake are in. You get a download link within
                72 hours.
              </li>
              <li>
                <strong>Every file comes in 9:16, 1:1 and 4:5</strong>, ready to upload. Any AI-generated person is
                labeled as AI.
              </li>
            </ol>
            <h2>Have these ready</h2>
            <ul>
              <li>The offer you want to push (price, bundle, discount or launch)</li>
              <li>Who it's for, in a sentence</li>
              <li>2–3 ads you like the look of, from any brand</li>
              <li>Your logo and brand colors, if you have them</li>
              <li>Anything we must not say, such as claims your category doesn't allow</li>
            </ul>
            <p>
              After delivery, you get one round of revisions. Send your notes and we'll send the revised ads within 48
              hours.
            </p>
          </div>
          <Link className="ads-btn ads-btn-p" to="/ads">
            Back to AI Ad Sprint
          </Link>
        </div>
      </main>
    </AdsShell>
  );
}

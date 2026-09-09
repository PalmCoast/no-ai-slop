export function PoliciesPage() {
  return (
    <div className="card" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1>Posting rules and non-discrimination policy</h1>
      <p className="muted">Plain language. These rules apply to every employer, every member, and every group on Stateside.</p>

      <h2>Who Stateside is for</h2>
      <p>
        Stateside is a job network for information-technology professionals working in the United States. Every posting must be for a role
        located in the US (on-site, hybrid, or US-remote) and must require authorization to work in the United States. Those two facts are
        shown on every listing automatically.
      </p>

      <h2>Equal opportunity</h2>
      <p>
        Employers on Stateside must comply with Title VII of the Civil Rights Act, the Age Discrimination in Employment Act, the Americans
        with Disabilities Act, the Immigration and Nationality Act's anti-discrimination provisions, and applicable state and local law.
        Postings may not state or imply a preference, limitation, or exclusion based on race, color, religion, sex, national origin,
        citizenship status (beyond lawful work authorization), age, disability, or genetic information. Wording that does so is rejected
        automatically when detected, and any member can report a posting that slips through. Repeat violations get the employer account
        removed without refund.
      </p>

      <h2>Veterans first</h2>
      <p>
        Stateside gives US military veterans first consideration, which federal law expressly permits (Title VII § 712). In practice: new
        postings are visible to veteran members for their first 48 hours, veteran applicants appear at the top of every employer's applicant
        list, and employers may mark a posting "veteran preferred." Falsely claiming veteran status is grounds for removal.
      </p>

      <h2>What employers pay</h2>
      <p>
        $10 per posting, one time, for a 30-day listing. There are no subscriptions and no per-applicant fees. Postings removed for
        violating these rules are not refunded.
      </p>

      <h2>Employer verification and spam</h2>
      <p>
        Employers are verified automatically when their account email is on the same domain as their company website. Employers using a
        consumer mailbox are labelled "unverified," are limited to three postings a day, and can be verified manually by an admin. Postings
        must be for real, currently open roles at the posting company. Staffing agencies must identify themselves as such. Bulk posting,
        duplicate postings, and postings used to harvest resumes are removed and the account banned.
      </p>

      <h2>Members, groups, and messages</h2>
      <p>
        Membership is free. Direct messages only open between two members who have accepted a connection, and connection requests are
        limited to 20 a day, so nobody can cold-pitch you at scale. Anyone may create a group and is responsible for moderating it; group
        owners and moderators can remove members and delete messages. Harassment, hate speech, scams, and unsolicited recruiting pitches in
        groups get the account banned.
      </p>

      <h2>Reporting</h2>
      <p>
        Every job, profile, group, and message has a Report link. Reports go to the moderation queue, where an admin can dismiss the report,
        remove the content, or ban the account.
      </p>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="card empty">
      <h1>Page not found</h1>
      <p className="muted">That link does not go anywhere.</p>
    </div>
  );
}

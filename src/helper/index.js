export const StatusList = {
  "in-progress": "In Progress",
  completed: "Completed",
  "not-started": "Not Started",
  "on-hold": "On Hold",
  pending: "Pending",
};

export const TaskStatusList = {
  "to-do": "to-do",
  completed: "completed",
};

export const AllStages = [
  {
    id: 641,
    stageTitle: "Application",
    title: "Application Lodged",
    days: 0,
    status: "not-started",
  },
  {
    id: 641,
    stageTitle: "Application",
    title: "Assessment manager gives confirmation notice",
    days: 10,
    status: "not-started",
  },
  {
    id: 641,
    stageTitle: "Application",
    title: "Assessment manager gives action notice",
    days: 10,
    status: "not-started",
  },
  {
    id: 641,
    stageTitle: "Application",
    title: "Applicant takes required action",
    days: 20,
    status: "not-started",
  },
  {
    id: 641,
    stageTitle: "Application",
    title: "Assessment managers gives confirmation notice",
    days: 25,
    status: "not-started",
  },
  {
    id: 642,
    stageTitle: "Referral",
    title: "Applicant refers application to referral agencies",
    days: 35,
    status: "not-started",
  },
  {
    id: 642,
    stageTitle: "Referral",
    title: "Referral agency gives action notice",
    days: 40,
    status: "not-started",
  },
  {
    id: 642,
    stageTitle: "Referral",
    title: "Referral agency gives confirmation or period expires",
    days: 40,
    status: "not-started",
  },
  {
    id: 642,
    stageTitle: "Referral",
    title: "Applicant takes required action",
    days: 60,
    status: "not-started",
  },
  {
    id: 642,
    stageTitle: "Referral",
    title: "Assessment managers gives confirmation notice",
    days: 65,
    status: "not-started",
  },
  {
    id: 643,
    stageTitle: "Information Request",
    title: "Referral agency makes information request",
    days: 75,
    status: "not-started",
  },
  {
    id: 643,
    stageTitle: "Information Request",
    title: "Applicant responds to information request",
    days: 165,
    status: "not-started",
  },
  {
    id: 642,
    stageTitle: "Referral",
    title: "Referral agency issues response",
    days: 185,
    status: "not-started",
  },
  {
    id: 644,
    stageTitle: "Public Notification",
    title: "Applicant carries out public notification",
    days: 200,
    status: "not-started",
  },
  {
    id: 644,
    stageTitle: "Public Notification",
    title: "Submissions are made to the assessment manager",
    days: 230,
    status: "not-started",
  },
  {
    id: 644,
    stageTitle: "Public Notification",
    title: "Applicant gives assessment manager notice of compliance",
    days: 215,
    status: "not-started",
  },
  {
    id: 644,
    stageTitle: "Public Notification",
    title: "Assessment manager considers submissions",
    days: 240,
    status: "not-started",
  },
  {
    id: 645,
    stageTitle: "Decision",
    title: "Assessment manager decides application",
    days: 275,
    status: "not-started",
  },
  {
    id: 645,
    stageTitle: "Decision",
    title: "Assessment manager issues decision notice",
    days: 280,
    status: "not-started",
  },
];

export const StageList = {
  Application: "Application",
  "Information Request": "Info Request",
  Referral: "Referral",
  "Public Notification": "Inform Public",
  Decision: "Decision",
};

export const MIN_CALENDAR_YEAR = 5;

export const MAX_CALENDAR_YEAR = 5;

export const emailConfig = {
  Application: {
    "Application Lodged": [
      {
        emailType: "Application Lodgement",
        receiver: "Client",
        content:
          "<p>Dear Xxxx,</p><p>We can confirm your development application has now been lodged to Council.</p><p>We will be providing you with regular updates throughout the assessment process and aim to achieve approval in an efficient and timely manner.</p><p>Should you have any queries or concerns please contact the office.</p>",
      },
      {
        emailType: "Lodgement Fees",
        receiver: "Client",
        content:
          "<p>Hi Xxxx,</p><p>Please see attached Council’s lodgement fees for the development application at 99 XXXXX Street, XXXXX.</p><p>Please send a copy of the receipt / remittance for us to issue to Council.</p>",
      },
    ],
    "Assessment Manager Gives Confirmation Notice": [
      {
        emailType: "Confirmation Notice",
        receiver: "Client",
        content:
          "<p>Hi Xxxx,</p><p>Council have issued their confirmation notice for the application over 99 XXXXX Street, XXXXX. Please see attached.</p><p>The attached confirms that the application needs to be refereed to the State Assessment & Referral Agency as the development is within 25m of a State Controlled Road.</p><p>The attached confirms that Public Notification is required under Chapter 1, part 4 of the Development Assessment Rules.</p><p>Should you have any queries or concerns please contact the office.</p>",
      },
      {
        emailType: "Extend Referral of Application Period",
        receiver: "Council",
        content:
          "<p>Dear Xxxx,</p><p>In accordance with Section 5.1 of the DA Rules under the Planning Act 2016, we hereby request an extension to the Referral period for the application at XXXX.</p><p>We request and extension until XXXX.</p>",
      },
    ],
  },
  Referral: {
    "Applicant Refers Application To Referral Agencies": [
      {
        emailType: "Fee Proposal",
        receiver: "Client",
        content:
          "<p>Hi Xxxx,</p><p>Please see attached a fee proposal for the development of the above land.</p><p>Could you please complete and return the attached authorisation if you are happy to proceed and we can commence works immediately.</p><p>We look forward to the opportunity to work with you on this project.</p>",
      },
      {
        emailType: "Notice of Referral under Section 5.3 of DA Rules",
        receiver: "Council",
        content:
          "<p>Hi Xxxx,</p><p>Further to the below and in accordance with Section 54 of the Planning Act 2016 and Section 5.3 of the Development Assessment Rules, we confirm referral was made to XXXX on XXXX.</p>",
      },
      {
        emailType: "SARA - Missed Referral Notice",
        receiver: "Council",
        content:
          "<p><u>Notice of Missed Referral</u></p><p>Council Reference: XXXX</p><p>SARA Reference: XXXX</p><p>Pursuant to section 29.2 of the Development Assessment Rules (DA Rules) under the Planning Act 2016, Plan A Town Planning notifies SARA, as a Referral Agency (Concurrence) and XXXX Council as Assessment manager respectively, of a missed referral for XXXX.</p><p>As the applicant has given notice under section 29.2, the application does not lapse as a result of a missed referral agency.</p><p>The applicant will now refer the application in accordance with Section 5.1 of the DA Rules.</p>",
      },
    ],
  },
  "Info Request": {
    "Assessment Manager Makes Information Request": [
      {
        emailType: "Extend Information Request Response Period",
        receiver: "Council",
        content:
          "<p>Hi Xxxx,</p><p>In accordance with Section 13.1 of the DA Rules of the Planning Act 2016, we hereby request an extension of the Information Request response period.</p><p>We request an extension until XXXX.</p><p>Please let me know if you require anything further otherwise, we would appreciate Council's written confirmation of the above.</p>",
      },
      {
        emailType: "Extend Referral Assessment Period",
        receiver: "SARA",
        content:
          "<p>Dear Xxxx,</p><p>In accordance with Section 9.2(b) of the DA Rules under the Planning Act 2016, we hereby request an extension to the referral assessment period for the application at XXXX (SARA Ref XXXX).</p><p>We extend the period until XXXX.</p>",
      },
    ],
    "Referral Agency Makes Information Request": [
      {
        emailType: "Response to Information Request",
        receiver: "SARA",
        content:
          "<p>Dear Xxxx,</p><p>In accordance with Section 13.2 of the DA Rules of the Planning Act 2016, we hereby submit a response to the SARA(or referral agency) Information Request for XXXX (SARA Ref XXXX).</p><p>We also provide a copy of this response to Council is accordance with Section 13.4 of the DA Rules.</p>",
      },
      {
        emailType: "Extend Information Request Response Period ",
        receiver: "SARA",
        content:
          "<p>Dear Xxxx,</p><p>In accordance with Section 13.1 of the DA Rules under the Planning Act 2016, we hereby request an extension to the Referral Agency Information Request response period for the application at XXXX (Council Ref xxxx).</p><p>We request an extension until XXXX.</p>",
      },
    ],
    "Applicant Responds To Information Request": [
      {
        emailType: "Response to Information Request",
        receiver: "Council",
        content:
          "<p>Hi Xxxx,</p><p>In accordance with Section 13.2 of the DA Rules of the Planning Act 2016, we hereby submit a response to Council’s Information Request dated XXXX for XXXX (Council Reference: ).</p><p>The material provided represents a response to all of the information requested by Council. We trust the information provided is sufficient for Council to proceed with the assessment of the application.",
      },
    ],
  },
  "Inform Public": {
    "Applicant Carries Out Public Notification": [
      {
        emailType: "Notification",
        receiver: "Council",
        content:
          "<p>Hi Xxxx,</p><p>We write in relation to the pending development application at xxxx.</p><p>The response to the Information Request has been lodged to Council (and /or SARA) and we are now preparing to commence the Public Notification period.</p><p>The Public Notification is to run from xxx to xxx. Signage will be installed on site on xxx. The consultant will monitor the sign intermittently, however if you notice any damage to the sign please let us know as soon as possible so we can organise a replacement.</p><p>We will follow up with Council to confirm if any submissions are lodged and keep you updated.</p><p>Should you have any queries or concerns please contact the office.</p>",
      },
    ],
  },
  Decision: {
    "Assessment Manager Issues Further Advice": [
      {
        emailType: "Further Advice",
        receiver: "Client",
        content:
          "<p>Hi Xxxx,</p><p>Council have issued a Further Issues Letter / Request for Further Advice / Outstanding Issues Letter in relation to the pending application at xxxx.</p><p>Please find the Council’s request attached.</p><p>We have included a breakdown of the items and some preliminary comments in relation to preparing our response.</p><p>Should you have any queries orconcerns please contact the office.</p>",
      },
    ],
    "Assessment Manager Decides Application": [
      {
        emailType: "Decision Notice",
        receiver: "Client",
        content:
          "<p>Hi xxxx,</p><p>We are pleased to advise Council has issued a Decision Notice over the abovementioned site. Please find enclosed a copy for your records.</p><p>We are currently reviewing the notice and will provide comments in due course. Please ensure that you read and understand the requirements of these conditions and if you have any doubts or queries, please contact our office for a detailed explanation. our office.</p><p>Please note you now have a right of negotiation with Brisbane City Council and a right of appeal to the Planning and Environment Court against the conditions of approval. These rights will lapse after 20 business days. If you wish to request a negotiated decision notice or appeal, please advise us prior to this date to allow for time to prepare the appropriate documentation.</p><p>In moving forward, we note that Council have been ensuring strict compliance with plans and conditions of development approvals. In particular, Council have been undertaking additional site inspections during construction and strictly reviewing all plan sealing applications to ensure compliance. In the event that anything in the development alters, please contact our office such that we can advise whether a change application is likely required to be approved.</p><p>Should you have any queries or concerns please contact the office.</p>",
      },
      {
        emailType: "Request to Extend Decision Period",
        receiver: "Council",
        content:
          "<p>Hi xxxx,</p><p>In accordance with Section 22.1 of the DA Rules of the Planning Act 2016, we hereby request an extension of the Decision Period.</p><p>We request an extension until XXXX.</p><p>Please let me know if you require anything further otherwise, we would appreciate Council's written confirmation of the above.</p>",
      },
      {
        emailType: "Extend Referral Assessment Period",
        receiver: "SARA",
        content:
          "<p>Hi xxxx,</p><p>In accordance with Section 9.2(b) of the DA Rules under the Planning Act 2016, we hereby request an extension to the referral assessment period for the application at XXXX (SARA Ref XXXX).</p><p>We extend the period until XXXX.</p>",
      },
    ],
    "Assessment Manager Issues Decision Notice": [
      {
        emailType: "Negotiated Decision Notice",
        receiver: "Client",
        content:
          "<p>Hi xxxx,</p><p>We are pleased to advise Council has issued a Negotiated Decision Notice over the abovementioned site. Please find enclosed a copy for your records.</p><p>We are currently reviewing the notice and will provide comments in due course. Again, we request that you read and understand the requirements of these conditions and if you have any doubts or queries, please contact our office for a detailed explanation</p><p>Please note you now have a right of appeal to the Planning and Environment Court against the conditions of approval. These rights will lapse after 20 business days. If you wish to appeal, please advise us immediately such that we can co-ordinate abriefing with your solicitor.</p><p>In moving forward, we note that Council have been ensuring strict compliance with plans and conditions of development approvals. In particular, Council have been undertaking additional site inspections during construction and strictly reviewing all plan sealing applications to ensure compliance. In the event that anything in the development alters, please contact our office such that we can advise whether a change application is likely required to be approved.</p>",
      },
      {
        emailType: "Condition Review",
        receiver: "Client",
        content:
          "<p>Hi xxxx,</p><p>Further to receipt of Council’s decision notice on xxxx, we have undertaken a review of the conditions of approval and make the following comments for consideration.</p><p>Once you review are you able to contact myself to discuss the required actions.</p>",
      },
      {
        emailType: "Waive Appeal Period",
        receiver: "Council",
        content:
          "<p>Hi xxxx,</p><p>We refer to Council’s Decision Notice dated xxxx.</p><p>We hereby confirm we will not be appealing the conditions of the Decision Notice under Section 22.2(a)(i) of the DA Rules under the Planning Act 2016.</p><p>Please notify the submitters of their appeal period.</p>",
      },
      {
        emailType: "Request to Suspend Appeal Period",
        receiver: "Council",
        content:
          "<p>Hi XXXX,</p><p>As per Section 75 and 126 of the Planning Act 2016, we hereby suspend the appeal period for the approval at XXXX.</p><p>Representations will be provided in due course.</p>",
      },
      {
        emailType: "Extend the Suspended Appeal Period ",
        receiver: "Council",
        content:
          "<p>Hi XXXX,</p><p>Pursuant to Section 75 (4)(b)(iii) of the Planning Act 2016, we hereby request an extension to the applicant’s suspended appeal period to enable sufficient time for the representations to be considered by Council and a negotiated decision notice issued.</p><p>We request Council’s agreement to extend the suspend period until xxxx.</p>",
      },
    ],
  },
};

export const adHoc = [
  {
      "emailType": "Advice",
      "receiver": "Client",
      "subject": "Advice",
      "content": "<p>IMPORTANT – TAILOR THIS TO SUIT YOUR AUDIENCE AND THE QUESTION BEING ASKED</p><p>Dear X<p>We have reviewed this site for you.</p><p>We provide the following basic information below as an overview of the planning considerations for the site.</p><p>Site Address: xxxx</p><p>RPD: xxxx</p><p>Site Area: xxxx</p><p>Current Land Use: xxxx</p><p>Local Government: xxxx</p><p>Planning Scheme Requirements:</p><p>Planning Scheme: xxxx</p><p>Zoning: xxxx</p><p>Overlays: xxxx</p><p>Neighbourhood / Local Plan: xxxx</p><p>Neighbourhood / Local Plan Precinct: xxxx</p><p>We understand you are seeking to develop the site for the purpose of a xxxx land use.</p><h4>Level of Assessment</h4><p>Development for a Multiple Dwelling in the Character Residential Zone ((CR1) Character) is Impact Assessable. Impact Assessable applications require public notification and any submitters gain a right of appeal to the Planning and Environment Court.</p><h4>Key Planning Parameters</h4><p>The maximum height for Multiple Dwellings is prescribed as 2 storeys and 9.5m. Site cover is prescribed at a maximum 45% and there is a requirement for 10% of the site area to be dedicated as deep planting. Car parking is also required at the following rate:</p><ul><li>1 space per 1 bedroom dwelling</li><li>2 spaces per 2/3 bedroom dwelling</li><li>0.25 spaces per visitors</li></ul><p>We are able to provide a more detailed list of the relevant planning parameters as required should you wish to prepare concept layouts.</p><h4>Important Overlays</h4><p>The site is located within the Traditional Building Character Overlay. This will require new development on the site to be considerate of pre-1946 construction, both in design and materials used.</p><h4>Services</h4><p>The site slopes towards the street and stormwater would be directed to the street. There is a sewer pipe which runs through the rear of the site which would need to be considered.</p><h4>Other relevant considerations</h4><ul><li>Easements</li><li>Referrals</li><li>Vegetation protection outside overlays (e.g. NALL)</li>    <li>Existing approvals</li><li>Trunk infrastructure</li><li>Road widening</li><li>Practical issues you may see</li></ul>"
  },
  {
      "emailType": "Fee Proposal",
      "receiver": "Client",
      "subject": "Fee Proposal",
      "content": "<p>Hi xxxx,</p><p>Please see attached a fee proposal for the development of the above land.</p><p>Could you please complete and return the attached authorisation if you are happy to proceed and we can commence works immediately.</p><p>We look forward to the opportunity to work with you on this project.</p>"
  },
  {
      "emailType": "Owners Consent",
      "receiver": "Client",
      "subject": "Owners Consent",
      "content": "<p>Hi xxxx,</p><p>Please see attached an owners consent to permit us to lodge on your behalfover the above land.</p><p>We note that all property owners must sign the consent.</p><p>As the owner of the land is a company, the consent will need to be signed by either two directors or a director and a company secretary. If the company has a sole director, please provide a copy of documentation confirming.</p><p>If the owner is a body corporate, the signed document will need to be signed under seal and accompanied by a copy of the meeting minutes to which the consent was agreed.</p><p>If the consent is signed under Power of Attorney, we will require a copy of the accompanying Power of Attorney document.</p><p>Should you have any queries or concerns please contact the office.</p>"
  },
  {
      "emailType": "Revival of DA Variable",
      "receiver": "Council",
      "subject": "Revival of DA Variable",
      "content": "<p>Dear XXXX</p><p>Please see attached notice under section 31.2 of the DA Rules to revive the lapsed application at XXXX reference XXXX.</p><p>The applicant has now undertaken the actions under section 31.1 of the DA Rules and this email represents our notice to the assessment manager advising that the relevant actions under section 31.1 have been undertaken.</p>"
  }
]



export function getEmailsByStageAndTitle(stage, title) {
  const stageEmails = emailConfig[stage];
  console.log(stageEmails)
  if (!stageEmails) return []; // Return an empty array if stage is not found

  if (title && stageEmails[title]) {
    return stageEmails[title]; // Return the array for the matched title
  }

  // If title is not found or not provided, return all emails from all titles in the stage
  return Object.values(stageEmails).flat();
}

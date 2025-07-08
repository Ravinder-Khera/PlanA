import moment from "moment";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid"
export const arraysEqualById = (arr1, arr2) => {
  const ids1 = _.sortBy(arr1.map((obj) => obj.id));
  const ids2 = _.sortBy(arr2.map((obj) => obj.id));
  return _.isEqual(ids1, ids2);
};

export const arraysEqualByIdV2 = (arr1, arr2) => {
  const ids1 = _.sortBy(arr1);
  const ids2 = _.sortBy(arr2);
  return _.isEqual(ids1, ids2);
};

export const compareTaskArray = (arr1, arr2) => {
  return _.isEqual(arr1, arr2);
};

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
    id: 646,
    stageTitle: "Application",
    title: "Application Lodged",
    days: 0,
    status: "not-started",
  },
  {
    id: 646,
    stageTitle: "Application",
    title: "Assessment Manager Gives Confirmation Notice",
    days: 10,
    status: "not-started",
  },
  {
    id: 646,
    stageTitle: "Application",
    title: "Assessment Manager Gives Action Notice",
    days: 10,
    status: "not-started",
  },
  {
    id: 646,
    stageTitle: "Application",
    title: "Applicant Takes Required Action",
    days: 20,
    status: "not-started",
  },
  {
    id: 646,
    stageTitle: "Application",
    title: "Assessment Manager Gives Confirmation Notice",
    days: 25,
    status: "not-started",
  },
  {
    id: 647,
    stageTitle: "Referral",
    title: "Applicant Refers Application To Referral Agencies",
    days: 35,
    status: "not-started",
  },
  {
    id: 647,
    stageTitle: "Referral",
    title: "Referral Agency Gives Action Notice",
    days: 40,
    status: "not-started",
  },
  {
    id: 647,
    stageTitle: "Referral",
    title: "Applicant Takes Required Actions",
    days: 60,
    status: "not-started",
  },
  {
    id: 647,
    stageTitle: "Referral",
    title: "Referral Agency Gives Confirmation Notice",
    days: 65,
    status: "not-started",
  },
  {
    id: 647,
    stageTitle: "Referral",
    title:
      "Referral Agency Gives Referral Confirmation Notice Or Period Expires",
    days: 40,
    status: "not-started",
  },
  {
    id: 647,
    stageTitle: "Referral",
    title: "Referral Agency Issues Response",
    days: 65,
    status: "not-started",
  },
  {
    id: 647,
    stageTitle: "Referral",
    title: "Applicant Refers Application To Referral Agencies",
    days: 40,
    status: "not-started",
  },

  {
    id: 648,
    stageTitle: "Info Request",
    title: "Assessment Manager Makes Information Request",
    days: 70,
    status: "not-started",
  },
  {
    id: 648,
    stageTitle: "Info Request",
    title: "Referral Agency Makes Information Request",
    days: 75,
    status: "not-started",
  },
  {
    id: 648,
    stageTitle: "Info Request",
    title: "Applicant Responds To Information Request",
    days: 165,
    status: "not-started",
  },
  {
    id: 649,
    stageTitle: "Inform Public",
    title: "Applicant Carries Out Public Notification",
    days: 200,
    status: "not-started",
  },
  {
    id: 649,
    stageTitle: "Inform Public",
    title: "Submissions Are Made To The Assessment Manager",
    days: 230,
    status: "not-started",
  },
  {
    id: 649,
    stageTitle: "Inform Public",
    title: "Applicant Gives Assessment Manager Notice Of Compliance",
    days: 215,
    status: "not-started",
  },
  {
    id: 649,
    stageTitle: "Inform Public",
    title: "Assessment Manager Considers Submissions",
    days: 240,
    status: "not-started",
  },
  {
    id: 650,
    stageTitle: "Decision",
    title: "Assessment Manager Issues Further Advice",
    days: 250,
    status: "not-started",
  },
  {
    id: 650,
    stageTitle: "Decision",
    title: "Assessment Manager Decides Application",
    days: 275,
    status: "not-started",
  },
  {
    id: 650,
    stageTitle: "Decision",
    title: "Assessment Manager Issues Decision Notice",
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

export const StageListMapFromDB = {
  Application: "Application",
  "Info Request": "Information Request",
  Referral: "Referral",
  "Inform Public": "Public Notification",
  Decision: "Decision",
  "Prelodgement":"Prelodgement",
  "General": "General"
};

export const MIN_CALENDAR_YEAR = 5;

export const MAX_CALENDAR_YEAR = 5;

export const emailConfig = {
  Application: {
    "Application Lodged": [
      {
        id: 1,
        emailType: "Application Lodgement",
        receiver: "Client",
        subject: "RE: To Client - Application Lodgement",
        content:
          "<p>Dear Xxxx,</p><p>We can confirm your development application has now been lodged to Council.</p><p>We will be providing you with regular updates throughout the assessment process and aim to achieve approval in an efficient and timely manner.</p><p>Should you have any queries or concerns please contact the office.</p>",
      },
      {
        id: 2,
        emailType: "Lodgement Fees",
        receiver: "Client",
        subject: "RE: To Client - Lodgement Fees - 99 XXXXX Street, XXXXX",
        content:
          "<p>Hi Xxxx,</p><p>Please see attached Council’s lodgement fees for the development application at 99 XXXXX Street, XXXXX.</p><p>Please send a copy of the receipt / remittance for us to issue to Council.</p>",
      },
    ],
    "Assessment manager gives confirmation notice": [
      {
        id: 3,
        emailType: "Confirmation Notice",
        receiver: "Client",
        subject: "RE: To Client - Confirmation Notice - 99 XXXXX Street, XXXXX",
        content:
          "<p>Hi xxxx,</p><p>Council have issued their confirmation notice for the application over 99 XXXXX Street, XXXXX. Please see attached.</p><p>Delete / alter as needed</p><p>The attached confirms that the application needs to be refereed to the State Assessment & Referral Agency as the development is within 25m of a State Controlled Road.</p><p>The attached confirms that Public Notification is required under Chapter 1, part 4 of the Development Assessment Rules.</p><p>Should you have any queries or concerns please contact the office.</p>",
      },
      {
        id: 4,
        emailType: "Extend Referral of Application Period",
        receiver: "Council",
        subject: "RE: To Council - Extend Referral of Application Period",
        content:
          "<p>Dear Xxxx,</p><p>In accordance with Section 5.1 of the DA Rules under the Planning Act 2016, we hereby request an extension to the Referral period for the application at XXXX.</p><p>We request and extension until XXXX.</p>",
      },
    ],
    "Assessment manager gives action notice": [
      {
        id: 5,
        emailType: "Action Notice Response",
        receiver: "Council",
        subject: "RE: Action Notice Response",
        content: "",
      },
      {
        id: 6,
        emailType: "Action Notice Extension",
        receiver: "Council",
        subject: "RE: Action Notice Extension",
        content: "",
      },
    ],
  },
  Referral: {
    "Applicant refers application to referral agencies": [
      {
        id: 7,
        emailType: "Fee Proposal",
        receiver: "Client",
        subject: "RE: To Client - Fee Proposal - 99 XXXXX Street, XXXXXX",
        content:
          "<p>Hi Xxxx,</p><p>Please see attached a fee proposal for the development of the above land.</p><p>Could you please complete and return the attached authorisation if you are happy to proceed and we can commence works immediately.</p><p>We look forward to the opportunity to work with you on this project.</p>",
      },
      {
        id: 8,
        emailType: "Notice of Referral under Section 5.3 of DA Rules",
        receiver: "Council",
        subject:
          "RE: To Council - Notice of Referral under Section 5.3 of DA Rules",
        content:
          "<p>Hi Xxxx,</p><p>Further to the below and in accordance with Section 54 of the Planning Act 2016 and Section 5.3 of the Development Assessment Rules, we confirm referral was made to XXXX on XXXX.</p>",
      },
      {
        id: 9,
        emailType: "SARA - Missed Referral Notice",
        receiver: "Council",
        subject: "RE: To Council / SARA - Missed Referral Notice",
        content:
          "<p><u>Notice of Missed Referral</u></p><p>Council Reference: XXXX</p><p>SARA Reference: XXXX</p><p>Pursuant to section 29.2 of the Development Assessment Rules (DA Rules) under the Planning Act 2016, Plan A Town Planning notifies SARA, as a Referral Agency (Concurrence) and XXXX Council as Assessment manager respectively, of a missed referral for XXXX.</p><p>As the applicant has given notice under section 29.2, the application does not lapse as a result of a missed referral agency.</p><p>The applicant will now refer the application in accordance with Section 5.1 of the DA Rules.</p>",
      },
    ],
  },
  "Info Request": {
    "Assessment Manager Makes Information Request": [
      {
        id: 25,
        emailType: "Information Request - Council and SARA",
        receiver: "Client",
        subject: "Information Request - Council and SARA",
        content: "",
      },
      {
        id: 10,
        emailType: "Extend Information Request Response Period",
        receiver: "Council",
        subject: "RE: To Council - Extend Information Request Response Period",
        content:
          "<p>Hi Xxxx,</p><p>In accordance with Section 13.1 of the DA Rules of the Planning Act 2016, we hereby request an extension of the Information Request response period.</p><p>We request an extension until XXXX.</p><p>Please let me know if you require anything further otherwise, we would appreciate Council's written confirmation of the above.</p>",
      },
      {
        id: 11,
        emailType: "Extend Referral Assessment Period",
        receiver: "SARA",
        subject: "RE: To SARA - Extend Referral Assessment Period",
        content:
          "<p>Dear Xxxx,</p><p>In accordance with Section 9.2(b) of the DA Rules under the Planning Act 2016, we hereby request an extension to the referral assessment period for the application at XXXX (SARA Ref XXXX).</p><p>We extend the period until XXXX.</p>",
      },
    ],
    "Referral agency makes information request": [
      {
        id: 12,
        emailType: "Response to Information Request",
        receiver: "SARA",
        subject: "RE: To SARA/Referral - Response to Information Request",
        content:
          "<p>Dear Xxxx,</p><p>In accordance with Section 13.2 of the DA Rules of the Planning Act 2016, we hereby submit a response to the SARA(or referral agency) Information Request for XXXX (SARA Ref XXXX).</p><p>We also provide a copy of this response to Council is accordance with Section 13.4 of the DA Rules.<p>CC COUNCIL</p></p>",
      },
      {
        id: 13,
        emailType: "Extend Information Request Response Period ",
        receiver: "SARA",
        subject:
          "RE: To SARA/Referral Agency - Extend Information Request Response Period",
        content:
          "<p>Dear Xxxx,</p><p>In accordance with Section 13.1 of the DA Rules under the Planning Act 2016, we hereby request an extension to the Referral Agency Information Request response period for the application at XXXX (Council Ref xxxx).</p><p>We request an extension until XXXX.</p>",
      },
    ],
    "Applicant responds to information request": [
      {
        id: 14,
        emailType: "Response to Information Request",
        receiver: "Council",
        subject: "RE: To Council - Response to Information Request",
        content:
          "<p>Hi Xxxx,</p><p>In accordance with Section 13.2 of the DA Rules of the Planning Act 2016, we hereby submit a response to Council’s Information Request dated XXXX for XXXX (Council Reference: ).</p><p>The material provided represents a response to all of the information requested by Council. We trust the information provided is sufficient for Council to proceed with the assessment of the application.</p>",
      },
    ],
  },
  "Inform Public": {
    "Applicant Carries Out Public Notification": [
      {
        id: 15,
        emailType: "Notification",
        receiver: "Client",
        subject: "RE: To Client - Notification",
        content:
          "<p>Hi Xxxx,</p><p>We write in relation to the pending development application at xxxx.</p><p>The response to the Information Request has been lodged to Council (and /or SARA) and we are now preparing to commence the Public Notification period.</p><p>The Public Notification is to run from xxx to xxx. Signage will be installed on site on xxx. The consultant will monitor the sign intermittently, however if you notice any damage to the sign please let us know as soon as possible so we can organise a replacement.</p><p>We will follow up with Council to confirm if any submissions are lodged and keep you updated.</p><p>Should you have any queries or concerns please contact the office.</p>",
      },
    ],
  },
  Decision: {
    "Assessment Manager Issues Further Advice": [
      {
        id: 16,
        emailType: "Further Advice",
        receiver: "Client",
        subject: "RE: To Client - Further Advice",
        content:
          "<p>Hi Xxxx,</p><p>Council have issued a Further Issues Letter / Request for Further Advice / Outstanding Issues Letter in relation to the pending application at xxxx.</p><p>Please find the Council’s request attached.</p><p>We have included a breakdown of the items and some preliminary comments in relation to preparing our response. <ul><li>ADD COMMENTS AS RELEVANT</li></ul></p><p>Should you have any queries or concerns please contact the office.</p>",
      },
    ],
    "Assessment manager decides application": [
      {
        id: 17,
        emailType: "Decision Notice",
        receiver: "Client",
        subject: "RE: To Client - Decision Notice - 99 XXXXX Street, XXXXXX",
        content:
          "<p>Hi xxxx,</p><p>We are pleased to advise Council has issued a Decision Notice over the abovementioned site. Please find enclosed a copy for your records.</p><p>We are currently reviewing the notice and will provide comments in due course. Please ensure that you read and understand the requirements of these conditions and if you have any doubts or queries, please contact our office for a detailed explanation. our office.</p><p>Please note you now have a right of negotiation with Brisbane City Council and a right of appeal to the Planning and Environment Court against the conditions of approval. These rights will lapse after 20 business days.  If you wish to request a negotiated decision notice or appeal, please advise us prior to this date to allow for time to prepare the appropriate documentation.</p><p>In moving forward, we note that Council have been ensuring strict compliance with plans and conditions of development approvals.  In particular, Council have been undertaking additional site inspections during construction and strictly reviewing all plan sealing applications to ensure compliance.  In the event that anything in the development alters, please contact our office such that we can advise whether a change application is likely required to be approved.</p><p>Should you have any queries or concerns please contact the office.</p>",
      },
      {
        id: 18,
        emailType: "Request to Extend Decision Period",
        receiver: "Council",
        subject: "RE: To Council - Request to Extend Decision Period",
        content:
          "<p>Hi xxxx,</p><p>In accordance with Section 22.1 of the DA Rules of the Planning Act 2016, we hereby request an extension of the Decision Period.</p><p>We request an extension until XXXX.</p><p>Please let me know if you require anything further otherwise, we would appreciate Council's written confirmation of the above.</p>",
      },
      {
        id: 19,
        emailType: "Extend Referral Assessment Period",
        receiver: "SARA",
        subject: "RE: To SARA - Extend Referral Assessment Period",
        content:
          "<p>Dear xxxx,</p><p>In accordance with Section 9.2(b) of the DA Rules under the Planning Act 2016, we hereby request an extension to the referral assessment period for the application at XXXX (SARA Ref XXXX).</p><p>We extend the period until XXXX.</p>",
      },
    ],
    "Assessment manager issues decision notice": [
      {
        id: 20,
        emailType: "Negotiated Decision Notice",
        receiver: "Client",
        subject:
          "RE: To Client - Negotiated Decision Notice - 99 XXXXX Street, XXXXXX",
        content:
          "<p>Hi xxxx,</p><p>We are pleased to advise Council has issued a Negotiated Decision Notice over the abovementioned site. Please find enclosed a copy for your records.</p><p>We are currently reviewing the notice and will provide comments in due course. Again, we request that you read and understand the requirements of these conditions and if you have any doubts or queries, please contact our office for a detailed explanation</p><p>Please note you now have a right of appeal to the Planning and Environment Court against the conditions of approval. These rights will lapse after 20 business days. If you wish to appeal, please advise us immediately such that we can co-ordinate a briefing with your solicitor.</p><p>In moving forward, we note that Council have been ensuring strict compliance with plans and conditions of development approvals.  In particular, Council have been undertaking additional site inspections during construction and strictly reviewing all plan sealing applications to ensure compliance.  In the event that anything in the development alters, please contact our office such that we can advise whether a change application is likely required to be approved.</p>",
      },
      {
        id: 21,
        emailType: "Condition Review",
        receiver: "Client",
        subject: "RE: To Client - Condition Review",
        content:
          "<p>Hi xxxx,</p><p>Further to receipt of Council’s decision notice on xxxx, we have undertaken a review of the conditions of approval and make the following comments for consideration.<ul><li>ADD COMMENTS IF RELEVANT</li></ul></p><p>Once you review are you able to contact myself to discuss the required actions.</p>",
      },
      {
        id: 22,
        emailType: "Waive Appeal Period",
        receiver: "Council",
        subject:
          "RE: To Council - Waive Appeal Period - 99 XXXXX Street, XXXXXX",
        content:
          "<p>Hi xxxx,</p><p>We refer to Council’s Decision Notice dated xxxx.</p><p>We hereby confirm we will not be appealing the conditions of the Decision Notice under Section 22.2(a)(i) of the DA Rules under the Planning Act 2016.</p><p>Please notify the submitters of their appeal period.</p>",
      },
      {
        id: 26,
        emailType: "Submit NDN representations to Council",
        receiver: "Council",
        subject: 'RE: To Council - "Submit NDN representations to Council"',
        content: "",
      },
      {
        id: 23,
        emailType: "Request to Suspend Appeal Period",
        receiver: "Council",
        subject: "RE: To Council - Request to Suspend Appeal Period",
        content:
          "<p>Hi XXXX,</p><p>As per Section 75 and 126 of the Planning Act 2016, we hereby suspend the appeal period for the approval at XXXX.</p><p>Representations will be provided in due course.</p>",
      },
      {
        id: 24,
        emailType: "Extend the Suspended Appeal Period ",
        receiver: "Council",
        subject: "RE: To Council - Extend the Suspended Appeal Period",
        content:
          "<p>Hi XXXX,</p><p>Pursuant to Section 75 (4)(b)(iii) of the Planning Act 2016, we hereby request an extension to the applicant’s suspended appeal period to enable sufficient time for the representations to be considered by Council and a negotiated decision notice issued.</p><p>We request Council’s agreement to extend the suspend period until xxxx.</p>",
      },
    ],
  },
};

export const adHoc = [
  {
    emailType: "Advice",
    receiver: "Client",
    subject: "RE: To Client -Advice",
    content:
      "<p><strong>IMPORTANT – TAILOR THIS TO SUIT YOUR AUDIENCE AND THE QUESTION BEING ASKED</strong></p><p>Dear X,</p><p>We have reviewed this site for you.</p><p>We provide the following basic information below as an overview of the planning considerations for the site.</p><p><strong>Site Address:</strong> xxxx</p><p><strong>RPD:</strong> xxxx</p><p><strong>Site Area:</strong> xxxx</p><p><strong>Current Land Use:</strong> xxxx</p><p><strong>Local Government:</strong> xxxx</p><p><strong>Planning Scheme Requirements:</strong></p><p><strong>Planning Scheme:</strong> xxxx</p><p><strong>Zoning:</strong> xxxx</p><p><strong>Overlays:</strong> xxxx</p><p><strong>Neighbourhood / Local Plan:</strong> xxxx</p><p><strong>Neighbourhood / Local Plan Precinct:</strong> xxxx</p><p>We understand you are seeking to develop the site for the purpose of a xxxx land use.</p><p><strong>Level of Assessment</strong></p><p>Development for a Multiple Dwelling in the Character Residential Zone (CR1 Character) is Impact Assessable. Impact Assessable applications require public notification and any submitters gain a right of appeal to the Planning and Environment Court.</p><p><strong>Key Planning Parameters</strong></p><p>The maximum height for Multiple Dwellings is prescribed as 2 storeys and 9.5m. Site cover is prescribed at a maximum 45% and there is a requirement for 10% of the site area to be dedicated as deep planting. Car parking is also required at the following rate:</p><ul><li>1 space per 1-bedroom dwelling</li><li>2 spaces per 2/3-bedroom dwelling</li><li>0.25 spaces per visitors</li></ul><p>We are able to provide a more detailed list of the relevant planning parameters as required should you wish to prepare concept layouts.</p><p><strong>Important Overlays</strong></p><p>The site is located within the Traditional Building Character Overlay. This will require new development on the site to be considerate of pre-1946 construction, both in design and materials used.</p><p><strong>Services</strong></p><p>The site slopes towards the street and stormwater would be directed to the street. There is a sewer pipe which runs through the rear of the site which would need to be considered.</p><p><strong>Other relevant considerations</strong></p><ul><li>Easements</li><li>Referrals</li><li>Vegetation protection outside overlays (e.g. NALL)</li><li>Existing approvals</li><li>Trunk infrastructure</li><li>Road widening</li><li>Practical issues you may see</li></ul><p><strong>Summary & Strategy</strong></p>",
  },
  {
    emailType: "Fee Proposal",
    receiver: "Client",
    subject: "RE: To Client - Fee Proposal - 99 XXXXX Street, XXXXXX",
    content:
      "<p>Hi xxxx,</p><p>Please see attached a fee proposal for the development of the above land.</p><p>Could you please complete and return the attached authorisation if you are happy to proceed and we can commence works immediately.</p><p>We look forward to the opportunity to work with you on this project.</p>",
  },
  {
    emailType: "Owners Consent",
    receiver: "Client",
    subject: "RE: To Client - Owners Consent - 99 XXXXX Street, XXXXXX",
    content:
      "<p>Hi xxxx,</p><p>Please see attached an owners consent to permit us to lodge on your behalf over the above land.</p><p><strong>DELETE WHICH DOESN’T APPLY</strong></p><p>We note that all property owners must sign the consent.</p><p>As the owner of the land is a company, the consent will need to be signed by either two directors or a director and a company secretary. If the company has a sole director, please provide a copy of documentation confirming.</p><p>If the owner is a body corporate, the signed document will need to be signed under seal and accompanied by a copy of the meeting minutes to which the consent was agreed.</p><p>If the consent is signed under Power of Attorney, we will require a copy of the accompanying Power of Attorney document.</p><p>Should you have any queries or concerns please contact the office.</p>",
  },
  {
    emailType: "Weekly Review Email",
    receiver: "Client",
    subject: "RE:  Weekly Review Email",
    content: "",
  },
  {
    emailType: "Revival of DA Variable",
    receiver: "Council",
    subject: "RE: To Council - Revival of Application",
    content:
      "<p>Dear XXXX,</p><p>Please see attached notice under section 31.2 of the DA Rules to revive the lapsed application at XXXX reference XXXX.</p><p>The applicant has now undertaken the actions under section 31.1 of the DA Rules and this email represents our notice to the assessment manager advising that the relevant actions under section 31.1 have been undertaken.</p>",
  },
  {
    emailType: "Request for stop the clock",
    receiver: "Client",
    subject: "Request for stop the clock",
    content: "",
  },
];

export function getEmailsByStageAndTitle(stage, title) {
  const stageEmails = emailConfig[stage];
  
  if (!stageEmails) return []; // Return an empty array if stage is not found

  if (title && stageEmails[title]) {
    return stageEmails[title]; // Return the array for the matched title
  }

  // If title is not found or not provided, return all emails from all titles in the stage
  return Object.values(stageEmails).flat();
}

export const CollaboratorBorders = {
  158: "1px solid #F068FF",
  159: "1px solid #68FFF0",
  160: "1px solid #687CFF",
  161: "1px solid #007AC1",
  162: "1px solid #1D5600",
  163: "1px solid #CDABFF",
  164: "1px solid #1010FF",
  165: "1px solid #576B4B",
  166: "1px solid #BE008F",
  167: "1px solid #987C00",
  168: "1px solid #FFABAB",
  169: "1px solid rgba(251, 255, 149, 0.54)",
  170: "1px solid #84AC9A",
  173: "1px solid #864EE0",
  174: "1px solid #864EE0",
  175: "1px solid #F068FF",
  176: "1px solid #68FFF0",
  177: "1px solid #687CFF",
  178: "1px solid #007AC1",
  179: "1px solid #1D5600",
  180: "1px solid #CDABFF",
  181: "1px solid #1010FF",
  182: "1px solid #576B4B",
  183: "1px solid #BE008F",
  184: "1px solid #987C00",
  185: "1px solid #FFABAB",
  186: "1px solid rgba(251, 255, 149, 0.54)",
  187: "1px solid #84AC9A",
  188: "1px solid #864EE0",
};

export const CollaboratorNameBorders = {
  "Adam Nagel": "1px solid #F068FF",
  "Peter Catchlove": "1px solid #68FFF0",
  "Matt Geyle": "1px solid #687CFF",
  "Emily Hutchinson": "1px solid #007AC1",
  "Josh Dixon": "1px solid #1D5600",
  "Georgina McNee": "1px solid #CDABFF",
  "Luke Jones": "1px solid #1010FF",
  "Garrett McVilly": "1px solid #576B4B",
  "Holly Ilka": "1px solid #BE008F",
  "Harrison Southwell": "1px solid #987C00",
  "Oscar Delaney": "1px solid #FFABAB",
  "Kym Allison": "1px solid rgba(251, 255, 149, 0.54)",
  "Web User": "1px solid #84AC9A",
  "Julian Hayes": "1px solid #864EE0",
};

export const CollaboratorNameBG = {
  "Adam Nagel": "#C21807",                  // Chili Red (actual: #C21807)
  "Peter Catchlove": "#73182C",         // QLD Maroon
  "Garrett McVilly": "#90D5FF",         // Light Blue
  "Holly Ilka": "#26FF00",                 // Lime Green (actual: #26FF00)
  "Eddie Gaydon": "#46198E",            // Dark Purple
  "Oscar Delaney": "#E3881F",           // Orange
  "Matt Geyle": "#FFF200",              // Full Yellow
  "Harrison Southwell": "#D5B895",      // Beige
  "Scarlett": "#1D5600",                // Dark Green
  "Joshua Dixon": "#FFFFFF",            // White
  "Luke Jones": "#1100FF",              // Dark Blue
  "Georgina McNee": "#FFB6C1",          // Light pink
  "Emily Hutchinson": "#F068FF",        // Hot pink / fuchsia
  "Kym Allison": "#68FFF0",             // Turquoise
  "Web User": "#84AC9A",
  "Julian Hayes": "#864EE0",
  "Josh Dixon": "#FFFFFF",              // Alias of Joshua Dixon
};

export const CollaboratorNameColor = {
  "Adam Nagel": "#fff",                  // Chili Red (actual: #C21807)
  "Peter Catchlove": "#fff",         // QLD Maroon
  "Garrett McVilly": "#353535",         // Light Blue
  "Holly Ilka": "#353535",                 // Lime Green (actual: #26FF00)
  "Eddie Gaydon": "#fff",            // Dark Purple
  "Oscar Delaney": "#fff",           // Orange
  "Matt Geyle": "#353535",              // Full Yellow
  "Harrison Southwell": "#353535",      // Beige
  "Scarlett": "#fff",                // Dark Green
  "Joshua Dixon": "#353535",            // White
  "Luke Jones": "#fff",              // Dark Blue
  "Georgina McNee": "#353535",          // Light pink
  "Emily Hutchinson": "#353535",        // Hot pink / fuchsia
  "Kym Allison": "#353535",             // Turquoise
  "Web User": "#fff",
  "Julian Hayes": "#fff",
  "Josh Dixon": "#353535",              // Alias of Joshua Dixon
};

export function addNotification(type, message) {
  const notificationData = {
    class: type,
    message,
    id: uuidv4()
  };
  const existingNotificationsJSON = localStorage.getItem("notifications");
  let existingNotifications = [];
  if (existingNotificationsJSON) {
    existingNotifications = JSON.parse(existingNotificationsJSON);
  }
  existingNotifications.unshift(notificationData);

  localStorage.setItem("notifications", JSON.stringify(existingNotifications));
}

export function sortTasksByDueDateProximity(tasks) {
  const today = new Date();

  return tasks.slice().sort((a, b) => {
    const aDue = new Date(a.due_date);
    const bDue = new Date(b.due_date);

    const aDiff = Math.abs(aDue - today);
    const bDiff = Math.abs(bDue - today);

    return aDiff - bDiff;
  });
}

export const locationOptions = [
  { location: "Balonne (S)", state: "QLD" },
  { location: "Banana (S)", state: "QLD" },
  { location: "Barcaldine (R)", state: "QLD" },
  { location: "Barcoo (S)", state: "QLD" },
  { location: "Blackall-Tambo (R)", state: "QLD" },
  { location: "Boulia (S)", state: "QLD" },
  { location: "Brisbane (C)", state: "QLD" },
  { location: "Bulloo (S)", state: "QLD" },
  { location: "Bundaberg (R)", state: "QLD" },
  { location: "Burdekin (S)", state: "QLD" },
  { location: "Burke (S)", state: "QLD" },
  
];


export function getDaysLeft(dueDate) {
  const targetDate = moment(dueDate || new Date()).startOf("day");
  const today = moment().startOf("day");

  const diff = targetDate.diff(today, "days");

  // If due date is in the past, return 0
  return diff < 0 ? 0 : diff;
}

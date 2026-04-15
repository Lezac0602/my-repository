import {
  ChatMessage,
  ChunkRecord,
  ConversationPreset,
  DocumentCategory,
  DocumentRecord,
  MockQueryScenario,
} from "../types";

const defaultPipeline = [
  { id: "parse", label: "Query parsed", description: "Intent and scope identified." },
  { id: "retrieve", label: "Documents retrieved", description: "Relevant documents retrieved from the demo index." },
  { id: "rank", label: "Top-k chunks selected", description: "Highest-signal chunks ranked for synthesis." },
  { id: "generate", label: "Answer generated", description: "Structured answer prepared with citations." },
] as const;

export const navigationItems = ["Chat", "Recent Questions", "Saved Queries", "Settings"] as const;

export const documents: DocumentRecord[] = [
  {
    id: "doc-regulations",
    title: "PolyU Academic Regulations 2024/25",
    type: "Policy",
    category: "Academic Regulations",
    updatedAt: "2025-08-12",
    coverage: 0.94,
    isTopReferenced: true,
  },
  {
    id: "doc-handbook",
    title: "BSc Programme Handbook",
    type: "Handbook",
    category: "Programme Handbook",
    updatedAt: "2025-07-05",
    coverage: 0.88,
    isTopReferenced: true,
  },
  {
    id: "doc-comp",
    title: "COMP Subject Description",
    type: "Subject Description",
    category: "Course Syllabus",
    updatedAt: "2025-09-03",
    coverage: 0.84,
    isTopReferenced: true,
  },
  {
    id: "doc-faq",
    title: "Assessment Policy FAQ",
    type: "FAQ",
    category: "FAQ",
    updatedAt: "2025-06-18",
    coverage: 0.76,
    isTopReferenced: false,
  },
  {
    id: "doc-deadlines",
    title: "Semester Timeline and Deadlines",
    type: "Timeline",
    category: "Deadlines",
    updatedAt: "2025-09-01",
    coverage: 0.9,
    isTopReferenced: true,
  },
  {
    id: "doc-grad",
    title: "Graduation Requirements Guide",
    type: "Policy",
    category: "Graduation Requirements",
    updatedAt: "2025-07-28",
    coverage: 0.86,
    isTopReferenced: false,
  },
];

export const chunks: ChunkRecord[] = [
  {
    id: "chunk-grad-1",
    documentId: "doc-handbook",
    sectionLabel: "Section 4.2 Credit Structure",
    pageLabel: "p. 18",
    preview: "Students are normally expected to complete 120 credits including university requirements, core subjects, and electives.",
    fullText:
      "Students are normally expected to complete 120 credits for graduation. The requirement includes General University Requirements, programme core subjects, electives, and Work-Integrated Education where applicable.",
    keywords: ["120 credits", "graduation", "programme core", "GPA"],
    relevance: 0.95,
  },
  {
    id: "chunk-grad-2",
    documentId: "doc-grad",
    sectionLabel: "Graduation Eligibility",
    pageLabel: "p. 6",
    preview: "Graduation depends on compulsory subjects, minimum GPA, and clearance of outstanding obligations.",
    fullText:
      "Graduation is subject to completion of all compulsory subjects, attainment of the minimum GPA required by the programme, and clearance of outstanding obligations such as fees or departmental exit requirements.",
    keywords: ["minimum GPA", "compulsory subjects", "graduation"],
    relevance: 0.91,
  },
  {
    id: "chunk-deadline-1",
    documentId: "doc-deadlines",
    sectionLabel: "Add/Drop Period",
    pageLabel: "Week 2",
    preview: "The standard add/drop window closes at 23:59 on the Sunday of teaching week 2.",
    fullText:
      "The standard add/drop window closes at 23:59 on the Sunday of teaching week 2. Students should verify whether intensive or practicum subjects have special arrangements.",
    keywords: ["add/drop", "week 2", "deadline", "late registration"],
    relevance: 0.96,
  },
  {
    id: "chunk-deadline-2",
    documentId: "doc-regulations",
    sectionLabel: "Registration and Subject Adjustment",
    pageLabel: "p. 11",
    preview: "Late changes to study load require approval and may not be granted after assessment begins.",
    fullText:
      "Late changes to study load require formal approval and may not be granted if assessment activities have already commenced.",
    keywords: ["late changes", "study load", "approval"],
    relevance: 0.83,
  },
  {
    id: "chunk-assess-1",
    documentId: "doc-comp",
    sectionLabel: "Assessment Methods",
    pageLabel: "p. 3",
    preview: "A typical COMP subject may use 20% quizzes, 30% project work, and 50% final examination.",
    fullText:
      "A typical COMP subject may use 20% coursework quizzes, 30% project work, and 50% final examination. Some subjects specify a separate minimum pass standard for the final exam.",
    keywords: ["20%", "30%", "50%", "assessment", "final exam"],
    relevance: 0.94,
  },
  {
    id: "chunk-assess-2",
    documentId: "doc-faq",
    sectionLabel: "Continuous Assessment FAQ",
    pageLabel: "Item 7",
    preview: "Assessment weighting can differ across subjects, and rubric details may be updated through the learning platform.",
    fullText:
      "Assessment weighting can differ across subjects, and the department may release updated rubrics or milestone dates through the learning platform.",
    keywords: ["weighting", "rubrics", "subject description"],
    relevance: 0.81,
  },
  {
    id: "chunk-integrity-1",
    documentId: "doc-regulations",
    sectionLabel: "Academic Integrity and Student Conduct",
    pageLabel: "p. 27",
    preview: "Students must acknowledge sources properly and avoid plagiarism, collusion, or unauthorized assistance.",
    fullText:
      "Students must acknowledge sources properly and avoid plagiarism, collusion, fabrication of data, or unauthorized assistance in assessed work.",
    keywords: ["plagiarism", "collusion", "academic integrity", "sources"],
    relevance: 0.93,
  },
  {
    id: "chunk-integrity-2",
    documentId: "doc-faq",
    sectionLabel: "Assessment Integrity FAQ",
    pageLabel: "Item 3",
    preview: "Using external tools without permission may be treated as misconduct.",
    fullText:
      "Using external tools without permission may be treated as misconduct if it conflicts with the stated assessment rules or learning outcomes.",
    keywords: ["misconduct", "assessment rules", "external tools"],
    relevance: 0.87,
  },
  {
    id: "chunk-policy-1",
    documentId: "doc-regulations",
    sectionLabel: "Progression Requirements",
    pageLabel: "p. 15",
    preview: "Students are expected to maintain satisfactory academic standing before moving to advanced study.",
    fullText:
      "Students are expected to maintain satisfactory academic standing and fulfil any progression requirements that apply before moving to advanced study.",
    keywords: ["progression", "academic standing"],
    relevance: 0.72,
  },
];

export const scenarios: MockQueryScenario[] = [
  {
    id: "graduation-requirements",
    question: "What are the graduation requirements for my programme?",
    intent: "graduation",
    scope: "Programme and university requirements",
    keywords: ["graduation", "requirements", "credits", "gpa", "programme"],
    pipeline: [...defaultPipeline],
    evidenceChunkIds: ["chunk-grad-1", "chunk-grad-2", "chunk-policy-1"],
    answers: {
      concise: [
        {
          mode: "concise",
          summary: "For the mock BSc pathway, graduation usually means finishing the full credit load, compulsory subjects, and any GPA or departmental conditions.",
          bullets: [
            "Complete 120 credits across university requirements, core subjects, and electives.",
            "Pass compulsory subjects and clear any outstanding obligations.",
            "Check whether your department adds capstone, WIE, or scheme-specific conditions.",
          ],
          caution: "Programme-specific rules may differ across departments, so this is a demo summary rather than an official confirmation.",
          citations: [
            "BSc Programme Handbook, Section 4.2 Credit Structure",
            "Graduation Requirements Guide, Graduation Eligibility",
          ],
          reliability: "High",
        },
        {
          mode: "concise",
          summary: "The main mock graduation checks are credit completion, compulsory subject completion, and meeting the standing expected by the programme.",
          bullets: [
            "Finish the required credit load.",
            "Meet any stated GPA or academic standing conditions.",
            "Resolve non-academic holds if they affect clearance.",
          ],
          caution: "Accredited schemes may impose extra exit checks.",
          citations: [
            "Graduation Requirements Guide, Graduation Eligibility",
            "PolyU Academic Regulations 2024/25, Progression Requirements",
          ],
          reliability: "High",
        },
      ],
      detailed: [
        {
          mode: "detailed",
          summary: "The mock programme handbook and graduation guide suggest that graduation is decided through a checklist: total credits, required curriculum completion, acceptable standing, and administrative clearance. The UI should present this as a structured overview rather than a one-line rule.",
          bullets: [
            "The handbook shows 120 credits as the normal benchmark for the BSc pathway.",
            "Compulsory subjects must be completed before eligibility is confirmed.",
            "Minimum GPA or standing requirements may apply at programme level.",
            "Administrative clearance such as fees or exit steps can still affect completion timing.",
          ],
          caution: "Final confirmation should still be tied back to the student's own programme handbook.",
          citations: [
            "BSc Programme Handbook, Section 4.2 Credit Structure",
            "Graduation Requirements Guide, Graduation Eligibility",
            "PolyU Academic Regulations 2024/25, Progression Requirements",
          ],
          reliability: "High",
        },
        {
          mode: "detailed",
          summary: "The evidence suggests that graduation is not a single checkpoint but a bundle of academic and administrative requirements. Students should expect credit, curriculum, standing, and clearance checks to work together.",
          bullets: [
            "Credit completion remains the headline requirement.",
            "Compulsory subjects and department-level requirements need to be fulfilled in full.",
            "Academic standing can be reviewed alongside curriculum completion.",
            "Outstanding obligations can delay the final award process.",
          ],
          caution: "Professionally regulated programmes may include additional checks beyond the general mock wording.",
          citations: [
            "Graduation Requirements Guide, Graduation Eligibility",
            "BSc Programme Handbook, Section 4.2 Credit Structure",
          ],
          reliability: "High",
        },
      ],
    },
  },
  {
    id: "add-drop-deadline",
    question: "When is the add/drop deadline?",
    intent: "deadline",
    scope: "Subject registration timeline",
    keywords: ["add/drop", "deadline", "add drop", "subject adjustment", "week 2"],
    pipeline: [...defaultPipeline],
    evidenceChunkIds: ["chunk-deadline-1", "chunk-deadline-2"],
    answers: {
      concise: [
        {
          mode: "concise",
          summary: "The mock semester timeline places the standard add/drop deadline at 23:59 on the Sunday of teaching week 2.",
          bullets: [
            "The main deadline is the end of teaching week 2.",
            "Late changes may require formal approval.",
            "Some intensive or practicum-style subjects may follow adjusted arrangements.",
          ],
          caution: "Always verify faculty-specific exceptions for non-standard teaching modes.",
          citations: [
            "Semester Timeline and Deadlines, Add/Drop Period",
            "PolyU Academic Regulations 2024/25, Registration and Subject Adjustment",
          ],
          reliability: "High",
        },
        {
          mode: "concise",
          summary: "For this demo knowledge base, students should treat the add/drop deadline as the end of week 2 unless their faculty publishes a different schedule.",
          bullets: [
            "Standard cutoff: Sunday of teaching week 2 at 23:59.",
            "Changes after that point move into late approval territory.",
            "Assessment already started may reduce approval chances.",
          ],
          caution: "Late registration and withdrawal rules are different from add/drop rules.",
          citations: [
            "Semester Timeline and Deadlines, Add/Drop Period",
            "PolyU Academic Regulations 2024/25, Registration and Subject Adjustment",
          ],
          reliability: "High",
        },
      ],
      detailed: [
        {
          mode: "detailed",
          summary: "The retrieved mock timeline indicates that the normal add/drop period closes at 23:59 on the Sunday of teaching week 2. The regulations excerpt then clarifies that changes after the published window usually require approval and may be rejected if coursework or assessment has already begun.",
          bullets: [
            "The primary deadline comes from the semester timeline rather than from a general FAQ.",
            "Week 2 is the standard benchmark, but intensive or practicum subjects can have special handling.",
            "Once the deadline passes, students may need late registration, withdrawal, or exceptional approval procedures instead.",
            "The earlier a student acts, the less likely they are to need approval-based exceptions.",
          ],
          caution: "The interface should warn that faculty calendars can override the generic semester schedule.",
          citations: [
            "Semester Timeline and Deadlines, Add/Drop Period",
            "PolyU Academic Regulations 2024/25, Registration and Subject Adjustment",
          ],
          reliability: "High",
        },
        {
          mode: "detailed",
          summary: "The demo evidence supports a clear answer: the standard add/drop window ends on the Sunday of week 2 at 23:59. The supporting regulations also imply that students should not assume late changes are routinely available.",
          bullets: [
            "The semester timeline provides the operational deadline for routine subject changes.",
            "Post-deadline requests shift from routine processing to approval-based handling.",
            "Approval may depend on whether assessment activities have already started.",
            "Non-standard subjects should be checked separately rather than inferred from the generic schedule.",
          ],
          caution: "Students should not use this demo answer as a substitute for the live academic calendar.",
          citations: [
            "Semester Timeline and Deadlines, Add/Drop Period",
            "PolyU Academic Regulations 2024/25, Registration and Subject Adjustment",
          ],
          reliability: "High",
        },
      ],
    },
  },
  {
    id: "assessment-breakdown",
    question: "What is the assessment breakdown for this subject?",
    intent: "course",
    scope: "COMP subject assessment design",
    keywords: ["assessment", "breakdown", "subject", "quiz", "exam", "project"],
    pipeline: [...defaultPipeline],
    evidenceChunkIds: ["chunk-assess-1", "chunk-assess-2"],
    answers: {
      concise: [
        {
          mode: "concise",
          summary: "The mock COMP subject description suggests a common structure of quizzes, project work, and a final exam, with the exam sometimes carrying a separate pass requirement.",
          bullets: [
            "Illustrative weighting: 20% quizzes, 30% project, 50% final exam.",
            "Some subjects require a minimum exam pass mark in addition to the overall total.",
            "Rubrics and milestone dates may be updated through LMS announcements.",
          ],
          caution: "Assessment design varies by subject, so this is a subject-specific example rather than a university-wide rule.",
          citations: [
            "COMP Subject Description, Assessment Methods",
            "Assessment Policy FAQ, Continuous Assessment FAQ",
          ],
          reliability: "Medium",
        },
        {
          mode: "concise",
          summary: "A likely mock assessment mix is continuous coursework plus a final exam, with the subject description acting as the main source of truth.",
          bullets: [
            "The sample weighting shown is 20/30/50 across quizzes, project, and final exam.",
            "Continuous assessment details can still be refined later through rubric notices.",
            "The subject description should be checked before relying on informal notes.",
          ],
          caution: "Project-heavy or lab-heavy subjects may use very different weightings.",
          citations: [
            "COMP Subject Description, Assessment Methods",
            "Assessment Policy FAQ, Continuous Assessment FAQ",
          ],
          reliability: "Medium",
        },
      ],
      detailed: [
        {
          mode: "detailed",
          summary: "The mock evidence points to a typical COMP assessment structure in which coursework and project-based evaluation are combined with a heavily weighted final examination. The subject description is the primary evidence source, while the FAQ adds context about later rubric updates and LMS notices.",
          bullets: [
            "The sample subject description shows a 20% quiz, 30% project, and 50% final examination allocation.",
            "A separate minimum pass standard for the exam component may apply.",
            "The FAQ warns that milestone dates, rubric details, or submission expectations may be updated through the learning platform.",
            "Students should treat the subject description as the baseline policy and announcements as supplementary clarification.",
          ],
          caution: "The answer should signal that the weighting may vary by individual subject offering.",
          citations: [
            "COMP Subject Description, Assessment Methods",
            "Assessment Policy FAQ, Continuous Assessment FAQ",
          ],
          reliability: "Medium",
        },
        {
          mode: "detailed",
          summary: "For a mock COMP subject, the answer should emphasize both weighting and conditions. The retrieved subject description outlines one plausible breakdown, while the FAQ reminds users that continuous assessment expectations can evolve through formally issued clarifications.",
          bullets: [
            "The illustrative weighting model allocates 20% to quizzes, 30% to project work, and 50% to the final exam.",
            "Assessment policy is not only about percentages; pass hurdles and submission rules may matter equally.",
            "Students should expect the subject description to remain the anchor document for grading policy.",
            "Any changes to milestones or rubrics should come from official LMS or teaching team notices.",
          ],
          caution: "Where multiple instructors or groups exist, rubric practice may still differ within the overall framework.",
          citations: [
            "COMP Subject Description, Assessment Methods",
            "Assessment Policy FAQ, Continuous Assessment FAQ",
          ],
          reliability: "Medium",
        },
      ],
    },
  },
  {
    id: "academic-integrity",
    question: "Summarize the academic integrity policy.",
    intent: "compliance",
    scope: "Integrity and misconduct rules",
    keywords: ["integrity", "plagiarism", "policy", "collusion", "misconduct"],
    pipeline: [...defaultPipeline],
    evidenceChunkIds: ["chunk-integrity-1", "chunk-integrity-2"],
    answers: {
      concise: [
        {
          mode: "concise",
          summary: "The mock policy requires proper acknowledgment of sources and prohibits plagiarism, collusion, fabrication, or unauthorized assistance in assessed work.",
          bullets: [
            "Students must credit sources appropriately.",
            "Misconduct can include plagiarism, collusion, and disallowed tool use.",
            "Penalties may range from mark deductions to failure or disciplinary action.",
          ],
          caution: "Acceptable use of external tools can vary by subject, so students should check the assessment brief before relying on them.",
          citations: [
            "PolyU Academic Regulations 2024/25, Academic Integrity and Student Conduct",
            "Assessment Policy FAQ, Assessment Integrity FAQ",
          ],
          reliability: "High",
        },
        {
          mode: "concise",
          summary: "Academic integrity in the mock knowledge base is mainly about honest authorship, proper citation, and respecting assessment-specific rules on collaboration and tool use.",
          bullets: [
            "Acknowledge borrowed ideas and materials.",
            "Do not collaborate or use tools beyond what the assessment allows.",
            "Reported breaches can trigger formal disciplinary review.",
          ],
          caution: "Students should not assume all AI or external resources are automatically permitted.",
          citations: [
            "PolyU Academic Regulations 2024/25, Academic Integrity and Student Conduct",
            "Assessment Policy FAQ, Assessment Integrity FAQ",
          ],
          reliability: "High",
        },
      ],
      detailed: [
        {
          mode: "detailed",
          summary: "The retrieved mock policy frames academic integrity as both a citation issue and a conduct issue. Students are expected to acknowledge sources correctly, avoid plagiarism and collusion, and refrain from using materials or tools that are not authorized by the assessment conditions.",
          bullets: [
            "Proper attribution is the minimum baseline for written, technical, and project submissions.",
            "Plagiarism, collusion, fabrication of data, and unauthorized assistance are all treated as integrity risks.",
            "Assessment conditions matter: a tool may be acceptable in one subject and disallowed in another.",
            "Potential consequences include penalties on marks, failure of the assessment, or escalation to disciplinary procedures.",
          ],
          caution: "The answer should guide students toward the relevant subject brief because integrity expectations are often tightened at the assessment level.",
          citations: [
            "PolyU Academic Regulations 2024/25, Academic Integrity and Student Conduct",
            "Assessment Policy FAQ, Assessment Integrity FAQ",
          ],
          reliability: "High",
        },
        {
          mode: "detailed",
          summary: "In this demo, academic integrity is best presented as a risk-management policy for assessed work. The regulations define core misconduct categories, while the FAQ highlights the practical rule that students must align their working methods with the permissions written into the assessment brief.",
          bullets: [
            "Source acknowledgment and honest authorship are central expectations.",
            "Plagiarism and collusion remain the clearest examples of prohibited behavior, but unauthorized tool use can also fall under misconduct.",
            "Students should check whether the assessment allows external references, code reuse, proofreading support, or generative tools.",
            "Departments may escalate suspected breaches through formal review processes with meaningful academic consequences.",
          ],
          caution: "The safest behavior is to clarify uncertainty before submission rather than assume a tool or collaboration pattern is permitted.",
          citations: [
            "PolyU Academic Regulations 2024/25, Academic Integrity and Student Conduct",
            "Assessment Policy FAQ, Assessment Integrity FAQ",
          ],
          reliability: "High",
        },
      ],
    },
  },
  {
    id: "no-results",
    question: "Is there a guaranteed scholarship policy for exchange housing?",
    intent: "policy",
    scope: "Unsupported topic",
    keywords: ["scholarship", "housing", "hall", "residence", "exchange"],
    pipeline: [...defaultPipeline],
    evidenceChunkIds: [],
    answers: {
      concise: [
        {
          mode: "concise",
          summary: "No relevant documents were found in the current mock academic knowledge base for that question.",
          bullets: [
            "The demo index focuses on academic regulations, programme documents, subject descriptions, deadlines, and FAQs.",
            "Housing or scholarship materials are not included in this simulated dataset.",
            "Try narrowing the question to an academic policy, subject rule, or published deadline.",
          ],
          caution: "This is a mock no-results state and is included to demonstrate graceful failure handling.",
          citations: [],
          reliability: "Low",
        },
      ],
      detailed: [
        {
          mode: "detailed",
          summary: "The current demo dataset does not contain relevant evidence for exchange housing scholarship policy, so the assistant should avoid fabricating an answer. Instead, it should state that no supporting documents were retrieved and guide the user toward supported academic categories or an administrative office.",
          bullets: [
            "The indexed mock corpus is limited to academic and teaching-related documents.",
            "No evidence chunks matched the housing or scholarship topic strongly enough to support an answer.",
            "A safe fallback is to suggest contacting the responsible office or searching a separate administrative portal.",
            "The UI should clearly signal low reliability and incomplete document coverage in this state.",
          ],
          caution: "A trustworthy RAG assistant should surface uncertainty rather than infer unsupported policy details.",
          citations: [],
          reliability: "Low",
        },
      ],
    },
    noResults: true,
  },
];

function buildPresetMessages(scenarioId: string, question: string, timestampBase: string): ChatMessage[] {
  return [
    { id: `${scenarioId}-user`, role: "user", text: question, timestamp: timestampBase },
    { id: `${scenarioId}-assistant`, role: "assistant", timestamp: timestampBase, scenarioId, variantIndex: 0 },
  ];
}

export const conversationPresets: ConversationPreset[] = [
  {
    id: "preset-grad",
    title: "Graduation Checklist",
    subtitle: "Credit and eligibility overview",
    scenarioId: "graduation-requirements",
    messages: buildPresetMessages("graduation-requirements", scenarios[0].question, "09:12"),
  },
  {
    id: "preset-deadline",
    title: "Add/Drop Timing",
    subtitle: "Semester schedule snapshot",
    scenarioId: "add-drop-deadline",
    messages: buildPresetMessages("add-drop-deadline", scenarios[1].question, "10:03"),
  },
  {
    id: "preset-assessment",
    title: "Subject Assessment",
    subtitle: "COMP weighting summary",
    scenarioId: "assessment-breakdown",
    messages: buildPresetMessages("assessment-breakdown", scenarios[2].question, "13:47"),
  },
  {
    id: "preset-integrity",
    title: "Integrity Policy",
    subtitle: "Citation and misconduct rules",
    scenarioId: "academic-integrity",
    messages: buildPresetMessages("academic-integrity", scenarios[3].question, "16:20"),
  },
];

export const suggestedQuestions = [
  scenarios[0].question,
  scenarios[1].question,
  scenarios[2].question,
  scenarios[3].question,
  "What are the late registration rules?",
];

export const exampleChips = ["Graduation requirements", "Assessment methods", "Internship policy", "Add/drop deadline"];

export const quickActions = [
  {
    title: "Graduation Requirements",
    description: "Review credits, GPA expectations, and compulsory subject completion.",
    scenarioId: "graduation-requirements",
  },
  {
    title: "Assessment Breakdown",
    description: "Inspect a COMP subject's mock weighting, pass hurdles, and rubric notes.",
    scenarioId: "assessment-breakdown",
  },
  {
    title: "Add/Drop Deadline",
    description: "See the standard week 2 cut-off and late-change considerations.",
    scenarioId: "add-drop-deadline",
  },
  {
    title: "Academic Integrity",
    description: "Summarize plagiarism, collusion, and authorized tool-use expectations.",
    scenarioId: "academic-integrity",
  },
];

export const savedQueries = [
  "Can I overload credits in semester 2?",
  "What is the reassessment policy?",
  "Do COMP subjects require exam pass thresholds?",
];

export const mockStudent = {
  name: "Annie Chan",
  programme: "BSc (Hons) in Computing",
  year: "Year 3",
  studentId: "24012345D",
};

export function getScenarioById(scenarioId?: string): MockQueryScenario | undefined {
  return scenarios.find((scenario) => scenario.id === scenarioId);
}

export function getScenarioForQuestion(question: string): MockQueryScenario {
  const lowered = question.toLowerCase();
  const matchedScenario = scenarios.find((scenario) =>
    scenario.keywords.some((keyword) => lowered.includes(keyword.toLowerCase())),
  );

  return matchedScenario ?? scenarios.find((scenario) => scenario.id === "no-results")!;
}

export function getDocumentById(documentId: string) {
  return documents.find((document) => document.id === documentId);
}

export function getChunksForScenario(scenario?: MockQueryScenario) {
  if (!scenario) {
    return [];
  }

  return scenario.evidenceChunkIds
    .map((chunkId) => chunks.find((chunk) => chunk.id === chunkId))
    .filter((chunk): chunk is ChunkRecord => Boolean(chunk));
}

export function getAverageCoverage(): number {
  const total = documents.reduce((sum, document) => sum + document.coverage, 0);
  return total / documents.length;
}

export function getLatestKnowledgeBaseUpdate(): string {
  return [...documents].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0].updatedAt;
}

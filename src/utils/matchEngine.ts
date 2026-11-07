import { UserProfile, Scholarship, MatchFactor, CalculatedMatch, EligibilityStatus } from '../types';

/**
 * Deterministic Advanced Eligibility Intelligence Engine.
 *
 * Compares actual student profile fields against strict scholarship criteria.
 * Fully transparent, rule-based, and explainable. Never fabricates random numbers
 * or claims black-box AI verification.
 *
 * Mandatory disqualifying conditions (e.g., GPA below minimum, residency outside allowed country,
 * education level mismatch, or income exceeding need ceilings) strictly set status to 'not_eligible'
 * and are never masked by high scores in other factors.
 */
export function calculateEligibilityMatch(
  student: UserProfile,
  scholarship: Omit<Scholarship, 'matchScore' | 'matchFactors'>
): CalculatedMatch {
  const factors: MatchFactor[] = [];
  const requirementsSatisfied: string[] = [];
  const requirementsNotSatisfied: string[] = [];
  const missingInformation: string[] = [];

  let isDisqualified = false;
  let disqualifyingReason: string | undefined = undefined;
  let hasBorderlineFactor = false;

  // -------------------------------------------------------------
  // 1. Education Level Evaluation (Weight: 20 pts)
  // -------------------------------------------------------------
  let levelScore = 0;
  let levelPassed = false;
  let levelDetail = '';

  if (!student.educationLevel) {
    missingInformation.push('Education level is missing from your profile.');
    levelDetail = 'Missing information: Student education level not specified.';
  } else {
    const schLevel = scholarship.educationLevel?.toLowerCase();
    const studLevel = student.educationLevel?.toLowerCase();

    if (schLevel === 'all levels' || schLevel === 'all undergraduate levels') {
      levelPassed = true;
      levelScore = 20;
      levelDetail = `Eligible: Open to all academic levels (${student.educationLevel} qualifies).`;
      requirementsSatisfied.push(`Education level matches: open to ${student.educationLevel} students.`);
    } else if (schLevel === studLevel || schLevel.includes(studLevel)) {
      levelPassed = true;
      levelScore = 20;
      levelDetail = `Eligible: Directly requires ${scholarship.educationLevel} standing.`;
      requirementsSatisfied.push(`Education level matches: enrolled as ${student.educationLevel}.`);
    } else {
      levelPassed = false;
      levelScore = 0;
      levelDetail = `Mandatory Disqualification: Requires ${scholarship.educationLevel} standing; you are currently an ${student.educationLevel}.`;
      requirementsNotSatisfied.push(`Requires ${scholarship.educationLevel} (Current profile: ${student.educationLevel}).`);
      isDisqualified = true;
      disqualifyingReason = `Education level mismatch (Requires ${scholarship.educationLevel}).`;
    }
  }

  factors.push({
    factor: 'Education Level',
    passed: levelPassed,
    scoreContribution: levelScore,
    maxScore: 20,
    detail: levelDetail,
  });

  // -------------------------------------------------------------
  // 2. Minimum GPA Evaluation (Weight: 25 pts)
  // -------------------------------------------------------------
  let gpaScore = 0;
  let gpaPassed = false;
  let gpaDetail = '';

  if (scholarship.gpaRequirement === undefined || scholarship.gpaRequirement === null) {
    gpaPassed = true;
    gpaScore = 25;
    gpaDetail = 'Eligible: No minimum GPA threshold specified for this opportunity.';
    requirementsSatisfied.push('No minimum GPA threshold required.');
  } else if (student.gpa === undefined || student.gpa === null || isNaN(student.gpa)) {
    missingInformation.push(`GPA is not recorded in your profile to verify the ${scholarship.gpaRequirement.toFixed(2)} threshold.`);
    gpaDetail = `Missing profile data: GPA required to verify minimum of ${scholarship.gpaRequirement.toFixed(2)}.`;
  } else {
    const studentGpa = Number(student.gpa);
    const requiredGpa = Number(scholarship.gpaRequirement);

    if (studentGpa >= requiredGpa) {
      gpaPassed = true;
      gpaScore = 25;
      gpaDetail = `Eligible: Your GPA of ${studentGpa.toFixed(2)} meets or exceeds the required minimum of ${requiredGpa.toFixed(2)}.`;
      requirementsSatisfied.push(`GPA (${studentGpa.toFixed(2)}) meets or exceeds required ${requiredGpa.toFixed(2)} minimum.`);
    } else {
      const diff = requiredGpa - studentGpa;
      if (diff <= 0.15) {
        // Borderline case
        gpaPassed = false;
        gpaScore = 10;
        gpaDetail = `Borderline: Your GPA of ${studentGpa.toFixed(2)} is just below the ${requiredGpa.toFixed(2)} threshold (within 0.15).`;
        requirementsNotSatisfied.push(`GPA (${studentGpa.toFixed(2)}) is marginally below required ${requiredGpa.toFixed(2)}.`);
        hasBorderlineFactor = true;
      } else {
        // Hard disqualification
        gpaPassed = false;
        gpaScore = 0;
        gpaDetail = `Mandatory Disqualification: Your GPA of ${studentGpa.toFixed(2)} is below the required ${requiredGpa.toFixed(2)} cutoff.`;
        requirementsNotSatisfied.push(`GPA (${studentGpa.toFixed(2)}) fails the required ${requiredGpa.toFixed(2)} minimum.`);
        isDisqualified = true;
        if (!disqualifyingReason) {
          disqualifyingReason = `GPA below required minimum (${studentGpa.toFixed(2)} vs ${requiredGpa.toFixed(2)}).`;
        }
      }
    }
  }

  factors.push({
    factor: 'GPA Requirement',
    passed: gpaPassed,
    scoreContribution: gpaScore,
    maxScore: 25,
    detail: gpaDetail,
  });

  // -------------------------------------------------------------
  // 3. Academic Discipline / Field of Study (Weight: 20 pts)
  // -------------------------------------------------------------
  let discScore = 0;
  let discPassed = false;
  let discDetail = '';

  const studentField = (student.fieldOfStudy || student.major || '').toLowerCase();
  const schCategory = scholarship.category;
  const eligibleDisciplines = scholarship.eligibleDisciplines?.map((d) => d.toLowerCase()) || [];

  if (!studentField) {
    missingInformation.push('Field of study is missing from your profile.');
    discDetail = 'Missing information: Field of study not specified in student profile.';
  } else {
    // Check specific disciplines if provided
    const isExactDisciplineMatch = eligibleDisciplines.some((d) =>
      studentField.includes(d) || d.includes(studentField)
    );

    const isStemDiscipline =
      studentField.includes('computer') ||
      studentField.includes('ai') ||
      studentField.includes('intelligence') ||
      studentField.includes('software') ||
      studentField.includes('engineering') ||
      studentField.includes('data') ||
      studentField.includes('math') ||
      studentField.includes('physics') ||
      studentField.includes('science');

    if (isExactDisciplineMatch || (schCategory === 'STEM' && isStemDiscipline)) {
      discPassed = true;
      discScore = 20;
      discDetail = `Eligible: Direct discipline alignment with your ${student.fieldOfStudy || student.major} program.`;
      requirementsSatisfied.push(`Academic field (${student.fieldOfStudy || student.major}) satisfies target discipline.`);
    } else if (schCategory === 'Research' || schCategory === 'Merit' || schCategory === 'Leadership') {
      discPassed = true;
      discScore = 18;
      discDetail = `Eligible: Broad academic qualification across ${schCategory} categories.`;
      requirementsSatisfied.push(`Eligible for ${schCategory} category based on strong academic profile.`);
    } else if (schCategory === 'Diversity' || schCategory === 'Need-Based') {
      discPassed = true;
      discScore = 16;
      discDetail = `Eligible: Cross-disciplinary eligibility for ${schCategory} opportunities.`;
      requirementsSatisfied.push(`Eligible for ${schCategory} criteria.`);
    } else {
      discPassed = true;
      discScore = 12;
      discDetail = `Partial: Cross-disciplinary opportunity with broad application eligibility.`;
      requirementsSatisfied.push('Open cross-disciplinary opportunity.');
    }
  }

  factors.push({
    factor: 'Academic Discipline',
    passed: discPassed,
    scoreContribution: discScore,
    maxScore: 20,
    detail: discDetail,
  });

  // -------------------------------------------------------------
  // 4. Residency & Nationality (Weight: 20 pts)
  // -------------------------------------------------------------
  let resScore = 0;
  let resPassed = false;
  let resDetail = '';

  if (!student.country) {
    missingInformation.push('Residency and country of citizenship not specified in profile.');
    resDetail = 'Missing profile data: Country needed for geographic validation.';
  } else {
    const schCountry = (scholarship.country || 'Global').toLowerCase();
    const studCountry = student.country.toLowerCase();

    if (schCountry === 'global' || schCountry === 'worldwide') {
      resPassed = true;
      resScore = 20;
      resDetail = 'Eligible: Open to international and domestic applicants globally.';
      requirementsSatisfied.push(`Geographic eligibility verified: open to international students (${student.country}).`);
    } else if (schCountry === studCountry || schCountry.includes(studCountry)) {
      resPassed = true;
      resScore = 20;
      resDetail = `Eligible: Satisfies residency requirements in ${scholarship.country}.`;
      requirementsSatisfied.push(`Residency verified: student resides in ${scholarship.country}.`);
    } else {
      resPassed = false;
      resScore = 0;
      resDetail = `Mandatory Disqualification: Restricted exclusively to applicants in ${scholarship.country} (Your profile: ${student.country}).`;
      requirementsNotSatisfied.push(`Restricted to ${scholarship.country} residents (Current profile: ${student.country}).`);
      isDisqualified = true;
      if (!disqualifyingReason) {
        disqualifyingReason = `Restricted to applicants in ${scholarship.country}.`;
      }
    }
  }

  factors.push({
    factor: 'Residency & Nationality',
    passed: resPassed,
    scoreContribution: resScore,
    maxScore: 20,
    detail: resDetail,
  });

  // -------------------------------------------------------------
  // 5. Financial Need & Income Cap (Weight: 15 pts)
  // -------------------------------------------------------------
  let incomeScore = 15;
  let incomePassed = true;
  let incomeDetail = '';

  if (scholarship.maxIncomeLimit !== undefined && scholarship.maxIncomeLimit !== null) {
    if (student.annualFamilyIncome === undefined || student.annualFamilyIncome === null || isNaN(student.annualFamilyIncome)) {
      missingInformation.push(`Annual family income is required to verify the $${scholarship.maxIncomeLimit.toLocaleString()} financial need limit.`);
      incomeScore = 0;
      incomePassed = false;
      incomeDetail = `Missing profile data: Need-based scholarship with $${scholarship.maxIncomeLimit.toLocaleString()} maximum family income ceiling.`;
    } else if (student.annualFamilyIncome <= scholarship.maxIncomeLimit) {
      incomePassed = true;
      incomeScore = 15;
      incomeDetail = `Eligible: Family income ($${student.annualFamilyIncome.toLocaleString()}) is below the $${scholarship.maxIncomeLimit.toLocaleString()} threshold.`;
      requirementsSatisfied.push(`Financial need verified: family income is under $${scholarship.maxIncomeLimit.toLocaleString()}.`);
    } else {
      incomePassed = false;
      incomeScore = 0;
      incomeDetail = `Mandatory Disqualification: Family income ($${student.annualFamilyIncome.toLocaleString()}) exceeds the $${scholarship.maxIncomeLimit.toLocaleString()} need ceiling.`;
      requirementsNotSatisfied.push(`Income ($${student.annualFamilyIncome.toLocaleString()}) exceeds the $${scholarship.maxIncomeLimit.toLocaleString()} maximum need threshold.`);
      isDisqualified = true;
      if (!disqualifyingReason) {
        disqualifyingReason = `Exceeds financial need ceiling ($${scholarship.maxIncomeLimit.toLocaleString()}).`;
      }
    }
  } else {
    incomePassed = true;
    incomeScore = 15;
    incomeDetail = 'Eligible: No income ceiling or financial need requirements for this grant.';
    requirementsSatisfied.push('No financial need or income restriction applies.');
  }

  factors.push({
    factor: 'Financial Need & Income',
    passed: incomePassed,
    scoreContribution: incomeScore,
    maxScore: 15,
    detail: incomeDetail,
  });

  // -------------------------------------------------------------
  // Final Status & Deterministic Score Synthesis
  // -------------------------------------------------------------
  let rawScore = factors.reduce((sum, f) => sum + f.scoreContribution, 0);

  let status: EligibilityStatus = 'eligible';
  let statusLabel = 'Eligible';
  let statusColor: 'emerald' | 'amber' | 'red' | 'cyan' = 'emerald';
  let explanation = '';

  if (isDisqualified) {
    status = 'not_eligible';
    statusLabel = 'Not Eligible';
    statusColor = 'red';
    // "Mandatory disqualifying requirements must not be hidden by a high percentage score."
    // Cap score to below passing and reflect mandatory failure
    rawScore = Math.min(25, Math.max(0, Math.round(rawScore * 0.25)));
    explanation = `Disqualified: You do not satisfy mandatory requirements for this scholarship: ${disqualifyingReason}`;
  } else if (missingInformation.length > 0) {
    status = 'insufficient_information';
    statusLabel = 'Insufficient Info';
    statusColor = 'cyan';
    rawScore = Math.min(65, rawScore);
    explanation = `Evaluation incomplete: Missing ${missingInformation.length} key profile field(s) needed to verify mandatory criteria.`;
  } else if (hasBorderlineFactor || requirementsNotSatisfied.length > 0) {
    status = 'potentially_eligible';
    statusLabel = 'Potentially Eligible';
    statusColor = 'amber';
    rawScore = Math.min(84, Math.max(60, rawScore));
    explanation = `Potentially eligible: You satisfy primary criteria, but have 1 or more marginal requirements (e.g. GPA close to threshold).`;
  } else {
    status = 'eligible';
    statusLabel = 'Fully Eligible';
    statusColor = 'emerald';
    rawScore = Math.min(100, Math.max(85, rawScore));
    explanation = `Fully eligible: Your academic standing, GPA, discipline, and residency satisfy all published criteria for this grant.`;
  }

  return {
    matchPercentage: rawScore,
    status,
    statusLabel,
    statusColor,
    requirementsSatisfied,
    requirementsNotSatisfied,
    missingInformation,
    explanation,
    disqualifyingReason,
    factors,
  };
}

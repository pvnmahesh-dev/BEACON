import {
  EssayTone,
  EssayCritiqueResult,
  EssayCritiqueFactor
} from '../types';

/**
 * Deterministic & Explainable AI Essay Evaluation Engine
 * Evaluates essay text across 4 transparent rubric dimensions:
 * 1. Structure & Narrative Arc
 * 2. Impact & Specificity (Quantifiable Metrics)
 * 3. Academic Clarity & Sentence Cadence
 * 4. Tone & Voice Alignment
 */

export const analyzeEssayText = (
  text: string,
  targetWordCount: number,
  tone: EssayTone = 'Academic'
): EssayCritiqueResult => {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      overallScore: 0,
      strengthLabel: 'Needs Revision',
      wordCount: 0,
      targetWordCount,
      characterCount: 0,
      readingTimeMinutes: 0,
      factors: [
        {
          name: 'Structure & Narrative Flow',
          score: 0,
          weight: 25,
          status: 'needs_work',
          feedback: 'No draft content detected.',
          actionItem: 'Begin by outlining your introductory hook or problem statement.',
        },
        {
          name: 'Impact & Concrete Specificity',
          score: 0,
          weight: 30,
          status: 'needs_work',
          feedback: 'No project evidence or metrics provided.',
          actionItem: 'Include specific numbers, percentages, and named project milestones.',
        },
        {
          name: 'Clarity & Cadence',
          score: 0,
          weight: 25,
          status: 'needs_work',
          feedback: 'Awaiting paragraph content.',
          actionItem: 'Maintain concise sentences with balanced transition words.',
        },
        {
          name: 'Tone Alignment',
          score: 0,
          weight: 20,
          status: 'needs_work',
          feedback: 'Tone will be evaluated upon text entry.',
          actionItem: `Ensure vocabulary matches the chosen ${tone} profile.`,
        },
      ],
      strengths: [],
      recommendations: ['Start drafting your essay or select an outline template.'],
    };
  }

  // 1. Text Metrics
  const words = trimmed.match(/\S+/g) || [];
  const wordCount = words.length;
  const characterCount = trimmed.length;
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphCount = paragraphs.length;
  const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
  const sentenceCount = sentences.length;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // 2. Word Count Compliance Score
  const wordRatio = targetWordCount > 0 ? wordCount / targetWordCount : 1;
  let wordCountScore = 100;
  if (wordRatio < 0.4) wordCountScore = 30;
  else if (wordRatio < 0.7) wordCountScore = 65;
  else if (wordRatio < 0.9) wordCountScore = 85;
  else if (wordRatio <= 1.1) wordCountScore = 100;
  else if (wordRatio <= 1.25) wordCountScore = 85;
  else wordCountScore = 60; // over limit penalty

  // 3. Structure & Narrative Flow (25% weight)
  let structurePoints = 50;
  if (paragraphCount >= 3 && paragraphCount <= 6) structurePoints += 25;
  else if (paragraphCount >= 2) structurePoints += 15;

  const hasIntroKeywords = /problem|curiosity|challenge|passion|bottleneck|mission|foundation|began/i.test(paragraphs[0] || '');
  if (hasIntroKeywords) structurePoints += 15;

  const hasConclusionKeywords = /forward|aspiration|future|goal|aim|conclude|commitment|backing/i.test(paragraphs[paragraphs.length - 1] || '');
  if (hasConclusionKeywords) structurePoints += 10;

  const structureScore = Math.min(100, Math.round(structurePoints * 0.7 + wordCountScore * 0.3));

  // 4. Impact & Specificity (30% weight)
  // Check for quantified numbers, metrics, currency, percentages
  const metricsMatches = trimmed.match(/\b\d+(\.\d+)?%|\$\d+([,\d]+)?|\b\d{2,}\b/g) || [];
  const metricsCount = metricsMatches.length;

  const technicalKeywords = [
    'research', 'developed', 'algorithm', 'investigation', 'benchmark', 'deployed',
    'framework', 'compiler', 'supervised', 'quantum', 'simulation', 'laboratory',
    'analysis', 'optimization', 'published', 'achieved', 'pipeline', 'empirical'
  ];
  let techKeywordMatches = 0;
  technicalKeywords.forEach((kw) => {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(trimmed)) techKeywordMatches++;
  });

  let impactPoints = 40;
  if (metricsCount >= 4) impactPoints += 30;
  else if (metricsCount >= 2) impactPoints += 20;
  else if (metricsCount >= 1) impactPoints += 10;

  if (techKeywordMatches >= 6) impactPoints += 30;
  else if (techKeywordMatches >= 3) impactPoints += 20;
  else impactPoints += 10;

  const impactScore = Math.min(100, impactPoints);

  // 5. Academic Clarity & Cadence (25% weight)
  const transitionWords = [
    'furthermore', 'however', 'consequently', 'specifically', 'moreover',
    'crucially', 'by contrast', 'in addition', 'ultimately', 'therefore',
    'during', 'faced with', 'looking forward'
  ];
  let transitionMatches = 0;
  transitionWords.forEach((tw) => {
    if (new RegExp(`\\b${tw}\\b`, 'i').test(trimmed)) transitionMatches++;
  });

  let clarityPoints = 50;
  // Ideal sentence length in academic writing is 14 - 24 words
  if (avgSentenceLength >= 14 && avgSentenceLength <= 25) clarityPoints += 25;
  else if (avgSentenceLength >= 10 && avgSentenceLength <= 30) clarityPoints += 15;
  else clarityPoints += 5; // runaway or choppy sentences

  if (transitionMatches >= 4) clarityPoints += 25;
  else if (transitionMatches >= 2) clarityPoints += 15;
  else clarityPoints += 5;

  const clarityScore = Math.min(100, clarityPoints);

  // 6. Tone & Voice Alignment (20% weight)
  let tonePoints = 65;
  if (tone === 'Academic') {
    const academicTerms = /empirical|investigation|theoretical|methodology|hypothesis|systematic|consequence|rigor/i;
    if (academicTerms.test(trimmed)) tonePoints += 25;
    if (!/gonna|wanna|stuff|cool|awesome|huge/i.test(trimmed)) tonePoints += 10;
  } else if (tone === 'Persuasive') {
    const persuasiveTerms = /compelling|imperative|crucial|conclusively|cemented|demonstrate|resolve/i;
    if (persuasiveTerms.test(trimmed)) tonePoints += 25;
    if (metricsCount >= 2) tonePoints += 10;
  } else if (tone === 'Visionary') {
    const visionaryTerms = /future|frontier|transform|paradigm|pioneer|aspire|horizon|trajectory/i;
    if (visionaryTerms.test(trimmed)) tonePoints += 25;
    tonePoints += 10;
  } else {
    // Storytelling
    const storyTerms = /during|faced with|recognized|discovered|journey|moment|team|dawn/i;
    if (storyTerms.test(trimmed)) tonePoints += 25;
    tonePoints += 10;
  }
  const toneScore = Math.min(100, tonePoints);

  // 7. Overall Weighted Calculation
  const overallScore = Math.round(
    structureScore * 0.25 +
    impactScore * 0.30 +
    clarityScore * 0.25 +
    toneScore * 0.20
  );

  let strengthLabel: EssayCritiqueResult['strengthLabel'] = 'Needs Revision';
  if (overallScore >= 88) strengthLabel = 'Highly Competitive';
  else if (overallScore >= 78) strengthLabel = 'Competitive';
  else if (overallScore >= 65) strengthLabel = 'Promising';

  // 8. Granular Factors
  const factors: EssayCritiqueFactor[] = [
    {
      name: 'Structure & Narrative Arc',
      score: structureScore,
      weight: 25,
      status: structureScore >= 85 ? 'excellent' : structureScore >= 70 ? 'good' : 'needs_work',
      feedback:
        paragraphCount >= 3
          ? `Well-balanced ${paragraphCount}-paragraph architecture with distinct introduction and forward-looking conclusion.`
          : 'Draft needs greater structural division. Aim for a distinct hook, body evidence, and conclusion.',
      actionItem:
        hasConclusionKeywords
          ? 'Strong concluding vision in final paragraph.'
          : 'Reinforce your closing paragraph by connecting directly to future fellowship outcomes.',
    },
    {
      name: 'Impact & Concrete Specificity',
      score: impactScore,
      weight: 30,
      status: impactScore >= 85 ? 'excellent' : impactScore >= 70 ? 'good' : 'needs_work',
      feedback:
        metricsCount >= 3
          ? `Excellent technical density with ${metricsCount} concrete numbers/percentages and named achievements.`
          : `Detected only ${metricsCount} concrete metrics. Strong scholarship essays require quantifiable project outcomes.`,
      actionItem:
        metricsCount >= 3
          ? 'Keep these quantifiable benchmarks; scholarship reviewers reward verified numerical outcomes.'
          : 'Add specific percentages, benchmark speedups, dollar impacts, or cohort sizes to prove research rigor.',
    },
    {
      name: 'Clarity & Academic Cadence',
      score: clarityScore,
      weight: 25,
      status: clarityScore >= 85 ? 'excellent' : clarityScore >= 70 ? 'good' : 'needs_work',
      feedback:
        avgSentenceLength >= 14 && avgSentenceLength <= 25
          ? `Optimal sentence length (avg ${avgSentenceLength.toFixed(1)} words/sentence) with ${transitionMatches} logical transition bridges.`
          : `Average sentence length is ${avgSentenceLength.toFixed(1)} words. Aim for 16-22 words per sentence for seamless readability.`,
      actionItem:
        transitionMatches >= 3
          ? 'Smooth argumentative flow across all paragraphs.'
          : 'Incorporate transition phrases (e.g. "Furthermore", "Consequently", "Crucially") to guide the reader.',
    },
    {
      name: `${tone} Tone Consistency`,
      score: toneScore,
      weight: 20,
      status: toneScore >= 85 ? 'excellent' : toneScore >= 70 ? 'good' : 'needs_work',
      feedback: `Maintains a consistent, dignified ${tone.toLowerCase()} voice suitable for elite academic review committees.`,
      actionItem: `Ensure every paragraph reflects the ${tone.toLowerCase()} ethos of your application dossier.`,
    },
  ];

  // 9. Strengths & Recommendations Lists
  const strengths: string[] = [];
  if (impactScore >= 80) strengths.push('High concentration of verifiable project metrics and empirical benchmarks.');
  if (structureScore >= 80) strengths.push('Clear thematic arc connecting personal curiosity to sponsor mission.');
  if (clarityScore >= 80) strengths.push('Sophisticated academic vocabulary without excessive bureaucratic jargon.');
  if (wordCount >= targetWordCount * 0.85 && wordCount <= targetWordCount * 1.1) {
    strengths.push(`Word count is within the target window (${wordCount} / ${targetWordCount} words).`);
  }

  const recommendations: string[] = [];
  if (wordCount < targetWordCount * 0.75) {
    recommendations.push(`Expand draft by approximately ${Math.round(targetWordCount * 0.85 - wordCount)} words to address all outline sections.`);
  } else if (wordCount > targetWordCount * 1.1) {
    recommendations.push(`Trim draft by ${wordCount - targetWordCount} words to stay strictly within provider cutoff limits.`);
  }

  if (metricsCount < 3) {
    recommendations.push('Quantify at least two technical accomplishments (e.g. "% latency reduction", "hardware benchmark", "sample size").');
  }

  if (!hasConclusionKeywords) {
    recommendations.push('Strengthen final paragraph: explain explicitly how the scholarship funds will be spent.');
  }

  return {
    overallScore,
    strengthLabel,
    wordCount,
    targetWordCount,
    characterCount,
    readingTimeMinutes,
    factors,
    strengths: strengths.length > 0 ? strengths : ['Draft is structured and readable.'],
    recommendations: recommendations.length > 0 ? recommendations : ['Excellent essay ready for committee submission.'],
  };
};


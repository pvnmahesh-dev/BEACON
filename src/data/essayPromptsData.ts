import { EssayPrompt, EssayDraft } from '../types';

export const scholarshipEssayPrompts: EssayPrompt[] = [
  {
    id: 'prompt-quantum',
    scholarshipId: 'sch-3',
    scholarshipTitle: 'NextGen Quantum Computing Award',
    provider: 'Quantum Computing Foundation',
    promptText:
      'Describe your intended research contribution to scalable quantum error correction or algorithmic complexity. Explain how this fellowship funding will accelerate your academic trajectory and benefit the broader scientific community.',
    targetWordCount: 750,
    minWordCount: 500,
    maxWordCount: 800,
    suggestedOutline: [
      {
        section: '1. Academic Hook & Core Mission',
        focus: 'Introduce the critical bottleneck in NISQ quantum hardware and your personal research fascination.',
        targetWords: 150,
      },
      {
        section: '2. Technical Methodology & Project Experience',
        focus: 'Detail specific algorithmic optimizations, surface code simulator benchmarks, and laboratory findings.',
        targetWords: 250,
      },
      {
        section: '3. Strategic Resource Allocation',
        focus: 'Explain specifically how the $50,000 funding will finance quantum simulator access and hardware testing.',
        targetWords: 175,
      },
      {
        section: '4. Scientific Impact & Future Vision',
        focus: 'Conclude with open-source dissemination plans and your long-term goal as a quantum research lead.',
        targetWords: 175,
      },
    ],
  },
  {
    id: 'prompt-deepmind',
    scholarshipId: 'sch-4',
    scholarshipTitle: 'Google DeepMind AI Research Fellowship',
    provider: 'Google DeepMind Academic Council',
    promptText:
      'Detail a pressing foundational challenge in multimodal reasoning or embodied intelligence you intend to investigate. Outline your methodological framework, preliminary findings, and how your approach upholds ethical AI principles.',
    targetWordCount: 1000,
    minWordCount: 750,
    maxWordCount: 1100,
    suggestedOutline: [
      {
        section: '1. Problem Statement & Theoretical Horizon',
        focus: 'Formulate the limitation of current transformer-based autoregressive models in causal multimodal reasoning.',
        targetWords: 200,
      },
      {
        section: '2. Mathematical Formulation & Architecture',
        focus: 'Detail proposed latent world-model state spaces, attention sparsity theorems, and cross-attention benchmarks.',
        targetWords: 350,
      },
      {
        section: '3. Ethical Alignment & Societal Safety',
        focus: 'Explain robustness verification, bias audits, and guardrails against hallucination.',
        targetWords: 200,
      },
      {
        section: '4. Academic Trajectory & Mentorship Alignment',
        focus: 'Articulate why DeepMind researcher mentorship is the optimal crucible for your doctoral investigations.',
        targetWords: 250,
      },
    ],
  },
  {
    id: 'prompt-stem-leadership',
    scholarshipId: 'sch-1',
    scholarshipTitle: 'Global STEM Leadership Fellowship',
    provider: 'Global Science Institute',
    promptText:
      'Leadership in science requires technical rigor paired with collaborative problem-solving. Recount an instance where you navigated an unexpected technical or collaborative roadblock, and how that experience informs your scientific leadership.',
    targetWordCount: 500,
    minWordCount: 350,
    maxWordCount: 600,
    suggestedOutline: [
      {
        section: '1. Incident Setting & Challenge Context',
        focus: 'Set the stage: robotics team deadline or lab equipment failure under severe temporal pressure.',
        targetWords: 100,
      },
      {
        section: '2. Collaborative Intervention & Strategy',
        focus: 'How you restructured task pipelines, aligned conflicting opinions, and devised an algorithmic workaround.',
        targetWords: 200,
      },
      {
        section: '3. Quantifiable Result & Enduring Lesson',
        focus: 'Project outcome (speedup, deployment, awards) and the leadership ethos you bring to your future cohort.',
        targetWords: 200,
      },
    ],
  },
  {
    id: 'prompt-turing',
    scholarshipId: 'sch-2',
    scholarshipTitle: 'Turing Emerging Technologists Grant',
    provider: 'Turing Computing Alliance',
    promptText:
      'Alan Turing envisioned computing as a boundless intellectual frontier. What software or hardware architecture paradigm do you believe will define the next 50 years, and what role will your work play in shaping it?',
    targetWordCount: 650,
    minWordCount: 450,
    maxWordCount: 750,
    suggestedOutline: [
      {
        section: '1. Philosophical Horizon & Historical Pivot',
        focus: 'Connect Turing original thesis on machine intelligence to neuromorphic or post-Moore architectures.',
        targetWords: 150,
      },
      {
        section: '2. Your Technical Specialization',
        focus: 'Describe your software engineering projects, algorithmic contributions, and open-source contributions.',
        targetWords: 250,
      },
      {
        section: '3. Future Roadmap & Community Impact',
        focus: 'How you will democratize access to high-performance computing across under-resourced universities.',
        targetWords: 250,
      },
    ],
  },
  {
    id: 'prompt-general',
    scholarshipTitle: 'General Academic & Personal Statement',
    provider: 'Universal Application Dossier',
    promptText:
      'Articulate your academic journey, intellectual passions, significant achievements, and how your future career will contribute meaningfully to your field and society.',
    targetWordCount: 600,
    minWordCount: 400,
    maxWordCount: 700,
    suggestedOutline: [
      {
        section: '1. Origin of Curiosity & Field Choice',
        focus: 'Formative experience that sparked dedication to computer science and mathematical physics.',
        targetWords: 150,
      },
      {
        section: '2. Collegiate Milestones & Research',
        focus: 'Key coursework, GPA, lab investigations, publications, or practical software deployments.',
        targetWords: 250,
      },
      {
        section: '3. Professional Aspirations & Fellowship Need',
        focus: 'Goals post-graduation, societal commitments, and how scholarship funding enables unhindered focus.',
        targetWords: 200,
      },
    ],
  },
];

export const initialSampleDrafts: EssayDraft[] = [
  {
    id: 'draft-quantum-1',
    title: 'Quantum Circuit Optimization & Error Mitigation Statement',
    promptId: 'prompt-quantum',
    promptText: scholarshipEssayPrompts[0].promptText,
    targetScholarshipTitle: 'NextGen Quantum Computing Award',
    scholarshipId: 'sch-3',
    tone: 'Academic',
    targetWordCount: 750,
    lastUpdated: 'Nov 05, 2026',
    savedToVault: true,
    content: `The realization of practical quantum advantage currently pivots on our ability to conquer quantum decoherence. While noisy intermediate-scale quantum (NISQ) systems demonstrate computational promise, their utility remains severely bottlenecked by gate infidelities and error propagation across deep multi-qubit circuits. My research at the MIT Quantum Systems Laboratory focuses specifically on bridging this gap through hybridized algorithmic compiler passes that dynamically minimize two-qubit gate overhead and implement low-overhead error mitigation schemes.

During my junior year investigations advised by Dr. Elena Vance, I developed a graph-theoretic compiler optimization that remaps entangled state permutations directly onto physical superconducting qubit topologies. By taking advantage of anisotropic coherence times across transmon arrays, our pipeline achieved an empirical 28.4% reduction in accumulated phase drift across 16-qubit quantum Fourier transform benchmarks. Furthermore, we integrated zero-noise extrapolation techniques directly into the classical feedback loop, allowing our team to reconstruct expectation values with greater than 96.2% fidelity in the presence of simulated thermal relaxation.

However, moving from software-simulated noise models to sustained physical hardware verification demands substantial computational infrastructure. The NextGen Quantum Computing Award would directly finance dedicated cloud compute access to 64-qubit cryogenic backends, permitting rigorous empirical validation of our error mitigation compiler passes under non-Markovian noise conditions. Crucially, the $50,000 stipend ensures full-time research commitment during the upcoming academic year, freeing me from external commercial consulting to focus completely on publishing our circuit synthesis benchmark suite as an open-source library for the quantum science community.

Looking forward, my aspiration is to pursue doctoral research dedicated to fault-tolerant topological quantum error correction. By mastering the intersection of abstract algorithmic complexity and physical transmon constraints today, I aim to equip computational physicists and chemists with the error-resilient primitives necessary to simulate complex nitrogenase catalysis and novel crystalline lattices. With the generous backing of the Quantum Computing Foundation, I will continue transforming theoretical quantum advantage into dependable scientific reality.`,
  },
  {
    id: 'draft-stem-leadership',
    title: 'Navigating Collaborative Bottlenecks in Autonomous Systems',
    promptId: 'prompt-stem-leadership',
    promptText: scholarshipEssayPrompts[2].promptText,
    targetScholarshipTitle: 'Global STEM Leadership Fellowship',
    scholarshipId: 'sch-1',
    tone: 'Persuasive',
    targetWordCount: 500,
    lastUpdated: 'Nov 04, 2026',
    savedToVault: false,
    content: `True leadership in science is rarely tested when experiments proceed according to script; it is forged when foundational assumptions collapse under the pressure of competition. During our university team's preparation for the International Autonomous Robotics Showcase, our sensor fusion pipeline suffered catastrophic latency spikes just forty-eight hours prior to final qualification trials.

Faced with mounting frustration and divergent opinions within our six-person software team, I recognized that panic would only exacerbate technical paralysis. As lead systems engineer, I called an immediate strategic pause. Rather than arguing competing hypotheses, I instituted a rigorous empirical triage: we established an automated regression harness that isolated sensor ingest overhead from downstream SLAM pose estimation. Within three hours, the data conclusively identified that unoptimized point-cloud serialization was choking memory bandwidth.

I restructured our workflow into three parallel sprints: while two engineers streamlined the binary serialization protocol, another pair optimized vertex memory buffers, and I coordinated end-to-end telemetry validation. By communicating transparent benchmarks every ninety minutes, team morale shifted from anxiety to focused determination. By dawn, our latency had dropped by 64%, allowing our vehicle to navigate all obstacle waypoints with zero manual disengagements and ultimately secure second place overall.

This trial cemented my belief that scientific leadership is an act of clarity and empathy. As a recipient of the Global STEM Leadership Fellowship, I will bring this collaborative resolve to our cohort, mentoring underrepresented engineering peers and demonstrating that technical rigor combined with inclusive teamwork can surmount any engineering obstacle.`,
  },
];


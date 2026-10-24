export interface GameInstruction {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  accentColor: string;
  objective: string;
  controls: {
    keyboard: string[];
    mouseTouch: string[];
  };
  rules: string[];
  scoring: string[];
  proTips: string[];
}

export const GAME_INSTRUCTIONS: Record<string, GameInstruction> = {
  'pattern-shift': {
    id: 'pattern-shift',
    title: 'Pattern Shift',
    tagline: 'Sequence & Mathematical Deduction',
    badge: 'Logic Sequence',
    accentColor: '#00F0FF',
    objective:
      'Analyze the displayed numerical or matrix sequence, identify the underlying progression rule (Fibonacci, quadratic, powers, alternating steps), and select the missing term before time expires.',
    controls: {
      keyboard: ['Keys [1], [2], [3], [4] to select choices', '[Enter] to confirm selection', '[H] to request a progressive hint'],
      mouseTouch: ['Click or tap any answer card', 'Tap the Hint button for progressive clues'],
    },
    rules: [
      'Each puzzle has exactly one mathematically verified answer.',
      'Easy puzzles feature arithmetic and geometric series (±n, ×n).',
      'Medium and Hard puzzles feature 2nd-order differences, Fibonacci variants, interleaved series, and powers.',
      'If you choose incorrectly, a time penalty is applied and a fresh sequence is loaded.',
    ],
    scoring: [
      'Base Points: Easy (500 pts), Medium (800 pts), Hard (1200 pts).',
      'Time Bonus: +5 points for every second remaining on the round clock.',
      'Hint Deductions: -150 pts for Hint 1, -250 pts for Hint 2.',
    ],
    proTips: [
      'Calculate the differences between adjacent numbers first (1st order difference).',
      'If differences are growing steadily, check for squares (n²), cubes (n³), or 2nd order differences.',
      'Never guess blindly: time remaining is a massive multiplier on your final rank.',
    ],
  },

  'word-weave': {
    id: 'word-weave',
    title: 'Word Weave',
    tagline: 'Linguistic Logic & Categorization',
    badge: 'Word Logic',
    accentColor: '#A855F7',
    objective:
      'Solve two modes of linguistic deduction: Word Ladders (morphing a start word to target word by changing one letter at a time) and Category Clusters (grouping 16 technical terms into 4 semantic clusters).',
    controls: {
      keyboard: ['Type letters directly to form ladder steps', '[Enter] to submit step', '[Backspace] to delete letter'],
      mouseTouch: ['Click or tap tiles to select or swap words', 'Tap Submit when 4 matching category items are highlighted'],
    },
    rules: [
      'Ladder Mode: Every intermediate word must be a valid English dictionary entry of the exact same length.',
      'Only exactly 1 letter may change between consecutive ladder rungs.',
      'Cluster Mode: Select exactly 4 related terms belonging to the hidden overarching category.',
      'Wrong submissions forfeit an attempt and trigger a deduction.',
    ],
    scoring: [
      'Base Points: 600 pts for completing the ladder / cluster.',
      'Step Efficiency: Maximum bonus awarded for finding the shortest theoretical path.',
      'Time Multiplier: +5 points per remaining second.',
    ],
    proTips: [
      'In ladders, work backwards from the target word if you hit a dead end.',
      'Look for vowel shifts first (e.g. COLD → CORD → CARD → WARD → WARM).',
      'In cluster mode, beware of red-herring words that could fit two different categories.',
    ],
  },

  'pulse-jumper': {
    id: 'pulse-jumper',
    title: 'Pulse Jumper',
    tagline: 'One-Button 128 BPM Rhythm Platformer',
    badge: 'Rhythm Runner',
    accentColor: '#FF2E97',
    objective:
      'Pilot your neon pulse avatar across a synthwave obstacle course. Time your leaps precisely to the 128 BPM audio cadence to clear spikes, lasers, and multi-tier platforms.',
    controls: {
      keyboard: ['[Spacebar] or [Up Arrow] or [W] to jump', '[Esc] to pause / exit arena'],
      mouseTouch: ['Tap anywhere on screen to jump', 'Hold briefly for full-arc jumps'],
    },
    rules: [
      'Single collision with any spike, laser barrier, or pit terminates the run immediately.',
      'Speed progressively accelerates as you clear consecutive musical sections.',
      'Jump pads boost your elevation to reach elevated neon highway rails.',
    ],
    scoring: [
      'Distance Traveled: +10 points per meter traversed.',
      'Beat Accuracy: +50 bonus points for jumps executed directly on the 128 BPM downbeat.',
      'Energy Sparks: +200 points for collecting floating energy shards.',
    ],
    proTips: [
      'Listen closely to the kick drum: obstacles are mathematically placed on quarter and eighth notes.',
      'Short tap gives a low hop; holding gives maximum airtime.',
      'Look two obstacles ahead rather than focusing directly on your avatar.',
    ],
  },

  'reflex-rush': {
    id: 'reflex-rush',
    title: 'Reflex Rush',
    tagline: 'Millisecond Cognitive Reaction Benchmark',
    badge: 'Reaction Test',
    accentColor: '#FFE45E',
    objective:
      'Test your synaptic reaction speed in milliseconds. Wait for the signal trigger to switch from warning state to green, then strike the sensor instantly.',
    controls: {
      keyboard: ['[Spacebar] or [Enter] to trigger reaction sensor', '[R] to restart round'],
      mouseTouch: ['Click or tap anywhere inside the sensor arena'],
    },
    rules: [
      'Premature trigger before green results in a FALSE START penalty.',
      'Signal switch timing is randomized between 1.5 to 4.5 seconds to prevent rhythmic anticipating.',
      'Each match consists of 5 consecutive trials; your score is calibrated on average latency (ms).',
    ],
    scoring: [
      'Ultra Reflex (&lt;180ms): 1000 pts (Godlike Tier).',
      'Elite Reflex (180ms – 230ms): 800 pts (Pro Gamer Tier).',
      'Standard Reflex (230ms – 300ms): 500 pts.',
      'Sluggish (&gt;350ms): 200 pts.',
      'False Start: -200 pts penalty.',
    ],
    proTips: [
      'Keep your finger hovering 1mm above the spacebar with muscle tension primed.',
      'Focus your vision slightly unfocused on the entire box rather than staring at one point.',
      'Breathe steadily to keep adrenaline from causing premature false starts.',
    ],
  },

  'memory-matrix': {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    tagline: 'Spatial Pattern Recall Challenge',
    badge: 'Memory Grid',
    accentColor: '#00F0FF',
    objective:
      'Memorize illuminated cell configurations flashed across a cybernetic grid, then reproduce the exact spatial pattern after the tiles flip to standby.',
    controls: {
      keyboard: ['Arrow keys to navigate grid', '[Space] / [Enter] to toggle tile', 'Numpad for direct coordinates'],
      mouseTouch: ['Tap directly on matrix tiles to reveal/activate them'],
    },
    rules: [
      'Easy difficulty begins with a 4×4 grid and 4 illuminated target cells.',
      'Grid dimensions expand to 5×5 and 6×6 as your round level increases.',
      'Selecting an incorrect tile triggers a strike. Three strikes ends the trial.',
    ],
    scoring: [
      'Base Level Clear: 300 pts × Current Level.',
      'Clean Recall: +150 bonus pts if completed with zero erroneous clicks.',
      'Speed Multiplier: Bonus points awarded for clearing within 5 seconds of flip.',
    ],
    proTips: [
      'Group tiles into recognizable geometric shapes (triangles, L-shapes, diagonal lines).',
      'Mentally trace the corners and edges first, as perimeter tiles are easiest to anchor.',
      'Never rush the initial inspection phase; use every millisecond of the flash window.',
    ],
  },

  'color-clash': {
    id: 'color-clash',
    title: 'Color Clash',
    tagline: 'Fast Stroop Effect Cognitive Combat',
    badge: 'Focus Battle',
    accentColor: '#FF2E97',
    objective:
      'Overcome cognitive interference (the psychological Stroop Effect). Match the font color or semantic word name depending on the rapidly shifting directive before time expires.',
    controls: {
      keyboard: ['[1] / [R] for Red', '[2] / [G] for Green', '[3] / [B] for Blue', '[4] / [Y] for Yellow'],
      mouseTouch: ['Click or tap the corresponding color card at bottom'],
    },
    rules: [
      'Read the active directive at top: "MATCH INK COLOR" vs "MATCH WRITTEN WORD".',
      'Your brain will naturally attempt to read the word text; you must suppress this reflex when ink is requested.',
      'Timer decreases by 5% with every 5 consecutive successful answers.',
    ],
    scoring: [
      'Correct Match: 100 pts × Current Combo Multiplier.',
      'Combo Streak: Multiplier scales up to 5× for unbroken focus.',
      'Error: Immediate streak reset and -50 points.',
    ],
    proTips: [
      'When directive is "MATCH INK", look at the edge of the letters or squint to ignore the semantic text.',
      'Use keyboard shortcuts [1, 2, 3, 4] for far higher throughput than mouse tracking.',
    ],
  },

  'orbit-dodge': {
    id: 'orbit-dodge',
    title: 'Orbit Dodge',
    tagline: 'Gravitational Orbital Survival',
    badge: 'Arcade Survival',
    accentColor: '#FFE45E',
    objective:
      'Pilot your neon exploration probe along circular gravitational orbit tracks, dodging inward-collapsing asteroid clusters and harvesting quantum energy sparks.',
    controls: {
      keyboard: ['[Up] / [Down] or [W] / [S] to switch between orbital rings', '[Left] / [Right] or [A] / [D] to accelerate / brake orbital rotation'],
      mouseTouch: ['Touch / Drag cursor to guide probe between inner, middle, and outer orbital rings'],
    },
    rules: [
      'Asteroids spawn from the outer deep space vacuum and spiral inward toward the central black hole.',
      'Switch between 3 concentric rings (Inner, Middle, Outer) to navigate open corridors.',
      'Colliding with any space debris destroys your probe.',
    ],
    scoring: [
      'Survival Time: +15 points per second elapsed.',
      'Energy Sparks: +150 points for every blue quantum spark harvested.',
      'Near Miss: +50 points for evading debris by less than 20 pixels.',
    ],
    proTips: [
      'The inner ring rotates faster but gives less reaction time to spot incoming debris.',
      'Stay in the middle ring as your default cruising baseline, stepping inward or outward only when debris approaches.',
    ],
  },

  'stack-sprint': {
    id: 'stack-sprint',
    title: 'Stack Sprint',
    tagline: 'Precision Block Stacking Tower',
    badge: 'Precision Timing',
    accentColor: '#00F0FF',
    objective:
      'Drop oscillating neon blocks directly atop the previous layer. Overhanging portions are sliced away, making subsequent levels narrower and testing razor-sharp precision.',
    controls: {
      keyboard: ['[Spacebar] or [Enter] or [Down Arrow] to drop oscillating block'],
      mouseTouch: ['Tap anywhere on screen to drop the block immediately'],
    },
    rules: [
      'If you place the block with 100% alignment, a PERFECT harmonic ping sounds and the block does not shrink.',
      'Three consecutive perfect placements reward you with slight block expansion.',
      'If a block misses the tower foundation completely, game over.',
    ],
    scoring: [
      'Layer Placed: +100 points.',
      'Perfect Alignment: +250 points.',
      'Tower Height Multiplier: Final score scaled by total vertical stories achieved.',
    ],
    proTips: [
      'Track the center point of the foundation block rather than watching the moving edges.',
      'Press the drop button slightly before center on fast-moving levels to compensate for input latency.',
    ],
  },

  'number-blitz': {
    id: 'number-blitz',
    title: 'Number Blitz',
    tagline: 'Brutal Rapid-Fire Mental Arithmetic',
    badge: 'Mental Math',
    accentColor: '#FF2E97',
    objective:
      'Solve brutal multi-term algebra, square roots, powers, and nested bracket equations under countdown pressure before the clock strikes zero.',
    controls: {
      keyboard: ['[1], [2], [3], [4] or Numpad to select choices', '[Esc] to exit arena'],
      mouseTouch: ['Tap any of the 4 choice cards for instant zero-delay submission'],
    },
    rules: [
      'Equations strictly follow mathematical order of operations: Parentheses → Exponents/Roots → Multiply/Divide → Add/Subtract.',
      'Hardcore Grade 10–12 algebra features terms like `(14² - √256) ÷ (12 - 4) + 3³`.',
      'Consecutive correct answers build streak multipliers up to 4.5×.',
      'An incorrect answer resets streak to zero and applies a score deduction.',
    ],
    scoring: [
      'Base Points: 150 pts × Difficulty Multiplier (Hard = 2.5×).',
      'Streak Scaling: Multipliers scale from 1.0× to 4.5× for unbroken accuracy.',
      'Speed Multiplier: Bonus points awarded for solving within 3 seconds of question render.',
    ],
    proTips: [
      'Simplify brackets first, then evaluate powers and square roots before handling addition.',
      'Estimate the last digit (modulo 10) to quickly eliminate impossible choices.',
    ],
  },

  'maze-runner': {
    id: 'maze-runner',
    title: 'Maze Runner',
    tagline: 'Procedural Solvable Labyrinth Navigation',
    badge: 'Pathfinding',
    accentColor: '#22C55E',
    objective:
      'Navigate procedurally generated cyber labyrinths. Find the optimal path from the starting nexus to the luminous exit portal before the oxygen clock expires.',
    controls: {
      keyboard: ['[Arrow Keys] or [W, A, S, D] to move avatar through corridors', '[Space] to trigger radar pulse'],
      mouseTouch: ['Swipe or use on-screen D-Pad to move through maze pathways'],
    },
    rules: [
      'Every maze is guaranteed to be 100% solvable via depth-first procedural generation.',
      'Bumping into dead-end walls halts forward motion but does not cause damage.',
      'Collect yellow power nodes along corridors to add +10 seconds to your survival clock.',
    ],
    scoring: [
      'Exit Portal Reached: 1000 base points.',
      'Time Bonus: +15 points per second remaining.',
      'Exploration Efficiency: Bonus awarded for shortest step count.',
    ],
    proTips: [
      'Use the classic "Right Hand on Wall" rule to systematically traverse single-layer mazes.',
      'Plan your route 3 intersections in advance rather than making snap turns.',
    ],
  },

  'pixel-invaders': {
    id: 'pixel-invaders',
    title: 'Pixel Invaders',
    tagline: 'Retro Arcade Space Defense Arena',
    badge: 'Retro Shooter',
    accentColor: '#A855F7',
    objective:
      'Defend neon airspace against descending formations of pixel alien invaders. Dodge plasma bomb salvos and eliminate mystery command saucers.',
    controls: {
      keyboard: ['[Left] / [Right] or [A] / [D] to steer starfighter', '[Spacebar] to fire plasma cannons', '[P] to pause'],
      mouseTouch: ['Drag starfighter horizontally', 'Tap fire button to unleash cannon volleys'],
    },
    rules: [
      'Alien waves march horizontally and step downward upon hitting screen boundaries.',
      'As invader numbers dwindle, remaining aliens accelerate their march speed.',
      'If any alien reaches the bottom bunker threshold, planetary shields fall (Game Over).',
    ],
    scoring: [
      'Top Tier Aliens: 300 pts.',
      'Middle Tier Aliens: 200 pts.',
      'Bottom Tier Aliens: 100 pts.',
      'Mystery Command Saucer (Red UFO): 500 to 1000 bonus points.',
    ],
    proTips: [
      'Clear the outer columns first to delay the invaders from reaching the screen edge and stepping down.',
      'Never stay stationary: continuously strafe while firing rhythmically upward.',
    ],
  },

  'game-2048': {
    id: 'game-2048',
    title: '2048 Neo',
    tagline: 'Cybernetic Tile Synthesis Matrix',
    badge: 'Classic Puzzle',
    accentColor: '#FF8B3D',
    objective:
      'Slide numbered cyber tiles across a 4×4 grid. When two tiles with the same value collide, they synthesize into a single tile with double the value. Build the legendary 2048 tile and maximize your high score.',
    controls: {
      keyboard: ['[Arrow Keys] or [W, A, S, D] to slide all tiles in that direction', '[U] to undo last move (if enabled)'],
      mouseTouch: ['Swipe Up, Down, Left, or Right across the game grid'],
    },
    rules: [
      'Every slide moves all free tiles as far as possible in the chosen direction.',
      'A new tile (valued 2 or 4) spawns in a random unoccupied cell after every valid slide.',
      'Game terminates when the grid fills completely and no adjacent matching tiles remain.',
    ],
    scoring: [
      'Tile Synthesis: When two tiles merge, the value of the synthesized tile is added to your total score.',
      'Reaching 2048: Massive milestone bonus of +20,480 points.',
    ],
    proTips: [
      'Corner Anchor Strategy: Keep your highest-value tile locked in one corner (e.g. bottom-right) at all times.',
      'Never swipe Up (or in the opposite direction of your chosen anchor) unless absolutely zero other moves exist.',
      'Organize adjacent rows in descending order (e.g., 1024 → 512 → 256 → 128).',
    ],
  },
};

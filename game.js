(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    shell: document.getElementById("gameShell"),
    topbar: document.getElementById("gameTopbar"),
    level: document.getElementById("levelValue"),
    cores: document.getElementById("coreValue"),
    lives: document.getElementById("lifeValue"),
    score: document.getElementById("scoreValue"),
    best: document.getElementById("bestValue"),
    aboutAuthor: document.getElementById("aboutAuthorBtn"),
    start: document.getElementById("startBtn"),
    pause: document.getElementById("pauseBtn"),
    instructions: document.getElementById("instructionsBtn"),
    reset: document.getElementById("resetBtn"),
    sound: document.getElementById("soundBtn"),
    pilotPanel: document.getElementById("pilotPanel"),
    pilotChoices: document.getElementById("pilotChoices"),
    pilotHud: document.getElementById("pilotHud"),
    pilotMiniAvatar: document.getElementById("pilotMiniAvatar"),
    pilotName: document.getElementById("pilotNameValue"),
    pilotRank: document.getElementById("pilotRankValue"),
    rescuedFriendStrip: document.getElementById("rescuedFriendStrip"),
    rescueMapPanel: document.getElementById("rescueMapPanel"),
    rescueMapCanvas: document.getElementById("rescueMapCanvas"),
    closeRescueMap: document.getElementById("closeRescueMapBtn"),
    rescueMapHint: document.getElementById("rescueMapHint"),
    rescueProgress: document.getElementById("rescueProgressValue"),
    shareMap: document.getElementById("shareMapBtn"),
    shareMapStatus: document.getElementById("shareMapStatus"),
    currentPuzzle: document.getElementById("currentPuzzleBtn"),
    rescueMemoryButtons: document.getElementById("rescueMemoryButtons"),
    upgradePanel: document.getElementById("upgradePanel"),
    upgradeKicker: document.getElementById("upgradeKicker"),
    upgradeTitle: document.getElementById("upgradeTitle"),
    upgradeText: document.getElementById("upgradeText"),
    upgradeChoices: document.getElementById("upgradeChoices"),
    shipPickerPanel: document.getElementById("shipPickerPanel"),
    closeShipPicker: document.getElementById("closeShipPickerBtn"),
    shipChoices: document.getElementById("shipChoices"),
    instructionsPanel: document.getElementById("instructionsPanel"),
    closeInstructions: document.getElementById("closeInstructionsBtn"),
    closeInstructionsBottom: document.getElementById("closeInstructionsBottomBtn"),
    aboutAuthorPanel: document.getElementById("aboutAuthorPanel"),
    closeAboutAuthor: document.getElementById("closeAboutAuthorBtn"),
    closeAboutAuthorBottom: document.getElementById("closeAboutAuthorBottomBtn"),
    aboutVisitValue: document.getElementById("aboutVisitValue"),
    aboutPlayValue: document.getElementById("aboutPlayValue"),
    aboutCounterNote: document.getElementById("aboutCounterNote"),
  };

  const WIDTH = 960;
  const HEIGHT = 640;
  const CELL = 28;
  const COLS = 27;
  const ROWS = 19;
  const ORIGIN_X = Math.floor((WIDTH - COLS * CELL) / 2);
  const ORIGIN_Y = 54;
  const MAX_LEVELS = 5;
  const FRIENDS_PER_RACE = 5;
  const TOTAL_MISSIONS = MAX_LEVELS * FRIENDS_PER_RACE * 3;
  const UNBREAKABLE_WALL = -1;
  const UNBREAKABLE_WALL_RATE = 0.03;
  const HARD_WALL_RATE = 0.05;
  const STICKY_GOO_CHANCE = 0.16;
  const BLACK_HOLE_CHANCE = 0.07;
  const STICKY_GOO_RADIUS = CELL * 0.62;
  const STICKY_SPEED_FACTOR = 0.44;
  const BLACK_HOLE_GRAVITY_RADIUS = CELL * 5;
  const BLACK_HOLE_PULL = 118;
  const BLACK_HOLE_CORE_RADIUS = 13;
  const MAX_BLACK_HOLES_PER_MAP = 2;
  const BLACK_HOLE_DRIFT_RADIUS = CELL * 0.18;
  const BLACK_HOLE_DRIFT_SPEED = 4.5;
  const REPAIR_ROBOT_CHANCE = 0.09;
  const MAX_REPAIR_ROBOTS = 3;
  const REPAIR_ROBOT_SPEED = 84;
  const REPAIR_ROBOT_BUILD_TIME = 0.58;
  const SHIP_MAINTENANCE_IDLE_SECONDS = 5;
  const SHIP_MAINTENANCE_EXIT_TIME = 0.85;
  const SHIP_MAINTENANCE_MIN_SECONDS = 5;
  const SHIP_MAINTENANCE_MAX_SECONDS = 7;
  const FRIEND_CHEER_MIN_DELAY = 8;
  const FRIEND_CHEER_MAX_DELAY = 16;
  const FRIEND_CHEER_DURATION = 4.2;
  const AUTO_BOOST_HOLD_SECONDS = 0.5;
  const AUTO_BOOST_DIRECTION_DOT = 0.88;
  const SHIP_CRUMB_LIFE = 3;
  const SHIP_CRUMB_INTERVAL = 0.08;
  const MAX_SHIP_CRUMBS = 80;
  const WORM_ARM_REACH_BLOCKS = 5;
  const WORM_ARM_WIDTH = 10;
  const STORAGE_KEY = "star-maze-dodger-best";
  const CAMPAIGN_KEY = "star-maze-dodger-campaign";
  const VISIT_KEY = "star-maze-dodger-visits";
  const PLAY_KEY = "star-maze-dodger-plays";
  const SHARE_TEXT = "Try Zack's really cool game. Zack's reactor-core rescue run!";
  const PUZZLE_VERTICAL_EDGES = [
    { center: 0.29, width: 0.17, depth: 31, dir: 1, wobble: 4.5, wave: 3.2 },
    { center: 0.55, width: 0.2, depth: 27, dir: -1, wobble: 6.5, wave: 2.4 },
    { center: 0.38, width: 0.15, depth: 34, dir: -1, wobble: 5.5, wave: 3.7 },
    { center: 0.66, width: 0.18, depth: 29, dir: 1, wobble: 4, wave: 2.8 },
  ];
  const keys = new Set();
  const state = {
    mode: "select",
    stage: 0,
    score: 0,
    lives: 5,
    best: readBestScore(),
    elapsed: 0,
    levelTime: 0,
    cameraShake: 0,
    muted: false,
    messageTimer: 0,
    toast: "",
    loadout: makeBaseLoadout(),
    pilot: null,
    pilotLevel: 1,
    campaign: null,
    raceProgress: 0,
    rescuedFriend: null,
    upgradeChoices: [],
    upgradeKind: "core",
    upgradeHistory: new Set(),
    pilotUpgradeHistory: new Set(),
    upgradeCount: 0,
    pendingStage: null,
    puzzlePieces: 0,
    mapView: "current",
    archiveIndex: 0,
    mapReturnMode: "select",
    mapFollowup: "none",
    instructionsReturnMode: "ready",
    aboutReturnMode: "select",
    shipPickerReturnMode: "playing",
    shipAvatar: "dart",
    playCountedThisRun: false,
    shareMapReady: false,
    shareMapFriend: "",
    shareMapWorld: "",
  };
  const audience = {
    visits: bumpCounter(VISIT_KEY),
    plays: readCounter(PLAY_KEY),
  };

  const mapCtx = ui.rescueMapCanvas.getContext("2d");

  let audioContext = null;
  let masterGain = null;
  let sfxGain = null;
  let musicGain = null;
  let musicTimer = null;
  let musicStep = 0;
  let level = null;
  let player = null;
  let lastFrame = performance.now();

  function Rng(seed) {
    this.seed = seed >>> 0;
  }

  Rng.prototype.next = function next() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  };

  Rng.prototype.int = function int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  };

  const stars = makeStars(190);

  const PILOTS = [
    {
      id: "warden",
      name: "Vrax Ironwarden",
      title: "Armored tactician",
      style: "warden",
      color: "#2f7dff",
      accent: "#49e0ff",
      detail: "Starts tough with an extra life and steady blue cannons.",
      apply(loadout, gameState) {
        loadout.paint = "#2f7dff";
        loadout.cockpit = "#49e0ff";
        loadout.bulletColor = "#49e0ff";
        loadout.shieldTime += 0.25;
        gameState.lives += 1;
      },
      levelUps: [
        {
          id: "warden-plating",
          kind: "Pilot level-up",
          name: "Titan Plating",
          detail: "Gain 1 life and longer respawn shields.",
          color: "#49e0ff",
          apply(loadout, gameState) {
            gameState.lives += 1;
            loadout.shieldTime += 0.35;
          },
        },
        {
          id: "warden-siege",
          kind: "Pilot level-up",
          name: "Siege Cannon Training",
          detail: "Blaster shots become bigger and hit sentries more easily.",
          color: "#ffca4f",
          apply(loadout) {
            loadout.bulletRadius = Math.min(10, loadout.bulletRadius + 2);
            loadout.bulletColor = "#ffca4f";
          },
        },
        {
          id: "warden-command",
          kind: "Pilot level-up",
          name: "Command Thrusters",
          detail: "Boost is stronger and burns less fuel.",
          color: "#79f28e",
          apply(loadout) {
            loadout.boostMultiplier = Math.min(2.15, loadout.boostMultiplier + 0.14);
            loadout.boostBurn = Math.max(24, loadout.boostBurn * 0.86);
          },
        },
      ],
    },
    {
      id: "oracle",
      name: "Lyra Voidseer",
      title: "Crystal mind pilot",
      style: "oracle",
      color: "#d9b64a",
      accent: "#49e0ff",
      detail: "Starts with piercing crystal shots and quick blaster recharge.",
      apply(loadout) {
        loadout.paint = "#d9b64a";
        loadout.cockpit = "#49e0ff";
        loadout.bulletColor = "#49e0ff";
        loadout.pierce += 1;
        loadout.reloadTime = Math.max(0.18, loadout.reloadTime * 0.82);
      },
      levelUps: [
        {
          id: "oracle-phase",
          kind: "Pilot level-up",
          name: "Phase Mind",
          detail: "Shots pierce through one more wall or sentry.",
          color: "#b983ff",
          apply(loadout) {
            loadout.pierce = Math.min(4, loadout.pierce + 1);
            loadout.bulletColor = "#b983ff";
          },
        },
        {
          id: "oracle-focus",
          kind: "Pilot level-up",
          name: "Psi Focus",
          detail: "Blaster recharge gets much faster.",
          color: "#49e0ff",
          apply(loadout) {
            loadout.reloadTime = Math.max(0.12, loadout.reloadTime * 0.65);
          },
        },
        {
          id: "oracle-starstep",
          kind: "Pilot level-up",
          name: "Starstep Engines",
          detail: "Move faster and recharge boost more quickly.",
          color: "#ff5aa7",
          apply(loadout) {
            loadout.speedBonus += 18;
            loadout.boostRegen += 8;
          },
        },
      ],
    },
    {
      id: "brood",
      name: "Skritch Broodwing",
      title: "Organic swarm ace",
      style: "brood",
      color: "#a84b32",
      accent: "#ff5aa7",
      detail: "Starts fast with living rockets and quick boost recharge.",
      apply(loadout) {
        loadout.paint = "#a84b32";
        loadout.cockpit = "#ff5aa7";
        loadout.trail = "#ff5aa7";
        loadout.rocket = "#a84b32";
        loadout.speedBonus += 14;
        loadout.boostRegen += 9;
      },
      levelUps: [
        {
          id: "brood-adrenal",
          kind: "Pilot level-up",
          name: "Adrenal Wings",
          detail: "Fly faster and boost harder.",
          color: "#79f28e",
          apply(loadout) {
            loadout.speedBonus += 18;
            loadout.boostMultiplier = Math.min(2.2, loadout.boostMultiplier + 0.12);
          },
        },
        {
          id: "brood-spores",
          kind: "Pilot level-up",
          name: "Spore Splitter",
          detail: "Fire extra side-by-side organic shots.",
          color: "#ff5aa7",
          apply(loadout) {
            loadout.spread = Math.min(3, loadout.spread + 1);
            loadout.bulletColor = "#79f28e";
          },
        },
        {
          id: "brood-carapace",
          kind: "Pilot level-up",
          name: "Regrown Carapace",
          detail: "Gain 1 life and stronger shield time.",
          color: "#ffca4f",
          apply(loadout, gameState) {
            gameState.lives += 1;
            loadout.shieldTime += 0.25;
          },
        },
      ],
    },
  ];

  const UPGRADE_POOL = [
    {
      id: "paint-comet",
      kind: "Ship paint",
      name: "Comet Red Paint",
      detail: "Red hull, gold cockpit, and a sharper-looking ship.",
      color: "#ff5f59",
      once: true,
      apply(loadout) {
        loadout.paint = "#ff5f59";
        loadout.cockpit = "#ffca4f";
        loadout.trim = "#f4f7fb";
      },
    },
    {
      id: "paint-nebula",
      kind: "Ship paint",
      name: "Nebula Purple Paint",
      detail: "Purple hull with a hot pink cockpit glow.",
      color: "#b983ff",
      once: true,
      apply(loadout) {
        loadout.paint = "#b983ff";
        loadout.cockpit = "#ff5aa7";
        loadout.trim = "#f4f7fb";
      },
    },
    {
      id: "paint-emerald",
      kind: "Ship paint",
      name: "Emerald Scout Paint",
      detail: "Green hull and a cool cyan cockpit.",
      color: "#79f28e",
      once: true,
      apply(loadout) {
        loadout.paint = "#79f28e";
        loadout.cockpit = "#49e0ff";
        loadout.trim = "#07100f";
      },
    },
    {
      id: "rocket-blue",
      kind: "Rockets",
      name: "Blue Rocket Flames",
      detail: "Boosting gets faster and leaves a blue trail.",
      color: "#49e0ff",
      apply(loadout) {
        loadout.rocket = "#49e0ff";
        loadout.trail = "#49e0ff";
        loadout.boostMultiplier = Math.min(2.15, loadout.boostMultiplier + 0.12);
      },
    },
    {
      id: "rocket-gold",
      kind: "Rockets",
      name: "Gold Fuel Rockets",
      detail: "Boost lasts longer and flames turn bright gold.",
      color: "#ffca4f",
      apply(loadout) {
        loadout.rocket = "#ffca4f";
        loadout.trail = "#ffca4f";
        loadout.boostBurn = Math.max(24, loadout.boostBurn * 0.82);
      },
    },
    {
      id: "rocket-rainbow",
      kind: "Rockets",
      name: "Rainbow Rockets",
      detail: "Rainbow exhaust and faster boost recharge.",
      color: "#79f28e",
      once: true,
      apply(loadout) {
        loadout.rainbowTrail = true;
        loadout.boostRegen += 7;
      },
    },
    {
      id: "blaster-rapid",
      kind: "Blaster",
      name: "Rapid Blaster",
      detail: "Shots recharge faster, so Space fires more often.",
      color: "#49e0ff",
      apply(loadout) {
        loadout.reloadTime = Math.max(0.13, loadout.reloadTime * 0.72);
      },
    },
    {
      id: "blaster-twin",
      kind: "Blaster",
      name: "Twin Blaster",
      detail: "Fire extra side-by-side shots.",
      color: "#ffca4f",
      apply(loadout) {
        loadout.spread = Math.min(3, loadout.spread + 1);
        loadout.reloadTime = Math.min(0.36, loadout.reloadTime + 0.03);
      },
    },
    {
      id: "blaster-plasma",
      kind: "Blaster",
      name: "Plasma Blaster",
      detail: "Bigger pink shots are easier to land.",
      color: "#ff5aa7",
      apply(loadout) {
        loadout.bulletRadius = Math.min(10, loadout.bulletRadius + 2);
        loadout.bulletColor = "#ff5aa7";
      },
    },
    {
      id: "blaster-drill",
      kind: "Blaster",
      name: "Drill Blaster",
      detail: "Shots can punch through extra maze walls.",
      color: "#79f28e",
      apply(loadout) {
        loadout.pierce = Math.min(3, loadout.pierce + 1);
        loadout.bulletColor = "#79f28e";
      },
    },
    {
      id: "blaster-longshot",
      kind: "Blaster",
      name: "Longshot Blaster",
      detail: "Shots fly farther and faster across the maze.",
      color: "#f4f7fb",
      apply(loadout) {
        loadout.bulletSpeed += 120;
        loadout.bulletLife += 0.2;
      },
    },
  ];

  const SHIP_AVATARS = [
    {
      id: "dart",
      name: "Nova Dart",
      detail: "Fast classic rescue arrow.",
      accent: "#49e0ff",
    },
    {
      id: "manta",
      name: "Solar Manta",
      detail: "Wide glowing wing ship.",
      accent: "#79f28e",
    },
    {
      id: "beetle",
      name: "Orbit Beetle",
      detail: "Round armored explorer.",
      accent: "#ffca4f",
    },
    {
      id: "fang",
      name: "Twin Fang",
      detail: "Split-nose blaster racer.",
      accent: "#ff5aa7",
    },
  ];

  const FRIEND_ROSTER = {
    warden: [
      { name: "Bolt", color: "#49e0ff" },
      { name: "Rivet", color: "#ffca4f" },
      { name: "Nova", color: "#9fdcff" },
      { name: "Tank", color: "#79f28e" },
      { name: "Spark", color: "#ff5aa7" },
    ],
    oracle: [
      { name: "Glim", color: "#b983ff" },
      { name: "Prism", color: "#49e0ff" },
      { name: "Aura", color: "#ff5aa7" },
      { name: "Rune", color: "#ffca4f" },
      { name: "Echo", color: "#79f28e" },
    ],
    brood: [
      { name: "Nib", color: "#79f28e" },
      { name: "Sprout", color: "#ff5aa7" },
      { name: "Moss", color: "#36c66b" },
      { name: "Claw", color: "#ffca4f" },
      { name: "Skitter", color: "#49e0ff" },
    ],
  };

  const RESCUE_WORLDS = [
    { id: "moon", name: "Moon Base", accent: "#cfd8e6", glow: "#49e0ff" },
    { id: "mars", name: "Mars Canyon", accent: "#ff7a45", glow: "#ffca4f" },
    { id: "saturn", name: "Saturn Rings", accent: "#d9b64a", glow: "#b983ff" },
    { id: "jupiter", name: "Jupiter Storm", accent: "#ffca4f", glow: "#49e0ff" },
    { id: "jungle", name: "Alien Jungle", accent: "#79f28e", glow: "#ffca4f" },
  ];

  const BOSS_ARCHETYPES = [
    {
      id: "crusher",
      name: "Titan Crusher",
      shape: "crusher",
      behavior: "charger",
      color: "#2f7dff",
      accent: "#49e0ff",
      eye: "#ffca4f",
      radius: 21,
      collisionR: 12,
      hpBonus: 4,
      speedMultiplier: 0.86,
      rocketDelayMultiplier: 1.16,
      rocketSpeedMultiplier: 0.92,
      rocketTurnMultiplier: 0.9,
      minRocketRange: 105,
      rocketBurst: 1,
      rocketSpread: 0,
      pulseSpeed: 4.2,
      preferredDistance: 98,
    },
    {
      id: "stalker",
      name: "Neon Stalker",
      shape: "stalker",
      behavior: "strafe",
      color: "#ff5aa7",
      accent: "#49e0ff",
      eye: "#f4f7fb",
      radius: 16,
      collisionR: 9,
      hpBonus: -1,
      speedMultiplier: 1.24,
      rocketDelayMultiplier: 0.86,
      rocketSpeedMultiplier: 1.12,
      rocketTurnMultiplier: 1.32,
      minRocketRange: 92,
      rocketBurst: 1,
      rocketSpread: 0,
      pulseSpeed: 7.2,
      preferredDistance: 118,
    },
    {
      id: "maw",
      name: "Spore Maw",
      shape: "maw",
      behavior: "weave",
      color: "#a84b32",
      accent: "#79f28e",
      eye: "#ffca4f",
      radius: 20,
      collisionR: 11,
      hpBonus: 2,
      speedMultiplier: 1.03,
      rocketDelayMultiplier: 1,
      rocketSpeedMultiplier: 1,
      rocketTurnMultiplier: 1.08,
      minRocketRange: 86,
      rocketBurst: 1,
      rocketSpread: 0,
      pulseSpeed: 5.8,
      preferredDistance: 104,
    },
    {
      id: "caster",
      name: "Solar Caster",
      shape: "caster",
      behavior: "keepaway",
      color: "#d9b64a",
      accent: "#49e0ff",
      eye: "#49e0ff",
      radius: 17,
      collisionR: 9,
      hpBonus: 1,
      speedMultiplier: 0.95,
      rocketDelayMultiplier: 1.04,
      rocketSpeedMultiplier: 1.07,
      rocketTurnMultiplier: 1.18,
      minRocketRange: 70,
      rocketBurst: 2,
      rocketSpread: 0.24,
      pulseSpeed: 6.4,
      preferredDistance: 145,
    },
    {
      id: "leviathan",
      name: "Tunnel Leviathan",
      shape: "worm",
      behavior: "lurker",
      weapon: "tentacles",
      color: "#6fda73",
      accent: "#b983ff",
      eye: "#ffca4f",
      radius: 22,
      collisionR: 11,
      hpBonus: 3,
      speedMultiplier: 0.82,
      rocketDelayMultiplier: 1,
      rocketSpeedMultiplier: 1,
      rocketTurnMultiplier: 1,
      minRocketRange: 0,
      rocketBurst: 0,
      rocketSpread: 0,
      pulseSpeed: 5.1,
      preferredDistance: 118,
      tentacleCount: 4,
      tentacleCooldown: 1.2,
      tentacleRange: WORM_ARM_REACH_BLOCKS,
      tentacleWidth: WORM_ARM_WIDTH,
    },
  ];

  function makeStars(count) {
    const rng = new Rng(8023);
    return Array.from({ length: count }, () => ({
      x: rng.next() * WIDTH,
      y: rng.next() * HEIGHT,
      size: 0.7 + rng.next() * 2.2,
      speed: 8 + rng.next() * 28,
      hue: rng.next() < 0.62 ? "255,255,255" : rng.next() < 0.5 ? "73,224,255" : "255,202,79",
      twinkle: rng.next() * Math.PI * 2,
    }));
  }

  function readBestScore() {
    try {
      return Number(localStorage.getItem(STORAGE_KEY) || 0);
    } catch (error) {
      return 0;
    }
  }

  function saveBestScore() {
    if (state.score <= state.best) {
      return;
    }
    state.best = state.score;
    try {
      localStorage.setItem(STORAGE_KEY, String(state.best));
    } catch (error) {
      // Private browsing can block storage; the run still works without it.
    }
  }

  function readCounter(key) {
    try {
      return Math.max(0, Number(localStorage.getItem(key) || 0) || 0);
    } catch (error) {
      return 0;
    }
  }

  function bumpCounter(key) {
    const next = readCounter(key) + 1;
    try {
      localStorage.setItem(key, String(next));
    } catch (error) {
      // Counters are celebratory only; storage-free browsers can still play.
    }
    return next;
  }

  function saveCounter(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      // Keep the on-screen number for this session even if storage is blocked.
    }
  }

  function formatCounter(value) {
    return String(Math.max(0, Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function makeFreshCampaign() {
    return PILOTS.reduce((campaign, pilot) => {
      campaign[pilot.id] = { rescued: 0 };
      return campaign;
    }, {});
  }

  function readCampaign() {
    try {
      const raw = JSON.parse(localStorage.getItem(CAMPAIGN_KEY) || "null");
      const campaign = makeFreshCampaign();
      for (const pilot of PILOTS) {
        const rescued = Number(raw?.[pilot.id]?.rescued || 0);
        campaign[pilot.id].rescued = Math.max(0, Math.min(FRIENDS_PER_RACE, rescued));
      }
      return campaign;
    } catch (error) {
      return makeFreshCampaign();
    }
  }

  function saveCampaign() {
    try {
      localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(state.campaign || makeFreshCampaign()));
    } catch (error) {
      // The campaign still works for the current run if storage is unavailable.
    }
  }

  function totalCampaignMissions() {
    const campaign = state.campaign || makeFreshCampaign();
    const rescuedMissions = PILOTS.reduce((total, pilot) => {
      return total + (campaign[pilot.id]?.rescued || 0) * MAX_LEVELS;
    }, 0);
    const activePieces = state.pilot && !state.rescuedFriend ? state.puzzlePieces : 0;
    return rescuedMissions + activePieces;
  }

  function currentFriendIndex() {
    return Math.min(FRIENDS_PER_RACE - 1, state.raceProgress);
  }

  function currentFriend() {
    if (!state.pilot) {
      return null;
    }
    return FRIEND_ROSTER[state.pilot.id]?.[currentFriendIndex()] || null;
  }

  function rescueWorldAt(index) {
    const safeIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
    return RESCUE_WORLDS[safeIndex % RESCUE_WORLDS.length];
  }

  function completedPuzzleCount() {
    return Math.min(FRIENDS_PER_RACE, Math.max(0, state.raceProgress));
  }

  function archivedFriend() {
    if (!state.pilot) {
      return null;
    }
    return FRIEND_ROSTER[state.pilot.id]?.[state.archiveIndex] || null;
  }

  function clampArchiveIndex() {
    const count = completedPuzzleCount();
    if (count <= 0) {
      state.archiveIndex = 0;
      state.mapView = "current";
      return;
    }
    state.archiveIndex = Math.max(0, Math.min(count - 1, state.archiveIndex));
  }

  function setMapView(view, index = state.archiveIndex) {
    state.mapView = view === "archive" ? "archive" : "current";
    state.archiveIndex = Number.isFinite(index) ? index : 0;
    clampArchiveIndex();
    renderRescueMap();
  }

  function difficultyLevel() {
    return state.raceProgress * MAX_LEVELS + state.stage;
  }

  function makeBaseLoadout() {
    return {
      paint: "#f4f7fb",
      trim: "#f4f7fb",
      cockpit: "#49e0ff",
      rocket: "#ffca4f",
      trail: "#49e0ff",
      rainbowTrail: false,
      bulletColor: "#49e0ff",
      bulletRadius: 5,
      bulletSpeed: 520,
      bulletLife: 1.15,
      pierce: 0,
      reloadTime: 0.28,
      spread: 1,
      speedBonus: 0,
      shieldTime: 1.8,
      boostMultiplier: 1.68,
      boostBurn: 42,
      boostRegen: 16,
    };
  }

  function newRun(mode = "select") {
    state.mode = mode;
    state.stage = 0;
    state.score = 0;
    state.lives = 5;
    state.elapsed = 0;
    state.messageTimer = 0;
    state.toast = "";
    state.loadout = makeBaseLoadout();
    state.pilot = null;
    state.pilotLevel = 1;
    state.campaign = readCampaign();
    state.raceProgress = 0;
    state.rescuedFriend = null;
    state.upgradeChoices = [];
    state.upgradeKind = "core";
    state.upgradeHistory = new Set();
    state.pilotUpgradeHistory = new Set();
    state.upgradeCount = 0;
    state.pendingStage = null;
    state.puzzlePieces = 0;
    state.mapView = "current";
    state.archiveIndex = 0;
    state.mapReturnMode = "select";
    state.mapFollowup = "none";
    state.instructionsReturnMode = "select";
    state.aboutReturnMode = "select";
    state.shipPickerReturnMode = "playing";
    state.shipAvatar = "dart";
    state.playCountedThisRun = false;
    state.shareMapReady = false;
    state.shareMapFriend = "";
    state.shareMapWorld = "";
    hideUpgradePanel();
    ui.rescueMapPanel.hidden = true;
    ui.instructionsPanel.hidden = true;
    ui.aboutAuthorPanel.hidden = true;
    ui.shipPickerPanel.hidden = true;
    ui.shareMap.hidden = true;
    ui.shareMap.disabled = true;
    ui.shareMapStatus.textContent = "";
    renderPilotChoices();
    ui.pilotPanel.hidden = mode !== "select";
    renderPilotHud();
    renderRescueMap();
    updateAboutCounters();
    setupLevel(0);
    updateHud();
  }

  function setupLevel(stage) {
    level = generateLevel(stage);
    const start = cellCenter(level.start.c, level.start.r);
    player = {
      x: start.x,
      y: start.y,
      spawnX: start.x,
      spawnY: start.y,
      r: 10,
      baseSpeed: 166 + stage * 8,
      boost: 100,
      reload: 0,
      invulnerable: 1.25,
      trail: [],
      crumbs: [],
      crumbTimer: 0,
      angle: 0,
      idleTime: 0,
      maintenanceSoundTimer: 0,
      maintenanceTool: "hammer",
      maintenanceSide: 1,
      maintenanceDuration: 0,
      autoBoostHold: 0,
      autoBoostX: 0,
      autoBoostY: 0,
    };
    state.stage = stage;
    state.levelTime = 0;
    updateHud();
  }

  function generateLevel(stage) {
    const rng = new Rng(3119 + stage * 7919);
    const challenge = difficultyLevelForStage(stage);
    const wallHits = Math.min(8, 1 + Math.floor(challenge / 8));
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    const start = { c: 1, r: 1 };
    carveMaze(grid, rng, start);
    addLoops(grid, rng, 18 + stage * 5 + Math.floor(challenge / 12));

    const distanceMap = bfs(grid, start);
    const openCells = Array.from(distanceMap.entries()).map(([key, distance]) => {
      const [c, r] = key.split(",").map(Number);
      return { c, r, distance };
    });

    const gate = openCells
      .filter((cell) => cell.distance > 22)
      .sort((a, b) => b.distance - a.distance)[0] || { c: COLS - 2, r: ROWS - 2 };

    const reserved = new Set([cellKey(start), cellKey(gate)]);
    const coreCount = Math.min(2 + stage + Math.floor(challenge / 18), 5);
    const cores = pickOpenCells(openCells, rng, coreCount, reserved, (cell) => {
      return cell.distance > 10 && manhattan(cell, gate) > 5;
    }).map((cell, index) => ({
      ...cellCenter(cell.c, cell.r),
      c: cell.c,
      r: cell.r,
      collected: false,
      spin: rng.next() * Math.PI * 2,
      tone: index % 3,
    }));

    cores.forEach((core) => reserved.add(cellKey(core)));

    const boosts = pickOpenCells(openCells, rng, 3, reserved, (cell) => {
      return cell.distance > 8 && manhattan(cell, gate) > 4;
    }).map((cell) => ({
      ...cellCenter(cell.c, cell.r),
      c: cell.c,
      r: cell.r,
      taken: false,
    }));

    boosts.forEach((boost) => reserved.add(cellKey(boost)));

    const sentries = makeSentries(grid, openCells, rng, Math.min(2 + stage + Math.floor(challenge / 8), 7), reserved)
      .map((sentry, index) => ({
        ...sentry,
        r: 12,
        speed: 0.52 + stage * 0.05 + challenge * 0.008 + rng.next() * 0.26,
        phase: rng.next() * Math.PI * 2,
        spin: rng.next() * Math.PI * 2,
        color: index % 2 === 0 ? "#ff5aa7" : "#ffca4f",
      }));

    const wallStats = strengthenWalls(grid, wallHits, rng);
    const boss = state.raceProgress > 0 ? makeBoss(openCells, rng, challenge, stage) : null;

    return {
      grid,
      start,
      gate,
      gatePosition: cellCenter(gate.c, gate.r),
      cores,
      boosts,
      sentries,
      boss,
      wallHits,
      wallStats,
      bullets: [],
      bossRockets: [],
      stickyGoo: [],
      blackHoles: [],
      repairRobots: [],
      friendCheers: [],
      friendCheerTimer: nextFriendCheerDelay(),
      bursts: [],
    };
  }

  function difficultyLevelForStage(stage) {
    return state.raceProgress * MAX_LEVELS + stage;
  }

  function strengthenWalls(grid, health, rng) {
    const candidates = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (grid[r][c] === 1) {
          grid[r][c] = health;
          if (r > 0 && r < ROWS - 1 && c > 0 && c < COLS - 1) {
            candidates.push({ c, r });
          }
        }
      }
    }

    const shuffled = shuffle(candidates, rng);
    const unbreakableCount = Math.round(candidates.length * UNBREAKABLE_WALL_RATE);
    const hardCount = Math.round(candidates.length * HARD_WALL_RATE);
    for (let i = 0; i < unbreakableCount; i += 1) {
      const cell = shuffled[i];
      if (cell) {
        grid[cell.r][cell.c] = UNBREAKABLE_WALL;
      }
    }

    for (let i = unbreakableCount; i < unbreakableCount + hardCount; i += 1) {
      const cell = shuffled[i];
      if (cell) {
        grid[cell.r][cell.c] = Math.max(health, 5 + rng.int(0, 2));
      }
    }

    return {
      normal: Math.max(0, candidates.length - unbreakableCount - hardCount),
      hard: hardCount,
      unbreakable: unbreakableCount,
    };
  }

  function makeBoss(openCells, rng, challenge, stage) {
    const candidates = openCells.filter((cell) => cell.distance > 12);
    const cell = candidates[rng.int(0, Math.max(0, candidates.length - 1))] || openCells[openCells.length - 1];
    const position = cellCenter(cell.c, cell.r);
    const bossTier = Math.max(0, state.raceProgress - 1);
    const archetype = bossArchetypeFor(stage);
    const maxHp = Math.max(8, 10 + bossTier * 3 + Math.floor(stage / 2) + archetype.hpBonus);
    return {
      x: position.x,
      y: position.y,
      id: archetype.id,
      name: archetype.name,
      shape: archetype.shape,
      behavior: archetype.behavior,
      weapon: archetype.weapon || "rockets",
      r: archetype.radius,
      collisionR: archetype.collisionR,
      hp: maxHp,
      maxHp,
      speed: (54 + bossTier * 8 + stage * 4) * archetype.speedMultiplier,
      rocketCooldown: 1.2 + rng.next() * 0.9,
      rocketDelay: Math.max(0.82, (2.3 - bossTier * 0.22 - stage * 0.08) * archetype.rocketDelayMultiplier),
      rocketSpeed: (170 + bossTier * 18 + stage * 8) * archetype.rocketSpeedMultiplier,
      rocketTurn: (2.25 + bossTier * 0.2) * archetype.rocketTurnMultiplier,
      minRocketRange: archetype.minRocketRange,
      rocketBurst: archetype.rocketBurst,
      rocketSpread: archetype.rocketSpread,
      preferredDistance: archetype.preferredDistance,
      color: archetype.color,
      accent: archetype.accent,
      eye: archetype.eye,
      pulseSpeed: archetype.pulseSpeed,
      pulse: rng.next() * Math.PI * 2,
      tentacleCount: archetype.tentacleCount || 0,
      tentacleCooldown: archetype.tentacleCooldown || 1.3,
      tentacleRange: archetype.tentacleRange || WORM_ARM_REACH_BLOCKS,
      tentacleWidth: archetype.tentacleWidth || WORM_ARM_WIDTH,
      tentacleSoundCooldown: 0,
      tentacles: makeBossTentacles(archetype, rng),
    };
  }

  function makeBossTentacles(archetype, rng) {
    const count = archetype.weapon === "tentacles" ? archetype.tentacleCount || 4 : 0;
    return Array.from({ length: count }, (_, index) => ({
      index,
      state: "idle",
      timer: 0.25 + rng.next() * (archetype.tentacleCooldown || 1.2),
      duration: 1,
      path: [],
      age: rng.next() * Math.PI * 2,
      hasHit: false,
      side: index % 2 === 0 ? -1 : 1,
    }));
  }

  function bossArchetypeFor(stage) {
    const pilotOffset = Math.max(0, PILOTS.findIndex((pilot) => pilot.id === state.pilot?.id));
    const index = (Math.max(0, state.raceProgress - 1) + stage + pilotOffset * 2) % BOSS_ARCHETYPES.length;
    return BOSS_ARCHETYPES[index];
  }

  function carveMaze(grid, rng, start) {
    grid[start.r][start.c] = 0;
    const stack = [start];

    while (stack.length) {
      const current = stack[stack.length - 1];
      const choices = shuffle([
        { dc: 2, dr: 0 },
        { dc: -2, dr: 0 },
        { dc: 0, dr: 2 },
        { dc: 0, dr: -2 },
      ], rng).filter(({ dc, dr }) => {
        const nc = current.c + dc;
        const nr = current.r + dr;
        return nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && grid[nr][nc] === 1;
      });

      if (!choices.length) {
        stack.pop();
        continue;
      }

      const choice = choices[0];
      const midC = current.c + choice.dc / 2;
      const midR = current.r + choice.dr / 2;
      const next = { c: current.c + choice.dc, r: current.r + choice.dr };
      grid[midR][midC] = 0;
      grid[next.r][next.c] = 0;
      stack.push(next);
    }
  }

  function addLoops(grid, rng, count) {
    for (let i = 0; i < count; i += 1) {
      const c = rng.int(2, COLS - 3);
      const r = rng.int(2, ROWS - 3);
      if (grid[r][c] === 1 && countOpenNeighbors(grid, c, r) >= 2) {
        grid[r][c] = 0;
      }
    }
  }

  function countOpenNeighbors(grid, c, r) {
    return [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].reduce((count, [dc, dr]) => count + (grid[r + dr]?.[c + dc] === 0 ? 1 : 0), 0);
  }

  function bfs(grid, start) {
    const queue = [start];
    const distances = new Map([[cellKey(start), 0]]);
    let head = 0;

    while (head < queue.length) {
      const current = queue[head];
      head += 1;
      const distance = distances.get(cellKey(current));
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const next = { c: current.c + dc, r: current.r + dr };
        const key = cellKey(next);
        if (grid[next.r]?.[next.c] !== 0 || distances.has(key)) {
          continue;
        }
        distances.set(key, distance + 1);
        queue.push(next);
      }
    }

    return distances;
  }

  function pickOpenCells(cells, rng, amount, reserved, predicate) {
    const candidates = shuffle(cells.filter((cell) => {
      return !reserved.has(cellKey(cell)) && predicate(cell);
    }), rng).sort((a, b) => b.distance - a.distance);

    const chosen = [];
    for (const cell of candidates) {
      if (chosen.every((other) => manhattan(cell, other) >= 5)) {
        chosen.push(cell);
        reserved.add(cellKey(cell));
      }
      if (chosen.length === amount) {
        break;
      }
    }
    return chosen;
  }

  function makeSentries(grid, openCells, rng, amount, reserved) {
    const candidates = shuffle(openCells.filter((cell) => {
      return cell.distance > 8 && !reserved.has(cellKey(cell));
    }), rng);
    const sentries = [];

    for (const cell of candidates) {
      const horizontal = segmentFor(grid, cell, "x");
      const vertical = segmentFor(grid, cell, "y");
      const choices = [horizontal, vertical].filter((segment) => segment.cells >= 4);
      if (!choices.length) {
        continue;
      }
      const segment = choices[rng.int(0, choices.length - 1)];
      const center = cellCenter(cell.c, cell.r);
      sentries.push({
        axis: segment.axis,
        x: center.x,
        y: center.y,
        fixedX: center.x,
        fixedY: center.y,
        min: segment.min,
        max: segment.max,
      });
      reserved.add(cellKey(cell));
      if (sentries.length === amount) {
        break;
      }
    }

    return sentries;
  }

  function segmentFor(grid, cell, axis) {
    if (axis === "x") {
      let minC = cell.c;
      let maxC = cell.c;
      while (grid[cell.r][minC - 1] === 0) {
        minC -= 1;
      }
      while (grid[cell.r][maxC + 1] === 0) {
        maxC += 1;
      }
      return {
        axis,
        cells: maxC - minC + 1,
        min: cellCenter(minC, cell.r).x,
        max: cellCenter(maxC, cell.r).x,
      };
    }

    let minR = cell.r;
    let maxR = cell.r;
    while (grid[minR - 1]?.[cell.c] === 0) {
      minR -= 1;
    }
    while (grid[maxR + 1]?.[cell.c] === 0) {
      maxR += 1;
    }
    return {
      axis,
      cells: maxR - minR + 1,
      min: cellCenter(cell.c, minR).y,
      max: cellCenter(cell.c, maxR).y,
    };
  }

  function shuffle(items, rng) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = rng.int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function manhattan(a, b) {
    return Math.abs(a.c - b.c) + Math.abs(a.r - b.r);
  }

  function cellKey(cell) {
    return `${cell.c},${cell.r}`;
  }

  function cellCenter(c, r) {
    return {
      x: ORIGIN_X + c * CELL + CELL / 2,
      y: ORIGIN_Y + r * CELL + CELL / 2,
    };
  }

  function pointToCell(x, y) {
    return {
      c: Math.floor((x - ORIGIN_X) / CELL),
      r: Math.floor((y - ORIGIN_Y) / CELL),
    };
  }

  function isWallAt(x, y) {
    const cell = pointToCell(x, y);
    return cell.r < 0 || cell.r >= ROWS || cell.c < 0 || cell.c >= COLS || level.grid[cell.r][cell.c] !== 0;
  }

  function circleHitsWall(x, y, radius) {
    const side = radius * 0.78;
    const samples = [
      [radius, 0],
      [-radius, 0],
      [0, radius],
      [0, -radius],
      [side, side],
      [-side, side],
      [side, -side],
      [-side, -side],
    ];
    return samples.some(([dx, dy]) => isWallAt(x + dx, y + dy));
  }

  function countPlayLaunch() {
    if (state.playCountedThisRun) {
      return;
    }
    state.playCountedThisRun = true;
    audience.plays += 1;
    saveCounter(PLAY_KEY, audience.plays);
    updateAboutCounters();
  }

  function updateAboutCounters() {
    ui.aboutVisitValue.textContent = formatCounter(audience.visits);
    ui.aboutPlayValue.textContent = formatCounter(audience.plays);
    const remaining = Math.max(0, 3000 - audience.plays);
    ui.aboutCounterNote.textContent = remaining
      ? `Goal: ${formatCounter(remaining)} more launches on the way to 3,000 real players. Thanks guys! This inspires me to make more games.`
      : "Wow, 3,000 launches! Thanks guys! This inspires me to make more games.";
  }

  function openAboutAuthor() {
    if (!ui.aboutAuthorPanel.hidden) {
      return;
    }
    dismissInstructionsOverlay();
    state.aboutReturnMode = state.mode;
    state.mode = "about";
    keys.clear();
    updateAboutCounters();
    ui.aboutAuthorPanel.hidden = false;
    syncMusic();
    updateHud();
  }

  function closeAboutAuthor() {
    if (ui.aboutAuthorPanel.hidden) {
      return;
    }
    ui.aboutAuthorPanel.hidden = true;
    state.mode = state.aboutReturnMode || "select";
    state.aboutReturnMode = "select";
    syncMusic();
    updateHud();
  }

  function startOrResume() {
    if (state.mode === "shipPicker") {
      closeShipPicker();
      return;
    }
    if (state.mode === "about") {
      closeAboutAuthor();
      return;
    }
    if (state.mode === "instructions") {
      closeInstructions();
      return;
    }
    if (state.mode === "map") {
      closeRescueMap();
      return;
    }
    unlockAudio();
    if (state.mode === "select") {
      ui.pilotPanel.hidden = false;
    } else if (state.mode === "ready" || state.mode === "gameover" || state.mode === "won") {
      newRun("select");
    } else if (state.mode === "paused") {
      state.mode = "playing";
      ping("start");
    }
    syncMusic();
    updateHud();
  }

  function resetGame() {
    newRun("select");
    ping("reset");
    syncMusic();
  }

  function togglePause() {
    if (state.mode === "playing") {
      state.mode = "paused";
    } else if (state.mode === "paused") {
      state.mode = "playing";
    }
    syncMusic();
    updateHud();
  }

  function toggleSound() {
    state.muted = !state.muted;
    ui.sound.setAttribute("aria-pressed", String(state.muted));
    ui.sound.textContent = state.muted ? "Muted" : "Sound";
    if (state.muted) {
      stopMusic();
      return;
    }
    if (!state.muted) {
      ping("start");
      syncMusic();
    }
  }

  function openShipPicker() {
    if (!player || !ui.shipPickerPanel.hidden || (state.mode !== "playing" && state.mode !== "paused")) {
      return;
    }
    state.shipPickerReturnMode = state.mode;
    state.mode = "shipPicker";
    keys.clear();
    renderShipChoices();
    ui.shipPickerPanel.hidden = false;
    syncMusic();
    updateHud();
  }

  function closeShipPicker() {
    if (ui.shipPickerPanel.hidden) {
      return;
    }
    ui.shipPickerPanel.hidden = true;
    state.mode = state.shipPickerReturnMode || "playing";
    state.shipPickerReturnMode = "playing";
    syncMusic();
    updateHud();
  }

  function renderShipChoices() {
    ui.shipChoices.innerHTML = SHIP_AVATARS.map((ship) => {
      const selected = ship.id === state.shipAvatar;
      return `
        <button
          class="ship-choice ${selected ? "selected" : ""}"
          type="button"
          data-ship="${ship.id}"
          style="--ship-accent: ${ship.accent}"
          aria-pressed="${selected}"
        >
          <span class="ship-preview ship-preview--${ship.id}" aria-hidden="true"></span>
          <strong>${ship.name}</strong>
          <span>${ship.detail}</span>
        </button>
      `;
    }).join("");
  }

  function chooseShipAvatar(id) {
    const ship = SHIP_AVATARS.find((candidate) => candidate.id === id);
    if (!ship) {
      return;
    }
    state.shipAvatar = ship.id;
    state.toast = `${ship.name} selected`;
    state.messageTimer = 1.1;
    closeShipPicker();
  }

  function updateHud() {
    const collected = level.cores.filter((core) => core.collected).length;
    syncLayoutMetrics();
    ui.shell.dataset.mode = state.mode;
    if (state.mode !== "playing") {
      ["up", "right", "down", "left", "boost", "shoot"].forEach((key) => keys.delete(key));
    }
    ui.level.textContent = String(state.stage + 1);
    ui.cores.textContent = `${collected}/${level.cores.length}`;
    ui.lives.textContent = String(state.lives);
    ui.score.textContent = String(state.score);
    ui.best.textContent = String(state.best);
    ui.start.textContent = state.mode === "instructions" || state.mode === "map" || state.mode === "about" || state.mode === "shipPicker" ? "Close" : state.mode === "select" ? "Choose" : state.mode === "paused" ? "Paused" : state.mode === "playing" ? "Flying" : state.mode === "gameover" || state.mode === "won" ? "New Pilot" : "Launch";
    ui.start.disabled = state.mode === "playing" || state.mode === "paused";
    ui.pause.setAttribute("aria-pressed", String(state.mode === "paused"));
    ui.pause.textContent = state.mode === "paused" ? "Resume" : "Pause";
  }

  function syncLayoutMetrics() {
    const rect = ui.topbar?.getBoundingClientRect?.();
    if (!rect) {
      return;
    }
    ui.shell.style.setProperty?.("--mobile-topbar-bottom", `${Math.ceil(rect.bottom + 8)}px`);
  }

  function update(dt) {
    state.elapsed += dt;
    state.levelTime += dt;
    state.cameraShake = Math.max(0, state.cameraShake - dt * 18);
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.reload = Math.max(0, player.reload - dt);
    updateSentries(dt);
    updateBoss(dt);
    updateBlackHoles(dt);
    movePlayer(dt);
    updateBossRockets(dt);
    updateBullets(dt);
    updateBursts(dt);
    updateRepairRobots(dt);
    updateFriendCheers(dt);
    collectItems();
    if (state.mode !== "playing") {
      return;
    }
    testHazards();
    testGate();
  }

  function updateSentries() {
    for (const sentry of level.sentries) {
      const span = (sentry.max - sentry.min) / 2;
      const center = sentry.min + span;
      const value = center + Math.sin(state.elapsed * sentry.speed + sentry.phase) * Math.max(0, span - 10);
      sentry.spin += 0.05 + state.stage * 0.006;
      if (sentry.axis === "x") {
        sentry.x = value;
        sentry.y = sentry.fixedY;
      } else {
        sentry.x = sentry.fixedX;
        sentry.y = value;
      }
    }
  }

  function updateBoss(dt) {
    const boss = level.boss;
    if (!boss || boss.hp <= 0 || state.mode !== "playing") {
      return;
    }

    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const length = Math.hypot(dx, dy) || 1;
    const dirX = dx / length;
    const dirY = dy / length;
    const move = bossMoveVector(boss, dirX, dirY, length);
    const speed = boss.speed * bossSpeedPulse(boss, length);
    const vx = move.x * speed * dt;
    const vy = move.y * speed * dt;
    const moveRadius = boss.collisionR || boss.r;
    boss.pulse += dt * (boss.pulseSpeed + state.raceProgress * 0.35);
    boss.tentacleSoundCooldown = Math.max(0, (boss.tentacleSoundCooldown || 0) - dt);

    if (!circleHitsWall(boss.x + vx, boss.y, moveRadius)) {
      boss.x += vx;
    }
    if (!circleHitsWall(boss.x, boss.y + vy, moveRadius)) {
      boss.y += vy;
    }
    if (boss.weapon === "tentacles") {
      updateBossTentacles(boss, dt);
      return;
    }

    boss.rocketCooldown -= dt;
    if (boss.rocketCooldown <= 0 && length > boss.minRocketRange) {
      fireBossVolley(boss, dirX, dirY);
      boss.rocketCooldown = boss.rocketDelay;
    }
  }

  function bossMoveVector(boss, dirX, dirY, distanceToPlayer) {
    const sideX = -dirY;
    const sideY = dirX;
    if (boss.behavior === "strafe") {
      const sway = Math.sin(boss.pulse * 1.12) * 0.92;
      return normalizedVector(dirX + sideX * sway, dirY + sideY * sway, dirX, dirY);
    }
    if (boss.behavior === "weave") {
      const sway = Math.sin(boss.pulse * 1.75) * 0.55 + Math.sin(boss.pulse * 0.58) * 0.28;
      return normalizedVector(dirX + sideX * sway, dirY + sideY * sway, dirX, dirY);
    }
    if (boss.behavior === "keepaway") {
      const preferred = boss.preferredDistance || 135;
      const approach = distanceToPlayer > preferred ? 0.82 : distanceToPlayer < preferred * 0.72 ? -0.78 : 0.18;
      const orbit = Math.sin(boss.pulse * 0.86) * 0.9;
      return normalizedVector(dirX * approach + sideX * orbit, dirY * approach + sideY * orbit, sideX, sideY);
    }
    if (boss.behavior === "lurker") {
      const preferred = boss.preferredDistance || 118;
      const approach = distanceToPlayer > preferred * 1.05 ? 0.62 : distanceToPlayer < preferred * 0.72 ? -0.46 : 0.08;
      const slither = Math.sin(boss.pulse * 1.2) * 0.78;
      return normalizedVector(dirX * approach + sideX * slither, dirY * approach + sideY * slither, sideX, sideY);
    }
    return { x: dirX, y: dirY };
  }

  function bossSpeedPulse(boss, distanceToPlayer) {
    if (boss.behavior === "charger") {
      return 0.72 + Math.max(0, Math.sin(boss.pulse * 1.08)) * 0.92;
    }
    if (boss.behavior === "keepaway") {
      return distanceToPlayer < (boss.preferredDistance || 135) * 0.7 ? 1.22 : 0.92;
    }
    if (boss.behavior === "weave") {
      return 0.9 + Math.max(0, Math.sin(boss.pulse * 1.45)) * 0.25;
    }
    if (boss.behavior === "lurker") {
      return 0.78 + Math.max(0, Math.sin(boss.pulse * 1.35)) * 0.24;
    }
    return 1 + Math.sin(boss.pulse * 0.95) * 0.12;
  }

  function updateBossTentacles(boss, dt) {
    if (!boss.tentacles?.length) {
      return;
    }

    for (const tentacle of boss.tentacles) {
      tentacle.age += dt;
      tentacle.timer -= dt;

      if (tentacle.state === "idle") {
        if (tentacle.timer <= 0) {
          beginBossTentacleWindup(boss, tentacle);
        }
      } else if (tentacle.state === "windup") {
        if (tentacle.timer <= 0) {
          setBossTentacleState(tentacle, "strike", 0.36);
          if (boss.tentacleSoundCooldown <= 0) {
            state.messageTimer = 0.65;
            state.toast = `${boss.name} lashes out`;
            boss.tentacleSoundCooldown = 0.5;
            ping("tentacle");
          }
        }
      } else if (tentacle.state === "strike") {
        if (!tentacle.hasHit && bossTentacleHitsPlayer(boss, tentacle)) {
          tentacle.hasHit = true;
          addBurst(player.x, player.y, boss.accent || boss.color, 16);
          state.cameraShake = Math.max(state.cameraShake, 1.05);
          hurtPlayer();
        }
        if (tentacle.timer <= 0) {
          setBossTentacleState(tentacle, "retract", 0.28);
        }
      } else if (tentacle.state === "retract" && tentacle.timer <= 0) {
        tentacle.path = [];
        tentacle.hasHit = false;
        setBossTentacleState(
          tentacle,
          "idle",
          (boss.tentacleCooldown || 1.2) + tentacle.index * 0.16 + Math.random() * 0.32,
        );
      }
    }
  }

  function beginBossTentacleWindup(boss, tentacle) {
    tentacle.path = buildBossTentaclePath(boss, tentacle);
    tentacle.hasHit = false;
    if (tentacle.path.length < 2) {
      setBossTentacleState(tentacle, "idle", 0.45 + Math.random() * 0.35);
      return;
    }
    setBossTentacleState(tentacle, "windup", 0.22 + tentacle.index * 0.035);
  }

  function setBossTentacleState(tentacle, nextState, duration) {
    tentacle.state = nextState;
    tentacle.timer = duration;
    tentacle.duration = duration || 1;
  }

  function buildBossTentaclePath(boss, tentacle) {
    const start = pointToCell(boss.x, boss.y);
    const playerCell = pointToCell(player.x, player.y);
    const range = boss.tentacleRange || WORM_ARM_REACH_BLOCKS;
    if (!isOpenMazeCell(start)) {
      return [];
    }

    for (const target of tentacleTargetCells(playerCell, tentacle.index)) {
      const path = findOpenCellPathWithinSteps(start, target, range);
      if (path.length > 1) {
        return path;
      }
    }

    return buildPartialTentaclePath(start, playerCell, range, tentacle.index);
  }

  function tentacleTargetCells(playerCell, index) {
    const offsets = [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ];
    const shifted = offsets.slice(index).concat(offsets.slice(0, index));
    return shifted
      .map(([dc, dr]) => ({ c: playerCell.c + dc, r: playerCell.r + dr }))
      .filter((cell) => isOpenMazeCell(cell));
  }

  function findOpenCellPathWithinSteps(start, target, maxSteps) {
    if (!isOpenMazeCell(start) || !isOpenMazeCell(target)) {
      return [];
    }

    const startKey = cellKey(start);
    const targetKey = cellKey(target);
    const queue = [start];
    const parent = new Map([[startKey, null]]);
    const depth = new Map([[startKey, 0]]);
    let head = 0;

    while (head < queue.length) {
      const current = queue[head];
      head += 1;
      const currentKey = cellKey(current);
      if (currentKey === targetKey) {
        return reconstructCellPath(parent, current);
      }
      if (depth.get(currentKey) >= maxSteps) {
        continue;
      }

      for (const next of orderedOpenNeighbors(current, target, 0)) {
        const key = cellKey(next);
        if (parent.has(key)) {
          continue;
        }
        parent.set(key, current);
        depth.set(key, depth.get(currentKey) + 1);
        queue.push(next);
      }
    }

    return [];
  }

  function buildPartialTentaclePath(start, target, maxSteps, index) {
    const path = [start];
    const visited = new Set([cellKey(start)]);
    let current = start;

    for (let step = 0; step < maxSteps; step += 1) {
      const candidates = orderedOpenNeighbors(current, target, index)
        .filter((cell) => !visited.has(cellKey(cell)));
      if (!candidates.length) {
        break;
      }
      const choice = candidates[Math.min(candidates.length - 1, step % 3 === 1 ? index % 2 : 0)];
      path.push(choice);
      visited.add(cellKey(choice));
      current = choice;
    }

    return path;
  }

  function orderedOpenNeighbors(cell, target, index) {
    const side = index % 2 === 0 ? -1 : 1;
    const directions = [
      { dc: 1, dr: 0 },
      { dc: -1, dr: 0 },
      { dc: 0, dr: 1 },
      { dc: 0, dr: -1 },
    ];
    return directions
      .map(({ dc, dr }) => ({ c: cell.c + dc, r: cell.r + dr, dc, dr }))
      .filter((next) => isOpenMazeCell(next))
      .sort((a, b) => {
        const aScore = manhattan(a, target) + (a.dc * side - a.dr * side) * 0.08;
        const bScore = manhattan(b, target) + (b.dc * side - b.dr * side) * 0.08;
        return aScore - bScore;
      });
  }

  function reconstructCellPath(parent, endCell) {
    const path = [];
    let current = endCell;
    while (current) {
      path.push(current);
      current = parent.get(cellKey(current));
    }
    return path.reverse();
  }

  function isOpenMazeCell(cell) {
    return cell.r >= 0 && cell.r < ROWS && cell.c >= 0 && cell.c < COLS && level.grid[cell.r]?.[cell.c] === 0;
  }

  function bossTentacleProgress(tentacle) {
    if (tentacle.state === "windup") {
      return 0.22 + (1 - Math.max(0, tentacle.timer / tentacle.duration)) * 0.46;
    }
    if (tentacle.state === "strike") {
      return 1;
    }
    if (tentacle.state === "retract") {
      return Math.max(0, tentacle.timer / tentacle.duration);
    }
    return 0;
  }

  function bossTentacleWorldPoints(boss, tentacle) {
    const points = [{ x: boss.x, y: boss.y }];
    for (const cell of tentacle.path.slice(1)) {
      points.push(cellCenter(cell.c, cell.r));
    }
    return points;
  }

  function bossTentacleHitsPlayer(boss, tentacle) {
    if (player.invulnerable > 0) {
      return false;
    }
    const points = bossTentacleWorldPoints(boss, tentacle);
    if (points.length < 2) {
      return false;
    }
    const reach = trimPolyline(points, bossTentacleProgress(tentacle));
    return distanceToPolyline(player, reach) <= player.r + (boss.tentacleWidth || WORM_ARM_WIDTH) * 0.48;
  }

  function trimPolyline(points, progress) {
    if (points.length < 2 || progress >= 1) {
      return points;
    }
    const total = polylineLength(points);
    const targetLength = Math.max(0, total * progress);
    const trimmed = [points[0]];
    let traveled = 0;

    for (let i = 1; i < points.length; i += 1) {
      const previous = points[i - 1];
      const current = points[i];
      const segmentLength = distance(previous, current);
      if (traveled + segmentLength >= targetLength) {
        const remaining = Math.max(0, targetLength - traveled);
        const t = segmentLength > 0 ? remaining / segmentLength : 0;
        trimmed.push({
          x: previous.x + (current.x - previous.x) * t,
          y: previous.y + (current.y - previous.y) * t,
        });
        return trimmed;
      }
      trimmed.push(current);
      traveled += segmentLength;
    }

    return trimmed;
  }

  function polylineLength(points) {
    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
      total += distance(points[i - 1], points[i]);
    }
    return total;
  }

  function distanceToPolyline(point, points) {
    if (points.length < 2) {
      return Infinity;
    }
    let closest = Infinity;
    for (let i = 1; i < points.length; i += 1) {
      closest = Math.min(closest, distanceToSegment(point, points[i - 1], points[i]));
    }
    return closest;
  }

  function distanceToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
    const x = a.x + dx * t;
    const y = a.y + dy * t;
    return Math.hypot(point.x - x, point.y - y);
  }

  function normalizedVector(x, y, fallbackX, fallbackY) {
    const length = Math.hypot(x, y);
    if (length < 0.001) {
      return { x: fallbackX, y: fallbackY };
    }
    return { x: x / length, y: y / length };
  }

  function fireBossVolley(boss, dirX, dirY) {
    const burst = Math.max(1, boss.rocketBurst || 1);
    const spread = boss.rocketSpread || 0;
    const baseAngle = Math.atan2(dirY, dirX);
    for (let i = 0; i < burst; i += 1) {
      const offset = burst === 1 ? 0 : (i - (burst - 1) / 2) * spread;
      const angle = baseAngle + offset;
      fireBossRocket(boss, Math.cos(angle), Math.sin(angle));
    }
    state.messageTimer = 0.8;
    state.toast = `${boss.name} rocket`;
    ping("rocket");
  }

  function fireBossRocket(boss, dirX, dirY) {
    const spawn = bossRocketSpawn(boss, dirX, dirY);
    level.bossRockets.push({
      x: spawn.x,
      y: spawn.y,
      vx: dirX * boss.rocketSpeed,
      vy: dirY * boss.rocketSpeed,
      r: 6,
      speed: boss.rocketSpeed,
      turn: boss.rocketTurn,
      life: 3.4,
      trail: [],
      color: boss.color,
    });
  }

  function bossRocketSpawn(boss, dirX, dirY) {
    const distances = [boss.r + 10, boss.r + 4, 14, 8, 0];
    for (const distanceFromBoss of distances) {
      const x = boss.x + dirX * distanceFromBoss;
      const y = boss.y + dirY * distanceFromBoss;
      if (!isWallAt(x, y)) {
        return { x, y };
      }
    }
    return { x: boss.x, y: boss.y };
  }

  function updateBossRockets(dt) {
    for (let i = level.bossRockets.length - 1; i >= 0; i -= 1) {
      const rocket = level.bossRockets[i];
      rocket.life -= dt;
      steerRocketTowardPlayer(rocket, dt);
      rocket.trail.push({ x: rocket.x, y: rocket.y, life: 0.42 });
      if (rocket.trail.length > 12) {
        rocket.trail.shift();
      }
      rocket.x += rocket.vx * dt;
      rocket.y += rocket.vy * dt;
      rocket.trail.forEach((dot) => {
        dot.life -= dt * 1.8;
      });
      rocket.trail = rocket.trail.filter((dot) => dot.life > 0);

      if (player.invulnerable <= 0 && distance(player, rocket) < player.r + rocket.r + 4) {
        explodeBossRocket(rocket, true);
        level.bossRockets.splice(i, 1);
        hurtPlayer();
        continue;
      }

      if (rocket.life <= 0 || bulletOutsideMaze(rocket) || isWallAt(rocket.x, rocket.y)) {
        explodeBossRocket(rocket);
        level.bossRockets.splice(i, 1);
      }
    }
  }

  function steerRocketTowardPlayer(rocket, dt) {
    const current = Math.atan2(rocket.vy, rocket.vx);
    const desired = Math.atan2(player.y - rocket.y, player.x - rocket.x);
    const turn = clampAngle(desired - current);
    const next = current + Math.max(-rocket.turn * dt, Math.min(rocket.turn * dt, turn));
    rocket.vx = Math.cos(next) * rocket.speed;
    rocket.vy = Math.sin(next) * rocket.speed;
  }

  function clampAngle(angle) {
    let value = angle;
    while (value > Math.PI) {
      value -= Math.PI * 2;
    }
    while (value < -Math.PI) {
      value += Math.PI * 2;
    }
    return value;
  }

  function explodeBossRocket(rocket, directHit = false) {
    addBurst(rocket.x, rocket.y, rocket.color || "#ff5aa7", directHit ? 24 : 16);
    state.cameraShake = Math.max(state.cameraShake, directHit ? 0.9 : 0.45);
    if (!directHit && player.invulnerable <= 0 && distance(player, rocket) < 42) {
      hurtPlayer();
    }
  }

  function movePlayer(dt) {
    const left = keys.has("left") ? 1 : 0;
    const right = keys.has("right") ? 1 : 0;
    const up = keys.has("up") ? 1 : 0;
    const down = keys.has("down") ? 1 : 0;
    let dx = right - left;
    let dy = down - up;
    const length = Math.hypot(dx, dy) || 1;
    dx /= length;
    dy /= length;

    const gravity = blackHolePullAt(player.x, player.y, dt);
    updateShipMaintenance(dt, Boolean(dx || dy) || shipIsUnsafeToMaintain(gravity));

    updateShipCrumbs(dt, dx, dy);

    const stickyFactor = stickySlowFactorAt(player.x, player.y);
    const autoBoosting = updateAutoBoostHold(dt, dx, dy);
    const boosting = (keys.has("boost") || autoBoosting) && player.boost > 2 && (dx || dy);
    const speed = (player.baseSpeed + state.loadout.speedBonus) * stickyFactor * (boosting ? state.loadout.boostMultiplier : 1);
    if (boosting) {
      player.boost = Math.max(0, player.boost - dt * state.loadout.boostBurn);
      pushTrail(0.95);
    } else {
      player.boost = Math.min(100, player.boost + dt * state.loadout.boostRegen);
      if (dx || dy) {
        pushTrail(0.42);
      }
    }

    if (dx || dy) {
      player.angle = Math.atan2(dy, dx);
    }

    movePlayerThroughMaze(dx * speed * dt + gravity.x, dy * speed * dt + gravity.y);

    player.trail.forEach((dot) => {
      dot.life -= dt * 1.7;
      dot.x -= Math.cos(player.angle) * dt * 12;
      dot.y -= Math.sin(player.angle) * dt * 12;
    });
    player.trail = player.trail.filter((dot) => dot.life > 0);
  }

  function updateShipCrumbs(dt, dx, dy) {
    player.crumbs.forEach((crumb) => {
      crumb.life -= dt;
      crumb.drift += dt;
      crumb.x += Math.cos(crumb.angle) * crumb.speed * dt;
      crumb.y += Math.sin(crumb.angle) * crumb.speed * dt;
    });
    player.crumbs = player.crumbs.filter((crumb) => crumb.life > 0);

    if (!(dx || dy)) {
      player.crumbTimer = Math.min(SHIP_CRUMB_INTERVAL, player.crumbTimer);
      return;
    }

    player.crumbTimer -= dt;
    while (player.crumbTimer <= 0) {
      dropShipCrumb();
      player.crumbTimer += SHIP_CRUMB_INTERVAL;
    }
  }

  function dropShipCrumb() {
    const back = player.angle + Math.PI;
    const side = player.angle + Math.PI * 0.5;
    const sideOffset = (Math.random() - 0.5) * 11;
    player.crumbs.push({
      x: player.x + Math.cos(back) * 11 + Math.cos(side) * sideOffset,
      y: player.y + Math.sin(back) * 11 + Math.sin(side) * sideOffset,
      life: SHIP_CRUMB_LIFE,
      maxLife: SHIP_CRUMB_LIFE,
      size: 1.1 + Math.random() * 1.4,
      angle: back + (Math.random() - 0.5) * 0.75,
      speed: 6 + Math.random() * 10,
      drift: Math.random() * Math.PI * 2,
      color: Math.random() < 0.5 ? state.loadout.trail : state.loadout.cockpit,
    });
    if (player.crumbs.length > MAX_SHIP_CRUMBS) {
      player.crumbs.splice(0, player.crumbs.length - MAX_SHIP_CRUMBS);
    }
  }

  function updateAutoBoostHold(dt, dx, dy) {
    if (!player || !(dx || dy) || state.mode !== "playing") {
      resetAutoBoostHold();
      return false;
    }

    const hadDirection = Boolean(player.autoBoostX || player.autoBoostY);
    const directionDot = dx * player.autoBoostX + dy * player.autoBoostY;
    if (!hadDirection || directionDot < AUTO_BOOST_DIRECTION_DOT) {
      player.autoBoostHold = 0;
      player.autoBoostX = dx;
      player.autoBoostY = dy;
    }

    player.autoBoostHold += dt;
    return player.autoBoostHold >= AUTO_BOOST_HOLD_SECONDS;
  }

  function resetAutoBoostHold() {
    if (!player) {
      return;
    }
    player.autoBoostHold = 0;
    player.autoBoostX = 0;
    player.autoBoostY = 0;
  }

  function updateShipMaintenance(dt, shipIsMoving) {
    if (!player) {
      return;
    }
    if (shipIsMoving || state.mode !== "playing") {
      resetShipMaintenance();
      return;
    }

    player.idleTime += dt;
    if (player.idleTime < SHIP_MAINTENANCE_IDLE_SECONDS) {
      player.maintenanceSoundTimer = 0;
      return;
    }

    if (!player.maintenanceDuration) {
      player.maintenanceDuration = SHIP_MAINTENANCE_MIN_SECONDS + Math.random() * (SHIP_MAINTENANCE_MAX_SECONDS - SHIP_MAINTENANCE_MIN_SECONDS);
      ping("maintenanceHuh");
    }

    const repairTime = player.idleTime - SHIP_MAINTENANCE_IDLE_SECONDS;
    if (repairTime >= player.maintenanceDuration) {
      player.idleTime = 0;
      player.maintenanceDuration = 0;
      player.maintenanceSoundTimer = 0;
      player.maintenanceTool = "hammer";
      return;
    }
    if (repairTime < SHIP_MAINTENANCE_EXIT_TIME || repairTime > player.maintenanceDuration - SHIP_MAINTENANCE_EXIT_TIME) {
      player.maintenanceSoundTimer = 0;
      return;
    }

    player.maintenanceSoundTimer -= dt;
    if (player.maintenanceSoundTimer <= 0) {
      const drillCycle = Math.floor((player.idleTime - SHIP_MAINTENANCE_IDLE_SECONDS) / 1.7) % 3 === 2;
      player.maintenanceTool = drillCycle ? "drill" : "hammer";
      ping(drillCycle ? "maintenanceDrill" : "maintenanceHammer");
      player.maintenanceSoundTimer = drillCycle ? 1.05 : 0.38 + Math.random() * 0.18;
    }
  }

  function shipIsUnsafeToMaintain(gravity) {
    if (!level || !player) {
      return false;
    }

    if (Math.hypot(gravity.x, gravity.y) > 0.08) {
      return true;
    }

    if (level.bossRockets?.some((rocket) => distance(player, rocket) < 125)) {
      return true;
    }

    if (level.sentries?.some((sentry) => distance(player, sentry) < 85)) {
      return true;
    }

    if (!level.boss || level.boss.hp <= 0) {
      return false;
    }

    if (distance(player, level.boss) < 160) {
      return true;
    }

    const bossTentacles = level.boss.tentacles || [];
    return bossTentacles.some((tentacle) => tentacle.state !== "idle" && bossTentacleHitsPlayer(level.boss, tentacle));
  }

  function resetShipMaintenance() {
    if (!player) {
      return;
    }
    player.idleTime = 0;
    player.maintenanceSoundTimer = 0;
    player.maintenanceTool = "hammer";
    player.maintenanceDuration = 0;
  }

  function updateFriendCheers(dt) {
    if (!level?.friendCheers) {
      return;
    }

    for (let i = level.friendCheers.length - 1; i >= 0; i -= 1) {
      const cheer = level.friendCheers[i];
      cheer.age += dt;
      if (cheer.age >= cheer.duration) {
        level.friendCheers.splice(i, 1);
      }
    }

    const friends = rescuedFriendsForCheering();
    if (!friends.length || level.friendCheers.length >= 2) {
      return;
    }

    level.friendCheerTimer = (level.friendCheerTimer ?? nextFriendCheerDelay()) - dt;
    if (level.friendCheerTimer <= 0) {
      spawnFriendCheer(friends);
      level.friendCheerTimer = nextFriendCheerDelay();
    }
  }

  function rescuedFriendsForCheering() {
    if (!state.pilot) {
      return [];
    }
    return (FRIEND_ROSTER[state.pilot.id] || []).slice(0, Math.min(FRIENDS_PER_RACE, state.raceProgress));
  }

  function nextFriendCheerDelay() {
    return FRIEND_CHEER_MIN_DELAY + Math.random() * (FRIEND_CHEER_MAX_DELAY - FRIEND_CHEER_MIN_DELAY);
  }

  function spawnFriendCheer(friends) {
    const friend = friends[Math.floor(Math.random() * friends.length)];
    const side = ["left", "right", "top", "bottom"][Math.floor(Math.random() * 4)];
    const mazeRight = ORIGIN_X + COLS * CELL;
    const mazeBottom = ORIGIN_Y + ROWS * CELL;
    const nearX = player ? player.x + (Math.random() - 0.5) * 180 : ORIGIN_X + (COLS * CELL) / 2;
    const nearY = player ? player.y + (Math.random() - 0.5) * 140 : ORIGIN_Y + (ROWS * CELL) / 2;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    let fromX = 0;
    let fromY = 0;
    let toX = 0;
    let toY = 0;

    if (side === "left") {
      fromX = ORIGIN_X - 42;
      toX = ORIGIN_X - 12;
      fromY = toY = clamp(nearY, ORIGIN_Y + 34, mazeBottom - 34);
    } else if (side === "right") {
      fromX = mazeRight + 42;
      toX = mazeRight + 12;
      fromY = toY = clamp(nearY, ORIGIN_Y + 34, mazeBottom - 34);
    } else if (side === "top") {
      fromY = ORIGIN_Y - 44;
      toY = ORIGIN_Y - 12;
      fromX = toX = clamp(nearX, ORIGIN_X + 44, mazeRight - 44);
    } else {
      fromY = mazeBottom + 42;
      toY = mazeBottom + 14;
      fromX = toX = clamp(nearX, ORIGIN_X + 44, mazeRight - 44);
    }

    level.friendCheers.push({
      friend,
      side,
      fromX,
      fromY,
      toX,
      toY,
      age: 0,
      duration: FRIEND_CHEER_DURATION + Math.random() * 0.8,
      waveSeed: Math.random() * Math.PI * 2,
      message: randomFriendCheerMessage(),
    });
    ping("friendCheer");
  }

  function randomFriendCheerMessage() {
    const messages = ["Go!", "Nice!", "Woo!", "You got this!", "Keep flying!", "Blast it!"];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  function stickySlowFactorAt(x, y) {
    if (!level?.stickyGoo?.length) {
      return 1;
    }

    return level.stickyGoo.some((goo) => Math.hypot(x - goo.x, y - goo.y) <= goo.radius)
      ? STICKY_SPEED_FACTOR
      : 1;
  }

  function blackHolePullAt(x, y, dt) {
    const pull = { x: 0, y: 0 };
    if (!level?.blackHoles?.length) {
      return pull;
    }

    for (const blackHole of level.blackHoles) {
      const dx = blackHole.x - x;
      const dy = blackHole.y - y;
      const distanceToHole = Math.hypot(dx, dy);
      if (distanceToHole < 1 || distanceToHole > blackHole.pullRadius) {
        continue;
      }

      const rangeFactor = 1 - distanceToHole / blackHole.pullRadius;
      const strength = BLACK_HOLE_PULL * rangeFactor * (0.18 + rangeFactor * 0.92);
      pull.x += (dx / distanceToHole) * strength * dt;
      pull.y += (dy / distanceToHole) * strength * dt;
    }

    return pull;
  }

  function updateBlackHoles(dt) {
    if (!level?.blackHoles?.length) {
      return;
    }

    for (const blackHole of level.blackHoles) {
      blackHole.homeX ??= blackHole.x;
      blackHole.homeY ??= blackHole.y;
      blackHole.driftVx ??= 0;
      blackHole.driftVy ??= 0;

      const pullHomeX = blackHole.homeX - blackHole.x;
      const pullHomeY = blackHole.homeY - blackHole.y;
      blackHole.driftVx += pullHomeX * 0.9 * dt + (Math.random() - 0.5) * 18 * dt;
      blackHole.driftVy += pullHomeY * 0.9 * dt + (Math.random() - 0.5) * 18 * dt;
      blackHole.driftVx *= 0.965;
      blackHole.driftVy *= 0.965;

      const speed = Math.hypot(blackHole.driftVx, blackHole.driftVy);
      if (speed > BLACK_HOLE_DRIFT_SPEED) {
        blackHole.driftVx = (blackHole.driftVx / speed) * BLACK_HOLE_DRIFT_SPEED;
        blackHole.driftVy = (blackHole.driftVy / speed) * BLACK_HOLE_DRIFT_SPEED;
      }

      blackHole.x += blackHole.driftVx * dt;
      blackHole.y += blackHole.driftVy * dt;

      const driftX = blackHole.x - blackHole.homeX;
      const driftY = blackHole.y - blackHole.homeY;
      const driftDistance = Math.hypot(driftX, driftY);
      if (driftDistance > BLACK_HOLE_DRIFT_RADIUS) {
        const clamp = BLACK_HOLE_DRIFT_RADIUS / driftDistance;
        blackHole.x = blackHole.homeX + driftX * clamp;
        blackHole.y = blackHole.homeY + driftY * clamp;
        blackHole.driftVx *= -0.28;
        blackHole.driftVy *= -0.28;
      }
    }
  }

  function movePlayerThroughMaze(stepX, stepY) {
    const radius = Math.max(7, player.r - 1.8);
    const horizontalFirst = Math.abs(stepX) >= Math.abs(stepY);
    if (horizontalFirst) {
      movePlayerAxis("x", stepX, stepY, radius);
      movePlayerAxis("y", stepY, stepX, radius);
    } else {
      movePlayerAxis("y", stepY, stepX, radius);
      movePlayerAxis("x", stepX, stepY, radius);
    }
    unstickPlayer(radius);
  }

  function movePlayerAxis(axis, amount, crossAmount, radius) {
    if (Math.abs(amount) < 0.001) {
      return false;
    }

    const targetX = player.x + (axis === "x" ? amount : 0);
    const targetY = player.y + (axis === "y" ? amount : 0);
    if (!circleHitsWall(targetX, targetY, radius)) {
      player.x = targetX;
      player.y = targetY;
      return true;
    }

    for (const nudge of doorwayNudges(axis, amount, crossAmount)) {
      const nudgedX = player.x + (axis === "y" ? nudge : 0);
      const nudgedY = player.y + (axis === "x" ? nudge : 0);
      const finalX = nudgedX + (axis === "x" ? amount : 0);
      const finalY = nudgedY + (axis === "y" ? amount : 0);
      if (!circleHitsWall(nudgedX, nudgedY, radius) && !circleHitsWall(finalX, finalY, radius)) {
        player.x = finalX;
        player.y = finalY;
        return true;
      }
    }

    return false;
  }

  function doorwayNudges(axis, amount, crossAmount) {
    const cell = pointToCell(player.x, player.y);
    const center = cellCenter(cell.c, cell.r);
    const centerOffset = axis === "x" ? center.y - player.y : center.x - player.x;
    const maxNudge = Math.min(CELL * 0.46, Math.max(3, Math.abs(amount) * 3.2));
    const signs = [];
    const addSign = (sign) => {
      if (sign && !signs.includes(sign)) {
        signs.push(sign);
      }
    };

    addSign(Math.sign(crossAmount));
    addSign(Math.sign(centerOffset));
    addSign(1);
    addSign(-1);

    const nudges = [];
    const addNudge = (value) => {
      const clamped = Math.max(-maxNudge, Math.min(maxNudge, value));
      const rounded = Math.round(clamped * 10) / 10;
      if (Math.abs(rounded) > 0.05 && !nudges.includes(rounded)) {
        nudges.push(rounded);
      }
    };

    addNudge(centerOffset);
    for (let step = 2; step <= maxNudge; step += 2) {
      signs.forEach((sign) => addNudge(sign * step));
    }
    signs.forEach((sign) => addNudge(sign * maxNudge));
    return nudges;
  }

  function unstickPlayer(radius) {
    if (!circleHitsWall(player.x, player.y, radius)) {
      return;
    }

    const originX = player.x;
    const originY = player.y;
    const cell = pointToCell(player.x, player.y);
    const center = cellCenter(cell.c, cell.r);
    if (!circleHitsWall(center.x, center.y, radius)) {
      player.x = center.x;
      player.y = center.y;
      return;
    }

    for (let distanceFromOrigin = 2; distanceFromOrigin <= CELL * 0.5; distanceFromOrigin += 2) {
      for (let i = 0; i < 12; i += 1) {
        const angle = (Math.PI * 2 * i) / 12;
        const x = originX + Math.cos(angle) * distanceFromOrigin;
        const y = originY + Math.sin(angle) * distanceFromOrigin;
        if (!circleHitsWall(x, y, radius)) {
          player.x = x;
          player.y = y;
          return;
        }
      }
    }
  }

  function fireBullet() {
    if (state.mode !== "playing") {
      return;
    }
    resetShipMaintenance();
    if (player.reload > 0) {
      return;
    }

    const angles = shotAngles(player.angle, state.loadout.spread);
    for (const angle of angles) {
      level.bullets.push({
        x: player.x + Math.cos(angle) * 18,
        y: player.y + Math.sin(angle) * 18,
        vx: Math.cos(angle) * state.loadout.bulletSpeed,
        vy: Math.sin(angle) * state.loadout.bulletSpeed,
        r: state.loadout.bulletRadius,
        life: state.loadout.bulletLife,
        pierce: state.loadout.pierce,
        color: state.loadout.bulletColor,
      });
    }
    player.reload = state.loadout.reloadTime;
    state.messageTimer = 0.45;
    state.toast = "Blaster";
    ping("shoot");
  }

  function shotAngles(angle, count) {
    if (count <= 1) {
      return [angle];
    }
    if (count === 2) {
      return [angle - 0.09, angle + 0.09];
    }
    return [angle - 0.13, angle, angle + 0.13];
  }

  function updateBullets(dt) {
    for (let i = level.bullets.length - 1; i >= 0; i -= 1) {
      const bullet = level.bullets[i];
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life -= dt;

      if (level.boss && level.boss.hp > 0 && distance(bullet, level.boss) < bullet.r + level.boss.r + 4) {
        damageBoss(bullet);
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
          continue;
        }
        level.bullets.splice(i, 1);
        continue;
      }

      const rocketIndex = level.bossRockets.findIndex((rocket) => distance(bullet, rocket) < bullet.r + rocket.r + 5);
      if (rocketIndex !== -1) {
        const [rocket] = level.bossRockets.splice(rocketIndex, 1);
        explodeBossRocket(rocket, true);
        state.score += 45;
        state.messageTimer = 0.75;
        state.toast = "Rocket blasted";
        ping("zap");
        updateHud();
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
          continue;
        }
        level.bullets.splice(i, 1);
        continue;
      }

      const sentryIndex = level.sentries.findIndex((sentry) => distance(bullet, sentry) < bullet.r + sentry.r + 4);
      if (sentryIndex !== -1) {
        const [sentry] = level.sentries.splice(sentryIndex, 1);
        addBurst(sentry.x, sentry.y, bullet.color || "#ff5aa7", 16);
        state.score += 90;
        state.messageTimer = 0.9;
        state.toast = "Sentry cleared";
        ping("zap");
        updateHud();
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
          continue;
        }
        level.bullets.splice(i, 1);
        continue;
      }

      if (bullet.life <= 0 || bulletOutsideMaze(bullet)) {
        level.bullets.splice(i, 1);
        continue;
      }

      if (isWallAt(bullet.x, bullet.y)) {
        const cell = pointToCell(bullet.x, bullet.y);
        const wall = damageWall(cell);
        if (wall.hit) {
          const center = cellCenter(cell.c, cell.r);
          addBurst(center.x, center.y, wallImpactColor(wall, bullet), wallImpactBurstCount(wall));
          state.score += wall.unbreakable ? 3 : wall.broke ? 25 : 8;
          state.messageTimer = 0.75;
          state.toast = wallImpactToast(wall);
          ping(wallImpactSound(wall));
          updateHud();
          if (wall.broke && bullet.pierce > 0) {
            bullet.pierce -= 1;
            bullet.x += Math.sign(bullet.vx) * 8;
            bullet.y += Math.sign(bullet.vy) * 8;
            continue;
          }
        }
        level.bullets.splice(i, 1);
      }
    }
  }

  function wallImpactColor(wall, bullet) {
    if (wall.unbreakable) {
      return "#9ea9b6";
    }
    return wall.aftermath?.color || bullet.color || "#49e0ff";
  }

  function wallImpactBurstCount(wall) {
    if (wall.unbreakable) {
      return 8;
    }
    return wall.aftermath ? 18 : 12;
  }

  function wallImpactToast(wall) {
    if (wall.unbreakable) {
      return "Ancient block";
    }
    if (wall.aftermath?.type === "blackHole") {
      return "Black hole opened";
    }
    if (wall.aftermath?.type === "stickyGoo") {
      return "Sticky bio-glue";
    }
    if (wall.aftermath?.type === "repairRobot") {
      return "Repair bot deployed";
    }
    return wall.broke ? "Path opened" : `Wall damaged ${wall.hp}`;
  }

  function wallImpactSound(wall) {
    if (wall.aftermath?.type === "blackHole") {
      return "gravity";
    }
    if (wall.aftermath?.type === "stickyGoo") {
      return "goo";
    }
    if (wall.aftermath?.type === "repairRobot") {
      return "repair";
    }
    return "wall";
  }

  function bulletOutsideMaze(bullet) {
    return bullet.x < ORIGIN_X || bullet.x > ORIGIN_X + COLS * CELL || bullet.y < ORIGIN_Y || bullet.y > ORIGIN_Y + ROWS * CELL;
  }

  function damageWall(cell) {
    if (cell.r <= 0 || cell.r >= ROWS - 1 || cell.c <= 0 || cell.c >= COLS - 1) {
      return { hit: false, broke: false, hp: 0 };
    }
    const hp = level.grid[cell.r]?.[cell.c] || 0;
    if (hp === UNBREAKABLE_WALL) {
      return { hit: true, broke: false, hp, unbreakable: true };
    }
    if (hp <= 0) {
      return { hit: false, broke: false, hp: 0 };
    }
    level.grid[cell.r][cell.c] -= 1;
    if (level.grid[cell.r][cell.c] <= 0) {
      level.grid[cell.r][cell.c] = 0;
      return { hit: true, broke: true, hp: 0, aftermath: spawnWallAftermath(cell) };
    }
    return { hit: true, broke: false, hp: level.grid[cell.r][cell.c] };
  }

  function spawnWallAftermath(cell) {
    if (!level) {
      return null;
    }

    const roll = Math.random();
    const center = cellCenter(cell.c, cell.r);
    if (roll < BLACK_HOLE_CHANCE && level.blackHoles.length < maxBlackHolesForLevel()) {
      const blackHole = {
        ...center,
        homeX: center.x,
        homeY: center.y,
        c: cell.c,
        r: cell.r,
        radius: BLACK_HOLE_CORE_RADIUS,
        pullRadius: BLACK_HOLE_GRAVITY_RADIUS,
        spin: Math.random() * Math.PI * 2,
        driftVx: 0,
        driftVy: 0,
      };
      level.blackHoles.push(blackHole);
      return { type: "blackHole", color: "#7f5cff" };
    }

    if (roll < BLACK_HOLE_CHANCE + STICKY_GOO_CHANCE && level.stickyGoo.length < maxStickyGooForLevel()) {
      const goo = {
        ...center,
        c: cell.c,
        r: cell.r,
        radius: STICKY_GOO_RADIUS,
        wobble: Math.random() * Math.PI * 2,
      };
      level.stickyGoo.push(goo);
      return { type: "stickyGoo", color: "#79f28e" };
    }

    if (roll < BLACK_HOLE_CHANCE + STICKY_GOO_CHANCE + REPAIR_ROBOT_CHANCE) {
      const robot = spawnRepairRobot(cell, center);
      if (robot) {
        return { type: "repairRobot", color: "#9fdcff" };
      }
    }

    return null;
  }

  function maxBlackHolesForLevel() {
    return MAX_BLACK_HOLES_PER_MAP;
  }

  function maxStickyGooForLevel() {
    return Math.min(12, 6 + Math.floor(difficultyLevelForStage(state.stage) / 8));
  }

  function spawnRepairRobot(originCell, center) {
    if (!level?.repairRobots || level.repairRobots.length >= MAX_REPAIR_ROBOTS) {
      return null;
    }

    const targets = chooseRepairTargets(originCell);
    if (targets.length < 2) {
      return null;
    }

    const robot = {
      x: center.x,
      y: center.y,
      origin: { c: originCell.c, r: originCell.r },
      targets,
      targetIndex: 0,
      state: "emerge",
      timer: 0.32,
      age: 0,
      step: 0,
      angle: Math.random() * Math.PI * 2,
      alpha: 0,
      repairTarget: null,
      exitAngle: 0,
      shockSeed: Math.random() * 1000,
    };
    level.repairRobots.push(robot);
    addBurst(center.x, center.y, "#9fdcff", 12);
    return robot;
  }

  function chooseRepairTargets(originCell) {
    const chosen = [];
    const usedKeys = new Set();
    for (const robot of level.repairRobots || []) {
      for (const target of robot.targets || []) {
        if (!target.repaired && !target.skipped) {
          usedKeys.add(cellKey(target));
        }
      }
    }

    const collect = (minOpenNeighbors) => {
      const candidates = [];
      for (let r = Math.max(1, originCell.r - 5); r <= Math.min(ROWS - 2, originCell.r + 5); r += 1) {
        for (let c = Math.max(1, originCell.c - 5); c <= Math.min(COLS - 2, originCell.c + 5); c += 1) {
          const cell = { c, r };
          const key = cellKey(cell);
          if (usedKeys.has(key) || chosen.some((target) => cellKey(target) === key)) {
            continue;
          }
          const mazeDistance = manhattan(cell, originCell);
          if (mazeDistance === 0 || mazeDistance > 5 || !canRepairCell(cell, originCell, minOpenNeighbors)) {
            continue;
          }
          const center = cellCenter(c, r);
          const playerDistance = player ? distance(player, center) : 999;
          candidates.push({
            ...center,
            c,
            r,
            repaired: false,
            skipped: false,
            score: mazeDistance * 7 + Math.random() * 12 - Math.min(80, playerDistance) * 0.08,
          });
        }
      }

      candidates.sort((a, b) => a.score - b.score);
      for (const candidate of candidates) {
        if (chosen.length >= 2) {
          break;
        }
        chosen.push(candidate);
      }
    };

    collect(3);
    if (chosen.length < 2) {
      collect(2);
    }
    if (chosen.length < 2) {
      collect(1);
    }
    return chosen.slice(0, 2);
  }

  function canRepairCell(cell, originCell, minOpenNeighbors = 2) {
    if (cell.r <= 0 || cell.r >= ROWS - 1 || cell.c <= 0 || cell.c >= COLS - 1) {
      return false;
    }
    if (originCell && cell.c === originCell.c && cell.r === originCell.r) {
      return false;
    }
    if (level.grid[cell.r]?.[cell.c] !== 0 || countOpenNeighbors(level.grid, cell.c, cell.r) < minOpenNeighbors) {
      return false;
    }
    if (isProtectedRepairCell(cell)) {
      return false;
    }

    const center = cellCenter(cell.c, cell.r);
    if (player && distance(player, center) < CELL * 1.35) {
      return false;
    }
    if (level.boss && level.boss.hp > 0 && distance(level.boss, center) < CELL * 1.55) {
      return false;
    }
    return true;
  }

  function isProtectedRepairCell(cell) {
    const key = cellKey(cell);
    if (key === cellKey(level.start) || key === cellKey(level.gate)) {
      return true;
    }
    if (manhattan(cell, level.start) <= 1 || manhattan(cell, level.gate) <= 1) {
      return true;
    }
    if (level.cores.some((core) => cellKey(core) === key)) {
      return true;
    }
    if (level.boosts.some((boost) => !boost.taken && cellKey(boost) === key)) {
      return true;
    }
    if (level.blackHoles.some((blackHole) => cellKey(blackHole) === key)) {
      return true;
    }
    if (level.stickyGoo.some((goo) => cellKey(goo) === key)) {
      return true;
    }

    const center = cellCenter(cell.c, cell.r);
    return level.sentries.some((sentry) => distance(sentry, center) < CELL * 0.8);
  }

  function updateRepairRobots(dt) {
    if (!level?.repairRobots?.length) {
      return;
    }

    for (let i = level.repairRobots.length - 1; i >= 0; i -= 1) {
      const robot = level.repairRobots[i];
      robot.age += dt;
      robot.step += dt * 9;

      if (robot.state === "emerge") {
        robot.timer -= dt;
        robot.alpha = Math.min(1, robot.alpha + dt * 4.5);
        if (robot.timer <= 0) {
          robot.state = "walk";
        }
      } else if (robot.state === "walk") {
        const target = robot.targets[robot.targetIndex];
        if (!target) {
          beginRepairRobotExit(robot);
        } else if (!canRepairCell(target, robot.origin, 1)) {
          target.skipped = true;
          robot.targetIndex += 1;
        } else if (moveRepairRobotToward(robot, target.x, target.y, REPAIR_ROBOT_SPEED * dt)) {
          robot.state = "repair";
          robot.timer = REPAIR_ROBOT_BUILD_TIME;
          robot.repairTarget = target;
        }
      } else if (robot.state === "repair") {
        robot.timer -= dt;
        if (robot.timer <= 0) {
          finishRobotRepair(robot);
          robot.targetIndex += 1;
          robot.repairTarget = null;
          if (robot.targetIndex >= robot.targets.length) {
            beginRepairRobotExit(robot);
          } else {
            robot.state = "walk";
          }
        }
      } else if (robot.state === "leaving") {
        robot.timer -= dt;
        robot.x += Math.cos(robot.exitAngle) * REPAIR_ROBOT_SPEED * 0.72 * dt;
        robot.y += Math.sin(robot.exitAngle) * REPAIR_ROBOT_SPEED * 0.72 * dt;
        robot.alpha = Math.max(0, robot.timer / 1.15);
        if (robot.timer <= 0) {
          level.repairRobots.splice(i, 1);
        }
      }
    }
  }

  function moveRepairRobotToward(robot, targetX, targetY, amount) {
    const dx = targetX - robot.x;
    const dy = targetY - robot.y;
    const length = Math.hypot(dx, dy) || 1;
    robot.angle = Math.atan2(dy, dx);
    if (length <= amount) {
      robot.x = targetX;
      robot.y = targetY;
      return true;
    }
    robot.x += (dx / length) * amount;
    robot.y += (dy / length) * amount;
    return false;
  }

  function finishRobotRepair(robot) {
    const target = robot.repairTarget;
    if (!target || !canRepairCell(target, robot.origin, 1)) {
      if (target) {
        target.skipped = true;
      }
      return;
    }

    level.grid[target.r][target.c] = repairBlockHealth();
    target.repaired = true;
    addBurst(target.x, target.y, "#79f28e", 14);
    state.messageTimer = 0.8;
    state.toast = "Repair bot patched a block";
    ping("repair");
  }

  function repairBlockHealth() {
    return Math.max(1, Math.min(3, level.wallHits || 1));
  }

  function beginRepairRobotExit(robot) {
    if (robot.state === "leaving") {
      return;
    }
    const mazeCenterX = ORIGIN_X + (COLS * CELL) / 2;
    const mazeCenterY = ORIGIN_Y + (ROWS * CELL) / 2;
    robot.state = "leaving";
    robot.timer = 1.15;
    robot.exitAngle = Math.atan2(robot.y - mazeCenterY, robot.x - mazeCenterX);
    if (!Number.isFinite(robot.exitAngle)) {
      robot.exitAngle = robot.angle;
    }
  }

  function addBurst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35;
      const speed = 52 + Math.random() * 96;
      level.bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.55 + Math.random() * 0.25,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  function addBossExplosion(boss) {
    const colors = [
      boss.color || "#ff5aa7",
      boss.accent || "#49e0ff",
      boss.eye || "#ffca4f",
      "#f4f7fb",
    ];
    const radius = boss.r || 20;
    addBurst(boss.x, boss.y, boss.color || "#ff5aa7", 36);

    for (let i = 0; i < 128; i += 1) {
      const angle = (Math.PI * 2 * i) / 128 + (Math.random() - 0.5) * 0.28;
      const speed = 240 + Math.random() * 700;
      const life = 1.15 + Math.random() * 1.2;
      level.bursts.push({
        x: boss.x + Math.cos(angle) * radius * 0.45,
        y: boss.y + Math.sin(angle) * radius * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 3 + Math.random() * 6,
        color: colors[i % colors.length],
        drag: 0.988,
        kind: "spark",
      });
    }

    for (let i = 0; i < 5; i += 1) {
      const life = 0.55 + i * 0.15;
      level.bursts.push({
        x: boss.x,
        y: boss.y,
        vx: 0,
        vy: 0,
        life,
        maxLife: life,
        size: radius + 18 + i * 12,
        color: colors[i % colors.length],
        drag: 1,
        kind: "shockwave",
        growth: 270 + i * 95,
        lineWidth: Math.max(2, 7 - i),
      });
    }
  }

  function updateBursts(dt) {
    for (const spark of level.bursts) {
      if (spark.kind === "shockwave") {
        spark.size += (spark.growth || 220) * dt;
      } else {
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        const drag = spark.drag ?? 0.96;
        spark.vx *= drag;
        spark.vy *= drag;
      }
      spark.life -= dt;
    }
    level.bursts = level.bursts.filter((spark) => spark.life > 0);
  }

  function damageBoss(bullet) {
    const boss = level.boss;
    if (!boss || boss.hp <= 0) {
      return;
    }
    boss.hp -= 1;
    addBurst(boss.x, boss.y, bullet.color || boss.color, 10);
    state.cameraShake = Math.max(state.cameraShake, 0.25);
    if (boss.hp <= 0) {
      boss.hp = 0;
      level.bossRockets = [];
      state.score += 450 + state.raceProgress * 60;
      state.messageTimer = 1.35;
      state.toast = `${boss.name} defeated`;
      addBossExplosion(boss);
      state.cameraShake = Math.max(state.cameraShake, 2.8);
      ping("bossBoom");
    } else {
      state.score += 18;
      state.messageTimer = 0.65;
      state.toast = `${boss.name} ${boss.hp}/${boss.maxHp}`;
      ping("wall");
    }
    updateHud();
  }

  function pushTrail(power) {
    const back = player.angle + Math.PI;
    player.trail.push({
      x: player.x + Math.cos(back) * 13 + (Math.random() - 0.5) * 4,
      y: player.y + Math.sin(back) * 13 + (Math.random() - 0.5) * 4,
      life: power,
      size: 3 + power * 5,
      color: trailColor(),
    });
    if (player.trail.length > 42) {
      player.trail.shift();
    }
  }

  function collectItems() {
    for (const core of level.cores) {
      if (!core.collected && distance(player, core) < 21) {
        core.collected = true;
        state.score += 150 + state.stage * 25;
        ping("core");
        updateHud();
        offerUpgrade();
        return;
      }
    }

    for (const boost of level.boosts) {
      if (!boost.taken && distance(player, boost) < 20) {
        boost.taken = true;
        player.boost = 100;
        state.score += 80;
        state.messageTimer = 1.0;
        state.toast = "Boost refilled";
        ping("boost");
        updateHud();
      }
    }
  }

  function testHazards() {
    if (player.invulnerable > 0) {
      return;
    }

    const bossHit = level.boss && level.boss.hp > 0 && distance(player, level.boss) < player.r + level.boss.r + 2;
    const hit = bossHit || level.sentries.some((sentry) => distance(player, sentry) < player.r + sentry.r + 2);
    if (!hit) {
      return;
    }

    hurtPlayer();
  }

  function hurtPlayer() {
    if (state.mode !== "playing" || player.invulnerable > 0) {
      return;
    }

    resetShipMaintenance();
    state.lives -= 1;
    state.cameraShake = 1;
    ping("hit");
    if (state.lives <= 0) {
      state.mode = "gameover";
      saveBestScore();
      syncMusic();
    } else {
      player.x = player.spawnX;
      player.y = player.spawnY;
      player.boost = 100;
      player.invulnerable = state.loadout.shieldTime;
      player.trail = [];
      player.crumbs = [];
      player.crumbTimer = 0;
      resetAutoBoostHold();
    }
    updateHud();
  }

  function testGate() {
    const active = level.cores.every((core) => core.collected);
    if (!active || distance(player, level.gatePosition) > 24) {
      return;
    }

    const bonus = Math.max(60, Math.round(420 - state.levelTime * 7));
    state.score += bonus;
    ping("gate");
    const completedLevel = state.stage + 1;
    revealPuzzlePiece(completedLevel);
    if (completedLevel >= MAX_LEVELS) {
      rescueCurrentFriend();
      saveBestScore();
      openRescueMap(state.raceProgress >= FRIENDS_PER_RACE ? "raceComplete" : "nextPuzzle");
    } else {
      state.pendingStage = completedLevel;
      openRescueMap("pilotUpgrade");
    }
    updateHud();
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function render(time) {
    const shake = state.cameraShake > 0 ? state.cameraShake * 5 : 0;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    if (shake) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
    drawBackground(time);
    drawMaze();
    drawWallAftermath(time);
    drawGate(time);
    drawBoosts(time);
    drawCores(time);
    drawSentries(time);
    drawBoss(time);
    drawBossRockets();
    drawBullets();
    drawBursts();
    drawPlayer(time);
    drawFriendCheers(time);
    drawEnergy();
    drawOverlay(time);
    ctx.restore();
  }

  function drawBackground(time) {
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#06070d");
    gradient.addColorStop(0.46, "#141017");
    gradient.addColorStop(1, "#07100f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    for (const star of stars) {
      const x = (star.x - (state.elapsed * star.speed) % (WIDTH + 30) + WIDTH + 30) % (WIDTH + 30) - 15;
      const pulse = 0.5 + Math.sin(time * 0.0018 + star.twinkle) * 0.5;
      ctx.globalAlpha = 0.38 + pulse * 0.48;
      ctx.fillStyle = `rgb(${star.hue})`;
      ctx.beginPath();
      ctx.arc(x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#49e0ff";
    ctx.lineWidth = 1;
    for (let i = -5; i < 16; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 90 - (state.elapsed * 18) % 90, HEIGHT + 10);
      ctx.lineTo(i * 90 + 300 - (state.elapsed * 18) % 90, -10);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMaze() {
    ctx.save();
    ctx.translate(ORIGIN_X, ORIGIN_Y);

    ctx.fillStyle = "rgba(11, 16, 19, 0.92)";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const x = c * CELL;
        const y = r * CELL;
        if (level.grid[r][c] !== 0) {
          const hp = level.grid[r][c];
          if (hp === UNBREAKABLE_WALL) {
            const ancientShade = ctx.createLinearGradient(x + 1, y + 1, x + CELL - 1, y + CELL - 1);
            ancientShade.addColorStop(0, (c + r + state.stage) % 4 === 0 ? "#141a22" : "#0c1118");
            ancientShade.addColorStop(0.52, "#090e15");
            ancientShade.addColorStop(1, "#18202a");
            ctx.fillStyle = ancientShade;
            ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

            const blueShader = ctx.createLinearGradient(x + 2, y + CELL - 2, x + CELL - 2, y + 2);
            blueShader.addColorStop(0, "rgba(73, 224, 255, 0)");
            blueShader.addColorStop(0.48, "rgba(73, 224, 255, 0.14)");
            blueShader.addColorStop(1, "rgba(159, 220, 255, 0.03)");
            ctx.fillStyle = blueShader;
            ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);

            ctx.strokeStyle = "rgba(120, 145, 174, 0.34)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6);
          } else {
            const glow = (c + r + state.stage) % 5 === 0;
            const toughness = Math.min(1, (hp - 1) / 6);
            ctx.fillStyle = glow ? `rgb(${52 + toughness * 26}, ${58 + toughness * 20}, ${68 + toughness * 15})` : `rgb(${37 + toughness * 25}, ${42 + toughness * 18}, ${49 + toughness * 12})`;
            ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

            if (hp > 1) {
              const shader = ctx.createLinearGradient(x + 2, y + 2, x + CELL - 2, y + CELL - 2);
              if (hp >= 5) {
                shader.addColorStop(0, "rgba(255, 90, 167, 0.16)");
                shader.addColorStop(0.55, "rgba(73, 224, 255, 0.05)");
                shader.addColorStop(1, "rgba(255, 90, 167, 0)");
              } else {
                shader.addColorStop(0, "rgba(73, 224, 255, 0.12)");
                shader.addColorStop(0.6, "rgba(159, 220, 255, 0.04)");
                shader.addColorStop(1, "rgba(73, 224, 255, 0)");
              }
              ctx.fillStyle = shader;
              ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
            }

            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.fillRect(x + 3, y + 3, CELL - 6, 2);
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(x + 3, y + CELL - 5, CELL - 6, 2);
          }
        } else {
          ctx.fillStyle = (c + r) % 2 === 0 ? "rgba(255,255,255,0.022)" : "rgba(255,255,255,0.012)";
          ctx.fillRect(x, y, CELL, CELL);
          ctx.fillStyle = "rgba(73,224,255,0.055)";
          ctx.fillRect(x + CELL / 2 - 1, y + CELL / 2 - 1, 2, 2);
        }
      }
    }

    ctx.strokeStyle = "rgba(73,224,255,0.42)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, COLS * CELL - 2, ROWS * CELL - 2);
    ctx.restore();
  }

  function drawWallAftermath(time) {
    drawStickyGoo(time);
    drawBlackHoles(time);
    drawRepairRobots(time);
  }

  function drawStickyGoo(time) {
    if (!level?.stickyGoo?.length) {
      return;
    }

    for (const goo of level.stickyGoo) {
      const pulse = 0.5 + Math.sin(time * 0.005 + goo.wobble) * 0.5;
      const slimeTime = time * 0.001;
      ctx.save();
      ctx.translate(goo.x, goo.y);
      ctx.rotate(Math.sin(slimeTime * 0.7 + goo.wobble) * 0.09);

      ctx.fillStyle = "rgba(5, 28, 12, 0.34)";
      ctx.beginPath();
      ctx.ellipse(0, 3, goo.radius * 1.15, goo.radius * 0.74, 0, 0, Math.PI * 2);
      ctx.fill();

      const outer = ctx.createRadialGradient(-6, -6, 2, 0, 0, goo.radius * 1.28);
      outer.addColorStop(0, `rgba(190, 255, 155, ${0.38 + pulse * 0.12})`);
      outer.addColorStop(0.46, `rgba(93, 232, 92, ${0.52 + pulse * 0.12})`);
      outer.addColorStop(1, "rgba(26, 111, 43, 0.72)");
      ctx.fillStyle = outer;
      drawGooPuddlePath(goo.radius, goo.wobble, slimeTime, 1);
      ctx.fill();

      ctx.fillStyle = `rgba(33, 177, 57, ${0.34 + pulse * 0.08})`;
      drawGooPuddlePath(goo.radius * 0.68, goo.wobble + 1.7, slimeTime * 1.15, 0.92);
      ctx.fill();

      ctx.strokeStyle = "rgba(184, 255, 143, 0.5)";
      ctx.lineWidth = 2;
      drawGooPuddlePath(goo.radius * 0.98, goo.wobble, slimeTime, 1);
      ctx.stroke();

      ctx.strokeStyle = "rgba(121, 242, 142, 0.34)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i += 1) {
        const angle = goo.wobble + i * 1.7 + Math.sin(slimeTime * 1.6 + i) * 0.22;
        const startX = Math.cos(angle) * goo.radius * 0.28;
        const startY = Math.sin(angle) * goo.radius * 0.18;
        const endX = Math.cos(angle) * goo.radius * (0.62 + (i % 2) * 0.16);
        const endY = Math.sin(angle) * goo.radius * (0.4 + (i % 2) * 0.08);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo((startX + endX) * 0.55, startY - 4 - pulse * 3, endX, endY);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(232, 255, 213, 0.62)";
      ctx.beginPath();
      ctx.ellipse(-goo.radius * 0.28, -goo.radius * 0.22, goo.radius * 0.18, goo.radius * 0.08, -0.42, 0, Math.PI * 2);
      ctx.ellipse(goo.radius * 0.16, -goo.radius * 0.16, goo.radius * 0.1, goo.radius * 0.05, 0.25, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 7; i += 1) {
        const bubbleAngle = goo.wobble + i * 2.21;
        const bubblePulse = 0.5 + Math.sin(slimeTime * 3.4 + i + goo.wobble) * 0.5;
        const bx = Math.cos(bubbleAngle) * goo.radius * (0.12 + (i % 3) * 0.17);
        const by = Math.sin(bubbleAngle) * goo.radius * (0.08 + (i % 2) * 0.16);
        const br = 1.8 + (i % 3) * 0.75 + bubblePulse * 0.9;
        ctx.fillStyle = `rgba(199, 255, 176, ${0.32 + bubblePulse * 0.24})`;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(31, 111, 43, 0.38)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawGooPuddlePath(radius, wobble, time, scale) {
    const points = [];
    const count = 28;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const wobbleA = Math.sin(angle * 3 + wobble + time * 1.7) * 0.12;
      const wobbleB = Math.sin(angle * 5 - wobble * 0.6 + time * 1.1) * 0.08;
      const r = radius * scale * (1 + wobbleA + wobbleB);
      points.push({
        x: Math.cos(angle) * r * 1.06,
        y: Math.sin(angle) * r * 0.66,
      });
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= points.length; i += 1) {
      const previous = points[i - 1];
      const current = points[i % points.length];
      ctx.quadraticCurveTo(previous.x, previous.y, (previous.x + current.x) / 2, (previous.y + current.y) / 2);
    }
    ctx.closePath();
  }

  function drawRepairRobots(time) {
    if (!level?.repairRobots?.length) {
      return;
    }

    for (const robot of level.repairRobots) {
      const alpha = robot.alpha ?? 1;
      if (robot.state === "repair" && robot.repairTarget) {
        drawRepairPatch(robot, time, alpha);
      }
      drawRepairRobotBlockShocks(robot, time, alpha);

      const bob = Math.sin(robot.step) * 1.6;
      const legSwing = Math.sin(robot.step * 1.25);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(robot.x, robot.y);

      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
      ctx.beginPath();
      ctx.ellipse(0, 11, 13, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.rotate(robot.angle);
      ctx.translate(0, bob);

      ctx.strokeStyle = "rgba(159, 220, 255, 0.72)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (let i = 0; i < 4; i += 1) {
        const side = i < 2 ? -1 : 1;
        const offset = i % 2 === 0 ? -5 : 5;
        const swing = legSwing * side * (i % 2 === 0 ? 1 : -1);
        ctx.beginPath();
        ctx.moveTo(-4 + offset, side * 7);
        ctx.lineTo(-8 + offset + swing * 3, side * 12);
        ctx.stroke();
      }

      const glow = ctx.createRadialGradient(2, -1, 2, 2, -1, 18);
      glow.addColorStop(0, "rgba(121, 242, 142, 0.72)");
      glow.addColorStop(1, "rgba(73, 224, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(2, -1, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#172331";
      roundRect(-11, -9, 22, 18, 5);
      ctx.fill();
      ctx.strokeStyle = "#9fdcff";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = "#273a4c";
      roundRect(-3, -13, 15, 10, 4);
      ctx.fill();
      ctx.strokeStyle = "rgba(244, 247, 251, 0.35)";
      ctx.stroke();

      ctx.fillStyle = "#79f28e";
      ctx.beginPath();
      ctx.arc(7, -8, 2.6 + Math.sin(time * 0.012 + robot.age) * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffca4f";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-3, -13);
      ctx.lineTo(-6, -19);
      ctx.stroke();
      ctx.fillStyle = "#ffca4f";
      ctx.beginPath();
      ctx.arc(-6, -20, 2, 0, Math.PI * 2);
      ctx.fill();

      if (robot.state === "repair") {
        const spark = Math.sin(time * 0.036) * 3;
        ctx.strokeStyle = "#ffca4f";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(11, 2);
        ctx.lineTo(18, spark);
        ctx.stroke();

        ctx.strokeStyle = "rgba(121, 242, 142, 0.7)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i += 1) {
          const angle = time * 0.01 + i * 1.7;
          ctx.beginPath();
          ctx.moveTo(18, spark);
          ctx.lineTo(18 + Math.cos(angle) * 6, spark + Math.sin(angle) * 6);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  function drawRepairRobotBlockShocks(robot, time, alpha) {
    if (robot.state !== "repair" || !robot.repairTarget || robot.repairTarget.repaired || robot.repairTarget.skipped) {
      return;
    }
    drawRobotBlockShock(robot.repairTarget, time, robot.shockSeed || 0, alpha);
  }

  function drawRobotBlockShock(cell, time, seed, alpha) {
    if (!cell || alpha <= 0.03) {
      return;
    }

    const x = ORIGIN_X + cell.c * CELL;
    const y = ORIGIN_Y + cell.r * CELL;
    const cycle = time * 0.018 + seed;
    const flash = Math.max(0, Math.sin(cycle * 1.7) * 0.72 + Math.sin(cycle * 0.43 + 1.8) * 0.36);
    if (flash < 0.24) {
      return;
    }

    const electricAlpha = Math.min(0.92, alpha * (0.2 + flash * 0.66));
    ctx.save();
    ctx.globalAlpha = electricAlpha;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 10;

    const glowColor = hashNoise(seed + Math.floor(time * 0.012)) > 0.45 ? "#79f28e" : "#49e0ff";
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = glowColor === "#79f28e" ? "rgba(199, 255, 214, 0.9)" : "rgba(201, 245, 255, 0.9)";
    ctx.lineWidth = 1.35;
    ctx.strokeRect(x + 5, y + 5, CELL - 10, CELL - 10);

    const boltCount = flash > 0.7 ? 3 : 2;
    for (let i = 0; i < boltCount; i += 1) {
      const boltSeed = seed + i * 19.3 + Math.floor(time * 0.024) * 11;
      const color = hashNoise(boltSeed) > 0.5 ? "#49e0ff" : "#79f28e";
      ctx.strokeStyle = color;
      ctx.lineWidth = i === 0 ? 2.2 : 1.35;
      drawMiniLightningBolt(x, y, boltSeed);
    }

    ctx.restore();
  }

  function drawMiniLightningBolt(x, y, seed) {
    const horizontal = hashNoise(seed + 4.1) > 0.48;
    const start = horizontal
      ? { x: x + 4, y: y + 5 + hashNoise(seed + 1.3) * (CELL - 10) }
      : { x: x + 5 + hashNoise(seed + 1.3) * (CELL - 10), y: y + 4 };
    const end = horizontal
      ? { x: x + CELL - 4, y: y + 5 + hashNoise(seed + 2.9) * (CELL - 10) }
      : { x: x + 5 + hashNoise(seed + 2.9) * (CELL - 10), y: y + CELL - 4 };

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (let step = 1; step <= 3; step += 1) {
      const t = step / 4;
      const baseX = start.x + (end.x - start.x) * t;
      const baseY = start.y + (end.y - start.y) * t;
      const jitter = (hashNoise(seed + step * 8.4) - 0.5) * 9;
      ctx.lineTo(horizontal ? baseX : baseX + jitter, horizontal ? baseY + jitter : baseY);
    }
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  function hashNoise(value) {
    const x = Math.sin(value * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function drawRepairPatch(robot, time, alpha) {
    const target = robot.repairTarget;
    const progress = 1 - Math.max(0, robot.timer / REPAIR_ROBOT_BUILD_TIME);
    const x = ORIGIN_X + target.c * CELL;
    const y = ORIGIN_Y + target.r * CELL;
    const flicker = 0.5 + Math.sin(time * 0.026 + robot.age * 5) * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha * (0.38 + progress * 0.42);
    ctx.fillStyle = `rgba(121, 242, 142, ${0.08 + progress * 0.18})`;
    ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);

    ctx.strokeStyle = `rgba(159, 220, 255, ${0.48 + flicker * 0.28})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(x + 4, y + 4, CELL - 8, CELL - 8);
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(255, 202, 79, 0.82)";
    ctx.fillRect(x + 5, y + CELL - 7, (CELL - 10) * progress, 3);
    for (let i = 0; i < 6; i += 1) {
      const sparkAngle = time * 0.018 + i * 1.13;
      const sx = x + CELL / 2 + Math.cos(sparkAngle) * (5 + flicker * 4);
      const sy = y + CELL / 2 + Math.sin(sparkAngle) * (5 + flicker * 4);
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2 + flicker * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBlackHoles(time) {
    if (!level?.blackHoles?.length) {
      return;
    }

    for (const blackHole of level.blackHoles) {
      const pulse = 0.5 + Math.sin(time * 0.006 + blackHole.spin) * 0.5;
      ctx.save();
      ctx.translate(blackHole.x, blackHole.y);

      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, blackHole.pullRadius * 0.62);
      aura.addColorStop(0, "rgba(3, 2, 9, 0.98)");
      aura.addColorStop(0.2, "rgba(127, 92, 255, 0.38)");
      aura.addColorStop(0.52, "rgba(73, 224, 255, 0.12)");
      aura.addColorStop(1, "rgba(73, 224, 255, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, blackHole.pullRadius * 0.62, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 42; i += 1) {
        const speed = 0.00022 + (i % 7) * 0.000035;
        const cycle = (time * speed + i * 0.071 + blackHole.spin * 0.09) % 1;
        const spiral = 1 - cycle;
        const radius = blackHole.radius * 1.3 + spiral * blackHole.pullRadius * 0.86;
        const angle = blackHole.spin + i * 2.399 + time * (0.0015 + (i % 5) * 0.00025) + cycle * 7.2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const dustSize = (1.2 + (i % 4) * 0.45 + (1 - spiral) * 1.2) * 0.5;
        const alpha = Math.min(0.82, Math.max(0, Math.sin(cycle * Math.PI) * 0.72 + 0.1));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = i % 3 === 0 ? "#ffca4f" : i % 3 === 1 ? "#49e0ff" : "#f4f7fb";
        ctx.beginPath();
        ctx.ellipse(x, y, dustSize * 1.4, dustSize, angle, 0, Math.PI * 2);
        ctx.fill();

        if (i % 3 === 0) {
          ctx.globalAlpha = alpha * 0.34;
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - Math.cos(angle + 0.8) * dustSize * 5, y - Math.sin(angle + 0.8) * dustSize * 5);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#020107";
      ctx.beginPath();
      ctx.arc(0, 0, blackHole.radius + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(244, 247, 251, 0.34)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawGate(time) {
    const active = level.cores.every((core) => core.collected);
    const gate = level.gatePosition;
    const pulse = 0.5 + Math.sin(time * 0.006) * 0.5;

    ctx.save();
    ctx.translate(gate.x, gate.y);
    ctx.rotate(time * 0.0018);
    ctx.strokeStyle = active ? "#79f28e" : "#ff5f59";
    ctx.globalAlpha = active ? 0.85 : 0.45;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 18 + pulse * 4, 0.4, Math.PI * 1.32);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 25 - pulse * 3, Math.PI * 1.5, Math.PI * 2.86);
    ctx.stroke();
    ctx.fillStyle = active ? "rgba(121,242,142,0.2)" : "rgba(255,95,89,0.12)";
    ctx.beginPath();
    ctx.arc(0, 0, 13 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCores(time) {
    for (const core of level.cores) {
      if (core.collected) {
        continue;
      }
      const palette = ["#49e0ff", "#ffca4f", "#ff5aa7"];
      ctx.save();
      ctx.translate(core.x, core.y);
      ctx.rotate(core.spin + time * 0.003);
      ctx.fillStyle = palette[core.tone];
      ctx.globalAlpha = 0.24;
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = palette[core.tone];
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.globalAlpha = 0.45;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawBoosts(time) {
    for (const boost of level.boosts) {
      if (boost.taken) {
        continue;
      }
      const pulse = 0.5 + Math.sin(time * 0.007 + boost.x) * 0.5;
      ctx.save();
      ctx.translate(boost.x, boost.y);
      ctx.strokeStyle = "#ffca4f";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;
      ctx.strokeRect(-9, -11, 18, 22);
      ctx.fillStyle = `rgba(255,202,79,${0.24 + pulse * 0.18})`;
      ctx.fillRect(-5, -7, 10, 14);
      ctx.fillStyle = "#ffca4f";
      ctx.fillRect(-3, -14, 6, 3);
      ctx.restore();
    }
  }

  function drawSentries(time) {
    for (const sentry of level.sentries) {
      ctx.save();
      ctx.translate(sentry.x, sentry.y);
      ctx.rotate(sentry.spin + time * 0.001);
      ctx.strokeStyle = sentry.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(0, 0, sentry.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 4; i += 1) {
        const angle = i * Math.PI / 2;
        ctx.moveTo(Math.cos(angle) * 7, Math.sin(angle) * 7);
        ctx.lineTo(Math.cos(angle) * 17, Math.sin(angle) * 17);
      }
      ctx.stroke();
      ctx.fillStyle = sentry.color;
      ctx.globalAlpha = 0.24;
      ctx.beginPath();
      ctx.arc(0, 0, sentry.r + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBoss(time) {
    const boss = level.boss;
    if (!boss || boss.hp <= 0) {
      return;
    }

    const pulse = 0.5 + Math.sin(time * 0.008 + boss.pulse) * 0.5;
    if (boss.weapon === "tentacles") {
      drawBossTentacles(boss, time, pulse);
    }

    ctx.save();
    ctx.translate(boss.x, boss.y);
    drawBossGlow(boss, pulse);
    ctx.rotate(time * 0.0016 + Math.sin(boss.pulse) * 0.06);
    if (boss.shape === "crusher") {
      drawCrusherBoss(boss, pulse);
    } else if (boss.shape === "stalker") {
      drawStalkerBoss(boss, pulse);
    } else if (boss.shape === "maw") {
      drawMawBoss(boss, pulse);
    } else if (boss.shape === "caster") {
      drawCasterBoss(boss, pulse);
    } else if (boss.shape === "worm") {
      drawWormBoss(boss, pulse);
    }
    ctx.restore();

    drawBossHealthBar(boss);
  }

  function drawBossTentacles(boss, time, pulse) {
    if (!boss.tentacles?.length) {
      return;
    }

    for (const tentacle of boss.tentacles) {
      const progress = bossTentacleProgress(tentacle);
      if (progress <= 0 || !tentacle.path?.length) {
        continue;
      }

      const points = trimPolyline(bossTentacleWorldPoints(boss, tentacle), progress);
      if (points.length < 2) {
        continue;
      }

      const dangerous = tentacle.state === "strike";
      const width = (boss.tentacleWidth || WORM_ARM_WIDTH) * (dangerous ? 1.1 : 0.92);
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.strokeStyle = "rgba(0, 0, 0, 0.42)";
      ctx.lineWidth = width + 8;
      strokePolyline(points);

      ctx.strokeStyle = dangerous ? boss.accent : boss.color;
      ctx.globalAlpha = dangerous ? 0.96 : 0.74;
      ctx.lineWidth = width;
      strokePolyline(points);

      ctx.strokeStyle = dangerous ? "rgba(255, 202, 79, 0.72)" : "rgba(244, 247, 251, 0.28)";
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.2;
      strokePolyline(points);

      drawTentacleSuckers(points, boss, time, tentacle, pulse, dangerous);
      drawTentacleTip(points[points.length - 1], boss, time, dangerous);
      ctx.restore();
    }
  }

  function strokePolyline(points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  function drawTentacleSuckers(points, boss, time, tentacle, pulse, dangerous) {
    let marker = 18 + tentacle.index * 4;
    const total = polylineLength(points);
    while (marker < total - 8) {
      const dot = pointAlongPolyline(points, marker);
      const wiggle = 0.5 + Math.sin(time * 0.014 + marker * 0.09 + tentacle.age) * 0.5;
      ctx.fillStyle = dangerous ? "rgba(255, 202, 79, 0.78)" : "rgba(244, 247, 251, 0.48)";
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 2.1 + wiggle * 0.9 + pulse * 0.4, 0, Math.PI * 2);
      ctx.fill();
      marker += 19;
    }
  }

  function drawTentacleTip(point, boss, time, dangerous) {
    const glow = 0.5 + Math.sin(time * 0.022) * 0.5;
    ctx.fillStyle = dangerous ? boss.eye : boss.accent;
    ctx.shadowColor = dangerous ? boss.eye : boss.accent;
    ctx.shadowBlur = dangerous ? 13 : 7;
    ctx.beginPath();
    ctx.arc(point.x, point.y, dangerous ? 7 + glow * 2 : 5 + glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function pointAlongPolyline(points, targetLength) {
    let traveled = 0;
    for (let i = 1; i < points.length; i += 1) {
      const previous = points[i - 1];
      const current = points[i];
      const segmentLength = distance(previous, current);
      if (traveled + segmentLength >= targetLength) {
        const t = segmentLength > 0 ? (targetLength - traveled) / segmentLength : 0;
        return {
          x: previous.x + (current.x - previous.x) * t,
          y: previous.y + (current.y - previous.y) * t,
        };
      }
      traveled += segmentLength;
    }
    return points[points.length - 1];
  }

  function drawBossGlow(boss, pulse) {
    ctx.fillStyle = boss.color;
    ctx.globalAlpha = 0.2 + pulse * 0.14;
    ctx.beginPath();
    ctx.arc(0, 0, boss.r + 13 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawCrusherBoss(boss, pulse) {
    ctx.fillStyle = "#071329";
    roundRect(-17, -20, 34, 42, 6);
    ctx.fill();
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = boss.color;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * 21, 2, 11, 18, side * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = boss.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = boss.accent;
    roundRect(-7, -11, 14, 22, 4);
    ctx.fill();
    ctx.fillStyle = boss.eye;
    ctx.beginPath();
    ctx.arc(0, -3, 4 + pulse * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, 20);
    ctx.lineTo(-17, 29);
    ctx.moveTo(10, 20);
    ctx.lineTo(17, 29);
    ctx.stroke();
  }

  function drawStalkerBoss(boss, pulse) {
    ctx.fillStyle = "#160719";
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(20, 1);
    ctx.lineTo(7, 24);
    ctx.lineTo(-7, 24);
    ctx.lineTo(-20, 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = boss.accent;
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 11, 4);
      ctx.lineTo(side * (27 + pulse * 4), -7);
      ctx.moveTo(side * 8, 14);
      ctx.lineTo(side * 23, 25);
      ctx.stroke();
    }

    ctx.fillStyle = boss.eye;
    ctx.beginPath();
    ctx.arc(-6, -4, 3, 0, Math.PI * 2);
    ctx.arc(6, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = boss.color;
    ctx.beginPath();
    ctx.arc(0, 9, 4 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMawBoss(boss, pulse) {
    ctx.fillStyle = "#1b0705";
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 24, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = boss.color;
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8 + 0.2;
      const inner = boss.r - 2;
      const outer = boss.r + 10 + (i % 2) * 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle - 0.13) * inner, Math.sin(angle - 0.13) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.lineTo(Math.cos(angle + 0.13) * inner, Math.sin(angle + 0.13) * inner);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = boss.accent;
    ctx.beginPath();
    ctx.ellipse(0, 7, 10 + pulse * 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#100405";
    ctx.beginPath();
    ctx.ellipse(0, 7, 6, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.eye;
    ctx.beginPath();
    ctx.arc(-7, -7, 3.5, 0, Math.PI * 2);
    ctx.arc(7, -7, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCasterBoss(boss, pulse) {
    ctx.strokeStyle = "rgba(244, 247, 251, 0.52)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, boss.r + 14, 0.3, Math.PI * 1.55);
    ctx.stroke();
    ctx.strokeStyle = boss.accent;
    ctx.beginPath();
    ctx.arc(0, 0, boss.r + 19, Math.PI * 1.2, Math.PI * 2.2);
    ctx.stroke();

    ctx.fillStyle = "#211704";
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(18, -3);
    ctx.lineTo(12, 21);
    ctx.lineTo(0, 28);
    ctx.lineTo(-12, 21);
    ctx.lineTo(-18, -3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = boss.color;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 10, -8);
      ctx.lineTo(side * 27, -17);
      ctx.lineTo(side * 20, 6);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = boss.accent;
    ctx.shadowColor = boss.accent;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 2, 6 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = boss.eye;
    ctx.beginPath();
    ctx.arc(-5, -7, 3, 0, Math.PI * 2);
    ctx.arc(5, -7, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawWormBoss(boss, pulse) {
    ctx.fillStyle = "#061b0d";
    for (let i = 4; i >= 0; i -= 1) {
      const offset = i - 2;
      const x = offset * 7;
      const y = Math.sin(boss.pulse * 0.7 + i) * 3;
      ctx.beginPath();
      ctx.ellipse(x, y, 13 - Math.abs(offset) * 1.3, 20 - Math.abs(offset) * 1.8, offset * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = i % 2 === 0 ? boss.color : boss.accent;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    ctx.fillStyle = boss.color;
    for (let i = 0; i < 9; i += 1) {
      const angle = (Math.PI * 2 * i) / 9 + boss.pulse * 0.05;
      const r = boss.r + 4 + (i % 2) * 3;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r * 0.72, Math.sin(angle) * r * 0.82, 2.3 + pulse * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    const mouthPulse = 0.55 + pulse * 0.45;
    ctx.fillStyle = "#030704";
    ctx.beginPath();
    ctx.ellipse(0, 6, 9 + pulse * 2, 6 * mouthPulse, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(244, 247, 251, 0.5)";
    ctx.lineWidth = 1.4;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 3, 5);
      ctx.lineTo(side * 9, 9 + pulse * 2);
      ctx.stroke();
    }

    ctx.fillStyle = boss.eye;
    ctx.shadowColor = boss.eye;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-6, -9, 3.6 + pulse, 0, Math.PI * 2);
    ctx.arc(6, -9, 3.6 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = boss.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -18);
    ctx.quadraticCurveTo(-14, -25 - pulse * 4, -4, -27);
    ctx.moveTo(8, -18);
    ctx.quadraticCurveTo(14, -25 - pulse * 4, 4, -27);
    ctx.stroke();
  }

  function drawBossHealthBar(boss) {
    ctx.save();
    const barWidth = Math.max(58, boss.r * 3.4);
    const x = boss.x - barWidth / 2;
    const y = boss.y - boss.r - 22;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(x, y, barWidth, 7);
    ctx.fillStyle = boss.color;
    ctx.fillRect(x, y, barWidth * (boss.hp / boss.maxHp), 7);
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.strokeRect(x, y, barWidth, 7);
    ctx.restore();
  }

  function drawBossRockets() {
    for (const rocket of level.bossRockets) {
      ctx.save();
      for (const dot of rocket.trail) {
        ctx.globalAlpha = Math.max(0, dot.life) * 0.6;
        ctx.fillStyle = "#ffca4f";
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 7 * dot.life, 0, Math.PI * 2);
        ctx.fill();
      }
      const angle = Math.atan2(rocket.vy, rocket.vx);
      ctx.translate(rocket.x, rocket.y);
      ctx.rotate(angle);
      ctx.globalAlpha = 0.26;
      ctx.fillStyle = rocket.color || "#ff5aa7";
      ctx.beginPath();
      ctx.arc(0, 0, rocket.r + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = rocket.color || "#ff5aa7";
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(-7, -6);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffca4f";
      ctx.beginPath();
      ctx.arc(-8, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBullets() {
    for (const bullet of level.bullets) {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.fillStyle = bullet.color || state.loadout.bulletColor;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(0, 0, bullet.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      ctx.arc(0, 0, bullet.r + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBursts() {
    for (const spark of level.bursts) {
      const alpha = Math.max(0, Math.min(1, spark.maxLife ? spark.life / spark.maxLife : spark.life));
      ctx.save();
      if (spark.kind === "shockwave") {
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = Math.max(1, (spark.lineWidth || 4) * alpha);
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * (0.75 + (1 - alpha) * 0.65), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawPlayer(time) {
    drawShipCrumbs(time);

    ctx.save();
    for (const dot of player.trail) {
      ctx.globalAlpha = Math.max(0, dot.life);
      ctx.fillStyle = dot.color || state.loadout.trail;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size * dot.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    const flicker = player.invulnerable > 0 && Math.floor(time / 90) % 2 === 0;
    ctx.globalAlpha = flicker ? 0.52 : 1;
    drawShipAvatar(time, flicker);
    ctx.restore();

    if (player.invulnerable > 0) {
      ctx.save();
      ctx.globalAlpha = 0.28 + Math.sin(time * 0.012) * 0.12;
      ctx.strokeStyle = "#79f28e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    drawShipMaintenance(time);
  }

  function drawShipCrumbs(time) {
    if (!player.crumbs?.length) {
      return;
    }

    ctx.save();
    for (const crumb of player.crumbs) {
      const alpha = Math.max(0, crumb.life / crumb.maxLife);
      const pulse = 0.72 + Math.sin(time * 0.008 + crumb.drift) * 0.18;
      ctx.globalAlpha = alpha * 0.58;
      ctx.fillStyle = crumb.color;
      ctx.beginPath();
      ctx.arc(crumb.x, crumb.y, Math.max(0.45, crumb.size * pulse * (0.55 + alpha * 0.45)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawShipAvatar(time, flicker) {
    const avatar = SHIP_AVATARS.find((ship) => ship.id === state.shipAvatar)?.id || "dart";
    if (avatar === "manta") {
      drawMantaShip(time, flicker);
    } else if (avatar === "beetle") {
      drawBeetleShip(time, flicker);
    } else if (avatar === "fang") {
      drawFangShip(time, flicker);
    } else {
      drawDartShip(time, flicker);
    }
  }

  function drawDartShip(time, flicker) {
    ctx.fillStyle = state.loadout.paint;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-12, -10);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-12, 10);
    ctx.closePath();
    ctx.fill();
    strokeShipHull(flicker);
    drawShipCockpit(1, 0, 6, 4);
    drawShipFlame(time, -12, 0, 1);
  }

  function drawMantaShip(time, flicker) {
    ctx.fillStyle = state.loadout.paint;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(3, -13);
    ctx.lineTo(-18, -12);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-18, 12);
    ctx.lineTo(3, 13);
    ctx.closePath();
    ctx.fill();
    strokeShipHull(flicker);
    drawShipCockpit(2, 0, 5.5, 4.2);
    drawShipWingGlow(time, -3, -9);
    drawShipWingGlow(time, -3, 9);
    drawShipFlame(time, -16, 0, 0.92);
  }

  function drawBeetleShip(time, flicker) {
    ctx.fillStyle = state.loadout.paint;
    ctx.beginPath();
    ctx.ellipse(1, 0, 17, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(-3, -10, 2, 20);
    strokeShipHull(flicker);
    ctx.fillStyle = state.loadout.trim;
    ctx.globalAlpha = flicker ? 0.25 : 0.48;
    ctx.beginPath();
    ctx.ellipse(-4, -12, 12, 4, -0.22, 0, Math.PI * 2);
    ctx.ellipse(-4, 12, 12, 4, 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = flicker ? 0.52 : 1;
    drawShipCockpit(5, 0, 5, 5);
    drawShipFlame(time, -15, 0, 0.82);
  }

  function drawFangShip(time, flicker) {
    ctx.fillStyle = state.loadout.paint;
    ctx.beginPath();
    ctx.moveTo(18, -8);
    ctx.lineTo(0, -10);
    ctx.lineTo(-12, -4);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-12, 4);
    ctx.lineTo(0, 10);
    ctx.lineTo(18, 8);
    ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fill();
    strokeShipHull(flicker);
    drawShipCockpit(0, 0, 4.5, 4);
    ctx.strokeStyle = state.loadout.cockpit;
    ctx.lineWidth = 2;
    ctx.globalAlpha = flicker ? 0.32 : 0.78;
    ctx.beginPath();
    ctx.moveTo(7, -5);
    ctx.lineTo(17, -8);
    ctx.moveTo(7, 5);
    ctx.lineTo(17, 8);
    ctx.stroke();
    ctx.globalAlpha = flicker ? 0.52 : 1;
    drawShipFlame(time, -12, 0, 1.1);
  }

  function strokeShipHull(flicker) {
    ctx.strokeStyle = state.loadout.trim;
    ctx.globalAlpha = flicker ? 0.34 : 0.58;
    ctx.stroke();
    ctx.globalAlpha = flicker ? 0.52 : 1;
  }

  function drawShipCockpit(x, y, radiusX, radiusY) {
    ctx.fillStyle = state.loadout.cockpit;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawShipFlame(time, x, y, scale) {
    ctx.fillStyle = trailColor(time);
    ctx.beginPath();
    ctx.moveTo(x, y - 4 * scale);
    ctx.lineTo(x - (10 + Math.sin(time * 0.02) * 5) * scale, y);
    ctx.lineTo(x, y + 4 * scale);
    ctx.closePath();
    ctx.fill();
  }

  function drawShipWingGlow(time, x, y) {
    ctx.save();
    ctx.fillStyle = state.loadout.cockpit;
    ctx.globalAlpha = 0.42 + Math.sin(time * 0.018 + y) * 0.12;
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawShipMaintenance(time) {
    if (!player || player.idleTime < SHIP_MAINTENANCE_IDLE_SECONDS) {
      return;
    }

    const repairTime = player.idleTime - SHIP_MAINTENANCE_IDLE_SECONDS;
    const duration = player.maintenanceDuration || SHIP_MAINTENANCE_MIN_SECONDS;
    if (repairTime > duration) {
      return;
    }

    const exitProgress = Math.min(1, repairTime / SHIP_MAINTENANCE_EXIT_TIME);
    const returnProgress = Math.min(1, Math.max(0, repairTime - (duration - SHIP_MAINTENANCE_EXIT_TIME)) / SHIP_MAINTENANCE_EXIT_TIME);
    const easedOut = exitProgress * exitProgress * (3 - 2 * exitProgress);
    const easedIn = returnProgress * returnProgress * (3 - 2 * returnProgress);
    const eased = easedOut * (1 - easedIn);
    const hatchOpen = smoothStep01(Math.min(1, repairTime / 0.32))
      * (1 - smoothStep01(Math.min(1, Math.max(0, repairTime - (duration - 0.42)) / 0.42)));
    const side = player.maintenanceSide || 1;
    const sideAngle = player.angle + side * Math.PI * 0.5;
    const hatch = {
      x: player.x + Math.cos(sideAngle) * 7 + Math.cos(player.angle) * 1,
      y: player.y + Math.sin(sideAngle) * 7 + Math.sin(player.angle) * 1,
    };
    const workSpot = {
      x: player.x + Math.cos(sideAngle) * 24 - Math.cos(player.angle) * 3,
      y: player.y + Math.sin(sideAngle) * 24 - Math.sin(player.angle) * 3,
    };
    const pilot = {
      x: hatch.x + (workSpot.x - hatch.x) * eased,
      y: hatch.y + (workSpot.y - hatch.y) * eased + Math.sin(time * 0.011) * 1.1 * eased,
    };
    const repairPoint = {
      x: player.x + Math.cos(sideAngle) * 13 - Math.cos(player.angle) * 6,
      y: player.y + Math.sin(sideAngle) * 13 - Math.sin(player.angle) * 6,
    };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawShipHatch(hatch, repairPoint, sideAngle, hatchOpen, time);
    if (hatchOpen > 0.04) {
      drawPilotMechanic(pilot, repairPoint, sideAngle, repairTime, 1);
    }
    if (eased > 0.72) {
      drawShipBoltWork(repairPoint, sideAngle, repairTime);
    }
    ctx.restore();
  }

  function drawShipHatch(hatch, repairPoint, sideAngle, hatchOpen, time) {
    const outwardX = Math.cos(sideAngle);
    const outwardY = Math.sin(sideAngle);
    const forwardX = Math.cos(player.angle);
    const forwardY = Math.sin(player.angle);
    ctx.save();
    ctx.globalAlpha = 0.16 + hatchOpen * 0.42;
    ctx.strokeStyle = state.loadout.cockpit;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hatch.x, hatch.y);
    ctx.lineTo(repairPoint.x, repairPoint.y);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(2, 5, 9, 0.88)";
    ctx.beginPath();
    ctx.ellipse(hatch.x, hatch.y, 7.4, 4.4, player.angle, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = state.loadout.cockpit;
    ctx.globalAlpha = 0.42 + hatchOpen * 0.32;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(121, 242, 142, 0.3)";
    ctx.beginPath();
    ctx.ellipse(hatch.x, hatch.y, 4 + Math.sin(time * 0.02) * 0.8, 2.2, player.angle, 0, Math.PI * 2);
    ctx.fill();

    const hingeX = hatch.x - forwardX * 4.5;
    const hingeY = hatch.y - forwardY * 4.5;
    const doorX = hatch.x + outwardX * (2 + hatchOpen * 8) + forwardX * Math.sin(hatchOpen * Math.PI) * 2;
    const doorY = hatch.y + outwardY * (2 + hatchOpen * 8) + forwardY * Math.sin(hatchOpen * Math.PI) * 2;

    ctx.strokeStyle = "rgba(244, 247, 251, 0.38)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(hingeX, hingeY);
    ctx.lineTo(doorX - forwardX * 4, doorY - forwardY * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(doorX, doorY);
    ctx.rotate(player.angle + player.maintenanceSide * hatchOpen * 0.82);
    ctx.fillStyle = "#0d1823";
    roundRect(-5, -3, 10, 6, 2);
    ctx.fill();
    ctx.strokeStyle = state.loadout.trim;
    ctx.globalAlpha = 0.72;
    ctx.stroke();
    ctx.fillStyle = state.loadout.cockpit;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(-2, -1, 4, 2);
    ctx.restore();
    ctx.restore();
  }

  function drawPilotMechanic(pilot, repairPoint, sideAngle, repairTime, progress) {
    const toolAngle = Math.atan2(repairPoint.y - pilot.y, repairPoint.x - pilot.x);
    const hammerSwing = Math.sin(repairTime * 18);
    const drillBuzz = Math.sin(repairTime * 55) * 1.5;
    const usingDrill = player.maintenanceTool === "drill";

    ctx.save();
    ctx.globalAlpha = progress;
    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.ellipse(pilot.x, pilot.y + 8, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(pilot.x, pilot.y);
    ctx.rotate(toolAngle);

    ctx.strokeStyle = state.loadout.trim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, 4);
    ctx.lineTo(1, 8);
    ctx.moveTo(4, 4);
    ctx.lineTo(8, 8);
    ctx.stroke();

    ctx.fillStyle = state.loadout.paint;
    roundRect(-5, -4, 12, 11, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(244, 247, 251, 0.42)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = state.loadout.cockpit;
    ctx.beginPath();
    ctx.arc(0, -9, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(244, 247, 251, 0.78)";
    ctx.beginPath();
    ctx.ellipse(2, -10, 2.2, 1.4, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = state.loadout.trim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(5, -1);
    ctx.lineTo(10, -2 + (usingDrill ? drillBuzz * 0.25 : hammerSwing * 2.4));
    ctx.stroke();

    if (usingDrill) {
      ctx.fillStyle = "#9fdcff";
      roundRect(8, -5 + drillBuzz * 0.18, 10, 6, 2);
      ctx.fill();
      ctx.strokeStyle = "#f4f7fb";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(18, -2 + drillBuzz * 0.18);
      ctx.lineTo(23, -2 + drillBuzz * 0.18);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#ffca4f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(9, -5 + hammerSwing * 2.4);
      ctx.lineTo(19, -7 + hammerSwing * 2.4);
      ctx.stroke();
      ctx.fillStyle = "#9ea9b6";
      roundRect(17, -10 + hammerSwing * 2.4, 6, 6, 1.5);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawShipBoltWork(repairPoint, sideAngle, repairTime) {
    const sparkPulse = 0.5 + Math.sin(repairTime * 32) * 0.5;
    ctx.save();
    ctx.translate(repairPoint.x, repairPoint.y);
    ctx.rotate(sideAngle);

    ctx.fillStyle = "rgba(244, 247, 251, 0.82)";
    for (const y of [-4, 4]) {
      ctx.beginPath();
      ctx.arc(0, y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = player.maintenanceTool === "drill" ? "#9fdcff" : "#ffca4f";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i += 1) {
      const angle = repairTime * 8 + i * 1.26;
      const length = 4 + sparkPulse * 5 + (i % 2) * 2;
      ctx.globalAlpha = 0.25 + sparkPulse * 0.45;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 3, Math.sin(angle) * 3);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawFriendCheers(time) {
    if (!level?.friendCheers?.length) {
      return;
    }

    for (const cheer of level.friendCheers) {
      drawFriendCheer(cheer, time);
    }
  }

  function drawFriendCheer(cheer, time) {
    const enter = smoothStep01(Math.min(1, cheer.age / 0.45));
    const leave = smoothStep01(Math.min(1, (cheer.duration - cheer.age) / 0.45));
    const visibility = Math.max(0, Math.min(enter, leave));
    if (visibility <= 0) {
      return;
    }

    const x = cheer.fromX + (cheer.toX - cheer.fromX) * visibility;
    const y = cheer.fromY + (cheer.toY - cheer.fromY) * visibility + Math.sin(time * 0.01 + cheer.waveSeed) * 2;
    const facing = cheer.side === "right" ? -1 : 1;
    drawCheerBubble(x, y, cheer.message, cheer.friend.color, facing, visibility);
    drawCheerFriendBody(x, y, cheer.friend, facing, visibility, time, cheer.waveSeed);
  }

  function drawCheerFriendBody(x, y, friend, facing, visibility, time, seed) {
    const wave = Math.sin(time * 0.015 + seed);
    ctx.save();
    ctx.globalAlpha = visibility;
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
    ctx.beginPath();
    ctx.ellipse(0, 15, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = friend.color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7, 4);
    ctx.quadraticCurveTo(-17, -2 - wave * 5, -12, -11 - Math.max(0, wave) * 4);
    ctx.moveTo(7, 4);
    ctx.quadraticCurveTo(15, 8, 19, 1 + wave * 2);
    ctx.stroke();

    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
    glow.addColorStop(0, friend.color);
    glow.addColorStop(1, "rgba(244, 247, 251, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#071016";
    ctx.beginPath();
    ctx.ellipse(0, 2, 10, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = friend.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = friend.color;
    ctx.beginPath();
    ctx.ellipse(0, -9, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f4f7fb";
    ctx.beginPath();
    ctx.arc(-3, -10, 1.7, 0, Math.PI * 2);
    ctx.arc(4, -10, 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(244, 247, 251, 0.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(1, -6, 3, 0.1, Math.PI - 0.1);
    ctx.stroke();

    ctx.fillStyle = friend.color;
    ctx.beginPath();
    ctx.arc(-6, -17, 2.3 + Math.max(0, wave) * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCheerBubble(x, y, text, color, facing, visibility) {
    ctx.save();
    ctx.globalAlpha = visibility * 0.94;
    ctx.font = "800 12px system-ui, sans-serif";
    const width = Math.max(34, ctx.measureText(text).width + 18);
    const height = 24;
    const offsetX = facing > 0 ? 16 : -16 - width;
    const bubbleX = Math.max(8, Math.min(WIDTH - width - 8, x + offsetX));
    const bubbleY = Math.max(44, Math.min(HEIGHT - height - 44, y - 36));

    ctx.fillStyle = "rgba(5, 10, 15, 0.82)";
    roundRect(bubbleX, bubbleY, width, height, 7);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#f4f7fb";
    ctx.fillText(text, bubbleX + 9, bubbleY + 16);
    ctx.restore();
  }

  function smoothStep01(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function trailColor(time = performance.now()) {
    if (!state.loadout.rainbowTrail) {
      return state.loadout.trail;
    }
    const hue = Math.floor((time * 0.12) % 360);
    return `hsl(${hue}, 94%, 64%)`;
  }

  function drawEnergy() {
    const x = ORIGIN_X;
    const y = HEIGHT - 32;
    const width = COLS * CELL;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(x, y, width, 10);
    const energyWidth = width * (player.boost / 100);
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, "#49e0ff");
    gradient.addColorStop(0.55, "#79f28e");
    gradient.addColorStop(1, "#ffca4f");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, energyWidth, 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(x, y, width, 10);
    ctx.fillStyle = "rgba(244,247,251,0.7)";
    ctx.font = "700 12px system-ui, sans-serif";
    ctx.fillText(`SHIFT OR HOLD MOVE BOOST   SPACE BLASTER ${player.reload <= 0 ? "READY" : "CHARGING"}`, x, y - 8);
    ctx.restore();
  }

  function drawOverlay(time) {
    if (state.mode === "playing") {
      if (state.messageTimer > 0 && state.toast) {
        drawToast();
      }
      return;
    }

    let title = "";
    let subtitle = "";
    if (state.mode === "ready") {
      title = "STAR MAZE DODGER";
      subtitle = "Collect reactor cores. Space shoots. Shift boosts. Find the warp gate.";
    } else if (state.mode === "paused") {
      title = "PAUSED";
      subtitle = "The maze is holding still.";
    } else if (state.mode === "gameover") {
      title = "MISSION LOST";
      subtitle = `Score ${state.score}. Launch again for a cleaner run.`;
    } else if (state.mode === "won") {
      title = "RACE RESCUED";
      subtitle = `${state.pilot?.title || "This race"} has ${state.raceProgress}/${FRIENDS_PER_RACE} friends safe.`;
    }

    if (!title) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(3, 5, 8, 0.58)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const panelWidth = Math.min(680, WIDTH - 80);
    const panelHeight = 150;
    const x = (WIDTH - panelWidth) / 2;
    const y = (HEIGHT - panelHeight) / 2;
    ctx.fillStyle = "rgba(13, 17, 22, 0.76)";
    ctx.strokeStyle = "rgba(73, 224, 255, 0.42)";
    ctx.lineWidth = 2;
    roundRect(x, y, panelWidth, panelHeight, 8);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#f4f7fb";
    ctx.font = "900 42px system-ui, sans-serif";
    ctx.fillText(title, WIDTH / 2, y + 62);
    ctx.fillStyle = "rgba(244,247,251,0.76)";
    ctx.font = "700 17px system-ui, sans-serif";
    ctx.fillText(subtitle, WIDTH / 2, y + 98);

    if (state.mode === "ready" || state.mode === "gameover" || state.mode === "won") {
      ctx.fillStyle = "#ffca4f";
      ctx.font = "800 14px system-ui, sans-serif";
      ctx.fillText("Press Launch or Enter", WIDTH / 2, y + 126);
    }
    ctx.restore();
  }

  function drawToast() {
    const width = Math.min(260, WIDTH - 40);
    const x = (WIDTH - width) / 2;
    const y = 22;
    ctx.save();
    ctx.fillStyle = "rgba(13, 17, 22, 0.82)";
    ctx.strokeStyle = "rgba(255, 202, 79, 0.55)";
    ctx.lineWidth = 1.5;
    roundRect(x, y, width, 42, 8);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffca4f";
    ctx.font = "800 15px system-ui, sans-serif";
    ctx.fillText(state.toast, WIDTH / 2, y + 27);
    ctx.restore();
  }

  function renderPilotChoices() {
    ui.pilotChoices.innerHTML = PILOTS.map((pilot, index) => `
      <button class="pilot-choice" type="button" data-pilot="${index}" style="--pilot-color: ${pilot.color}">
        ${avatarHtml(pilot)}
        <strong>${pilot.name}</strong>
        <em>${pilot.title}</em>
        <span>${pilot.detail} ${state.campaign?.[pilot.id]?.rescued || 0}/${FRIENDS_PER_RACE} friends rescued.</span>
        <span class="pilot-key">${index + 1}</span>
      </button>
    `).join("");
  }

  function selectPilot(index) {
    const pilot = PILOTS[index];
    if (!pilot || state.mode !== "select") {
      return;
    }
    state.pilot = pilot;
    state.pilotLevel = 1;
    state.raceProgress = state.campaign[pilot.id]?.rescued || 0;
    state.puzzlePieces = 0;
    state.mapView = "current";
    state.archiveIndex = 0;
    state.rescuedFriend = null;
    state.loadout = makeBaseLoadout();
    pilot.apply(state.loadout, state, player);
    ui.pilotPanel.hidden = true;
    renderPilotHud();
    if (state.raceProgress >= FRIENDS_PER_RACE) {
      state.puzzlePieces = MAX_LEVELS;
      state.rescuedFriend = FRIEND_ROSTER[pilot.id]?.[FRIENDS_PER_RACE - 1] || null;
      state.mapView = "archive";
      state.archiveIndex = FRIENDS_PER_RACE - 1;
      state.mode = "won";
      state.messageTimer = 1.6;
      state.toast = `${pilot.name}'s race rescued`;
      renderRescueMap();
      syncMusic();
      updateHud();
      return;
    }
    setupLevel(0);
    state.mode = "playing";
    countPlayLaunch();
    state.messageTimer = 1.2;
    state.toast = `${pilot.name} ready`;
    ping("start");
    syncMusic();
    updateHud();
  }

  function renderPilotHud() {
    if (!state.pilot) {
      ui.pilotHud.hidden = true;
      ui.pilotMiniAvatar.innerHTML = "";
      ui.pilotName.textContent = "No pilot";
      ui.pilotRank.textContent = "Choose pilot";
      ui.rescuedFriendStrip.innerHTML = "";
      return;
    }
    ui.pilotHud.hidden = false;
    ui.pilotMiniAvatar.innerHTML = avatarHtml(state.pilot, true);
    ui.pilotName.textContent = state.pilot.name;
    ui.pilotRank.textContent = `Pilot Lv ${state.pilotLevel} • ${state.raceProgress}/${FRIENDS_PER_RACE} friends`;
    ui.rescuedFriendStrip.innerHTML = friendStripHtml();
    ui.pilotHud.setAttribute("aria-label", `Open rescue map for ${state.pilot.name}`);
  }

  function friendStripHtml() {
    const roster = FRIEND_ROSTER[state.pilot.id] || [];
    return roster.map((friend, index) => {
      const found = index < state.raceProgress;
      return `<span class="friend-token ${found ? "found" : "locked"}" title="${found ? friend.name : "Unknown friend"}" style="--friend-color: ${friend.color}"></span>`;
    }).join("");
  }

  function avatarHtml(pilot, mini = false) {
    return `
      <span class="alien-avatar alien-avatar--${pilot.style}${mini ? " mini" : ""}" style="--avatar-main: ${pilot.color}; --avatar-accent: ${pilot.accent}">
        <span class="avatar-aura"></span>
        <span class="avatar-halo"></span>
        <span class="avatar-shoulder left"></span>
        <span class="avatar-shoulder right"></span>
        <span class="avatar-arm left"></span>
        <span class="avatar-arm right"></span>
        <span class="avatar-spine top"></span>
        <span class="avatar-spine mid"></span>
        <span class="avatar-spine low"></span>
        <span class="avatar-frill left"></span>
        <span class="avatar-frill right"></span>
        <span class="avatar-faceplate"></span>
        <span class="avatar-chest"></span>
        <span class="avatar-eye left"></span>
        <span class="avatar-eye right"></span>
        <span class="avatar-pupil left"></span>
        <span class="avatar-pupil right"></span>
        <span class="avatar-gill left"></span>
        <span class="avatar-gill right"></span>
        <span class="avatar-mouth"></span>
        <span class="avatar-mark"></span>
        <span class="avatar-sigil"></span>
        <span class="avatar-blade left"></span>
        <span class="avatar-blade right"></span>
      </span>
    `;
  }

  function revealPuzzlePiece(count) {
    state.puzzlePieces = Math.min(MAX_LEVELS, Math.max(state.puzzlePieces, count));
    state.mapView = "current";
    state.messageTimer = 1.2;
    state.toast = `Puzzle piece ${state.puzzlePieces}/${MAX_LEVELS}`;
    renderRescueMap();
  }

  function rescueCurrentFriend() {
    const friend = currentFriend();
    state.rescuedFriend = friend;
    if (state.pilot && state.raceProgress < FRIENDS_PER_RACE) {
      state.raceProgress += 1;
      state.campaign[state.pilot.id].rescued = Math.max(state.campaign[state.pilot.id].rescued, state.raceProgress);
      saveCampaign();
    }
    state.archiveIndex = Math.max(0, state.raceProgress - 1);
    state.mapView = "archive";
    state.score += 750;
    state.messageTimer = 1.6;
    state.toast = `${friend?.name || "Friend"} rescued`;
    renderPilotHud();
  }

  function startNextPuzzle() {
    state.puzzlePieces = 0;
    state.mapView = "current";
    state.rescuedFriend = null;
    state.pendingStage = null;
    setupLevel(0);
    state.mode = "playing";
    state.messageTimer = 1.6;
    state.toast = `${currentFriend()?.name || "Next friend"} signal found`;
    renderRescueMap();
    syncMusic();
    updateHud();
  }

  function openRescueMap(followup = "resume") {
    dismissInstructionsForMap();
    if (ui.rescueMapPanel.hidden) {
      state.mapReturnMode = state.mode;
    }
    state.mapFollowup = followup;
    state.mode = "map";
    keys.clear();
    renderRescueMap();
    ui.rescueMapPanel.hidden = false;
    syncMusic();
    updateHud();
  }

  function dismissInstructionsForMap() {
    if (ui.instructionsPanel.hidden) {
      return;
    }
    ui.instructionsPanel.hidden = true;
    state.mode = state.instructionsReturnMode || "ready";
    state.instructionsReturnMode = "ready";
  }

  function closeRescueMap() {
    if (ui.rescueMapPanel.hidden) {
      return;
    }

    ui.rescueMapPanel.hidden = true;
    const followup = state.mapFollowup;
    state.mapFollowup = "none";

    if (followup === "pilotUpgrade") {
      offerPilotLevelUp(state.pendingStage);
      return;
    }

    if (followup === "nextPuzzle") {
      startNextPuzzle();
      return;
    }

    if (followup === "raceComplete") {
      state.mode = "won";
      saveBestScore();
      syncMusic();
      updateHud();
      return;
    }

    state.mode = state.mapReturnMode || "playing";
    syncMusic();
    updateHud();
  }

  function renderRescueMap() {
    clampArchiveIndex();
    const canvas = ui.rescueMapCanvas;
    const w = canvas.width;
    const h = canvas.height;
    const memoryCount = completedPuzzleCount();
    const viewingArchive = state.mapView === "archive" && memoryCount > 0;
    const displayedPieces = viewingArchive ? MAX_LEVELS : state.puzzlePieces;
    const displayedFriend = viewingArchive ? archivedFriend() : state.rescuedFriend || currentFriend();
    const displayedWorld = rescueWorldAt(viewingArchive ? state.archiveIndex : currentFriendIndex());
    mapCtx.clearRect(0, 0, w, h);

    const dark = mapCtx.createLinearGradient(0, 0, 0, h);
    dark.addColorStop(0, "#04070b");
    dark.addColorStop(1, "#07110b");
    mapCtx.fillStyle = dark;
    mapCtx.fillRect(0, 0, w, h);

    for (let i = 0; i < MAX_LEVELS; i += 1) {
      mapCtx.save();
      drawPuzzlePiecePath(i, w, h);
      mapCtx.clip();
      if (i < displayedPieces) {
        drawRescueWorld(w, h, displayedFriend, displayedPieces, displayedWorld);
      } else {
        drawHiddenPuzzleVeil(i, w, h);
      }
      mapCtx.restore();
    }

    for (let i = 0; i < MAX_LEVELS; i += 1) {
      mapCtx.save();
      drawPuzzlePiecePath(i, w, h);
      mapCtx.lineWidth = i < displayedPieces ? 3 : 2;
      mapCtx.strokeStyle = i < displayedPieces ? "rgba(255, 202, 79, 0.9)" : "rgba(244, 247, 251, 0.42)";
      mapCtx.stroke();
      mapCtx.restore();
    }

    if (displayedPieces === 0) {
      mapCtx.fillStyle = "rgba(4, 7, 11, 0.62)";
      roundMapRect(w * 0.23, h * 0.41, w * 0.54, 74, 8);
      mapCtx.fill();
      mapCtx.strokeStyle = "rgba(121, 242, 142, 0.26)";
      mapCtx.stroke();
      mapCtx.fillStyle = "rgba(244, 247, 251, 0.78)";
      mapCtx.font = "900 21px system-ui, sans-serif";
      mapCtx.textAlign = "center";
      mapCtx.fillText("The living map is sleeping", w / 2, h / 2 - 6);
      mapCtx.fillStyle = "rgba(121, 242, 142, 0.78)";
      mapCtx.font = "800 13px system-ui, sans-serif";
      mapCtx.fillText("Beat levels to wake the jungle path", w / 2, h / 2 + 22);
    }

    if (displayedPieces >= MAX_LEVELS) {
      mapCtx.save();
      mapCtx.fillStyle = "rgba(4, 7, 11, 0.56)";
      roundMapRect(196, h - 78, w - 392, 44, 8);
      mapCtx.fill();
      mapCtx.fillStyle = "#ffca4f";
      mapCtx.font = "900 18px system-ui, sans-serif";
      mapCtx.textAlign = "center";
      const label = viewingArchive
        ? `${displayedFriend?.name || "Friend"} memory on ${displayedWorld.name}.`
        : `${displayedFriend?.name || "Friend"} found on ${displayedWorld.name}.`;
      mapCtx.fillText(label, w / 2, h - 50);
      mapCtx.restore();
    }

    const totalMissions = totalCampaignMissions();
    if (ui.rescueMapHint) {
      ui.rescueMapHint.textContent = viewingArchive
        ? `Completed ${displayedWorld.name} rescue puzzle.`
        : `Beat levels to reveal the ${displayedWorld.name} rescue map.`;
    }
    ui.rescueProgress.textContent = viewingArchive
      ? `Memory ${state.archiveIndex + 1}/${memoryCount} • ${memoryCount}/${FRIENDS_PER_RACE} friends • ${totalMissions}/${TOTAL_MISSIONS} missions`
      : `${state.puzzlePieces}/${MAX_LEVELS} pieces • ${state.raceProgress}/${FRIENDS_PER_RACE} friends • ${totalMissions}/${TOTAL_MISSIONS} missions`;
    updateMapShareButton(displayedPieces >= MAX_LEVELS, displayedFriend, displayedWorld);
    renderArchiveControls(viewingArchive);
  }

  function updateMapShareButton(ready, friend, world) {
    state.shareMapReady = ready;
    state.shareMapFriend = friend?.name || "a rescued friend";
    state.shareMapWorld = world?.name || "a mystery planet";
    ui.shareMap.hidden = !ready;
    ui.shareMap.disabled = !ready;
    ui.shareMap.setAttribute("aria-hidden", String(!ready));
    if (ready) {
      ui.shareMap.title = `Share Zack's ${state.shareMapWorld} rescue map`;
    } else {
      ui.shareMapStatus.textContent = "";
    }
  }

  function renderArchiveControls(viewingArchive) {
    if (!ui.currentPuzzle || !ui.rescueMemoryButtons) {
      return;
    }

    const memoryCount = completedPuzzleCount();
    ui.currentPuzzle.classList.toggle("active", !viewingArchive);
    ui.currentPuzzle.setAttribute("aria-pressed", String(!viewingArchive));
    ui.currentPuzzle.title = `Current puzzle: ${state.puzzlePieces}/${MAX_LEVELS} pieces found`;

    const roster = state.pilot ? FRIEND_ROSTER[state.pilot.id] || [] : [];
    ui.rescueMemoryButtons.innerHTML = roster.map((friend, index) => {
      const found = index < memoryCount;
      const active = viewingArchive && index === state.archiveIndex;
      const classes = ["map-memory-button"];
      if (!found) {
        classes.push("locked");
      }
      if (active) {
        classes.push("active");
      }
      const label = found ? `${index + 1}: ${friend.name}` : `${index + 1}: locked`;
      return `
        <button
          class="${classes.join(" ")}"
          type="button"
          data-memory-index="${index}"
          style="--memory-color: ${friend.color}"
          aria-label="${label}"
          aria-pressed="${active}"
          ${found ? "" : "disabled"}
          title="${found ? `${friend.name} rescue memory` : "Locked memory"}"
        >${index + 1}</button>
      `;
    }).join("");
  }

  function shareFinishedMap() {
    if (!state.shareMapReady) {
      return;
    }

    const payload = mapSharePayload();
    const nav = window.navigator || (typeof navigator !== "undefined" ? navigator : null);
    if (nav?.share && canNativeShare(nav, payload)) {
      try {
        Promise.resolve(nav.share(payload))
          .then(() => showShareStatus("Shared. Thanks for spreading Zack's game!"))
          .catch((error) => {
            if (error?.name !== "AbortError") {
              copySharePayload(payload);
            }
          });
      } catch (error) {
        copySharePayload(payload);
      }
      return;
    }

    copySharePayload(payload);
  }

  function canNativeShare(nav, payload) {
    if (!isWebShareUrl(payload.url)) {
      return false;
    }
    if (!nav.canShare) {
      return true;
    }
    try {
      return nav.canShare(payload);
    } catch (error) {
      return false;
    }
  }

  function isWebShareUrl(url) {
    try {
      const parsed = new URL(url, window.location?.href || undefined);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (error) {
      return false;
    }
  }

  function mapSharePayload() {
    return {
      title: "Star Maze Dodger",
      text: `${SHARE_TEXT}\nI revealed the ${state.shareMapWorld} rescue map and found ${state.shareMapFriend}.`,
      url: gameShareUrl(),
    };
  }

  function gameShareUrl() {
    const href = window.location?.href || (typeof location !== "undefined" ? location.href : "");
    return href ? href.split("#")[0] : "Star Maze Dodger";
  }

  function copySharePayload(payload) {
    const nav = window.navigator || (typeof navigator !== "undefined" ? navigator : null);
    const text = `${payload.text}\n${payload.url}`;
    if (nav?.clipboard?.writeText) {
      nav.clipboard.writeText(text)
        .then(() => showShareStatus("Copied share text and game link."))
        .catch(() => showShareStatus("Share unavailable here. Copy the game link from the address bar."));
      return;
    }
    showShareStatus("Share unavailable here. Copy the game link from the address bar.");
  }

  function showShareStatus(message) {
    ui.shareMapStatus.textContent = message;
  }

  function drawPuzzlePiecePath(index, w, h) {
    const pieceWidth = w / MAX_LEVELS;
    const x = index * pieceWidth;
    const right = x + pieceWidth;

    mapCtx.beginPath();
    mapCtx.moveTo(x, 0);
    mapCtx.lineTo(right, 0);
    if (index < MAX_LEVELS - 1) {
      traceVerticalPuzzleEdge(index, right, h, true);
    } else {
      traceOuterPuzzleEdge(right, h, "right");
    }
    mapCtx.lineTo(x, h);
    if (index > 0) {
      traceVerticalPuzzleEdge(index - 1, x, h, false);
    } else {
      traceOuterPuzzleEdge(x, h, "left");
    }
    mapCtx.closePath();
  }

  function traceVerticalPuzzleEdge(edgeIndex, x, h, down) {
    const points = puzzleVerticalEdgePoints(edgeIndex, x, h);
    if (down) {
      for (let i = 1; i < points.length; i += 1) {
        mapCtx.lineTo(points[i].x, points[i].y);
      }
      return;
    }

    for (let i = points.length - 2; i >= 0; i -= 1) {
      mapCtx.lineTo(points[i].x, points[i].y);
    }
  }

  function puzzleVerticalEdgePoints(edgeIndex, x, h) {
    const profile = PUZZLE_VERTICAL_EDGES[edgeIndex % PUZZLE_VERTICAL_EDGES.length];
    const samples = 30;
    const points = [];
    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const tabStart = profile.center - profile.width;
      const tabEnd = profile.center + profile.width;
      let tab = 0;
      if (t > tabStart && t < tabEnd) {
        const local = (t - tabStart) / (tabEnd - tabStart);
        tab = Math.sin(Math.PI * local) * profile.depth * profile.dir;
        tab += Math.sin(Math.PI * 3 * local) * 4 * profile.dir;
      }
      const wobble = Math.sin(Math.PI * t) * Math.sin(Math.PI * profile.wave * t) * profile.wobble;
      points.push({ x: x + tab + wobble, y: h * t });
    }
    return points;
  }

  function traceOuterPuzzleEdge(x, h, side) {
    const dir = side === "right" ? 1 : -1;
    const samples = 10;
    for (let i = 1; i <= samples; i += 1) {
      const t = side === "right" ? i / samples : 1 - i / samples;
      const edgeWave = Math.sin(Math.PI * 4 * t) * Math.sin(Math.PI * t) * 2.5 * dir;
      mapCtx.lineTo(x + edgeWave, h * t);
    }
  }

  function drawHiddenPuzzleVeil(index, w, h) {
    const pieceWidth = w / MAX_LEVELS;
    const x = index * pieceWidth;
    const veil = mapCtx.createLinearGradient(x, 0, x + pieceWidth, h);
    veil.addColorStop(0, "rgba(2, 5, 8, 0.94)");
    veil.addColorStop(0.55, "rgba(3, 12, 10, 0.92)");
    veil.addColorStop(1, "rgba(7, 5, 16, 0.94)");
    mapCtx.fillStyle = veil;
    mapCtx.fillRect(0, 0, w, h);

    mapCtx.save();
    mapCtx.lineCap = "round";
    mapCtx.strokeStyle = "rgba(121, 242, 142, 0.16)";
    mapCtx.lineWidth = 2;
    for (let i = 0; i < 5; i += 1) {
      const vineX = x + 18 + ((index * 31 + i * 29) % Math.max(40, pieceWidth - 36));
      mapCtx.beginPath();
      mapCtx.moveTo(vineX, -10);
      mapCtx.bezierCurveTo(vineX - 20, h * 0.22, vineX + 22, h * 0.46, vineX - 7, h + 20);
      mapCtx.stroke();
    }

    mapCtx.strokeStyle = "rgba(255, 202, 79, 0.18)";
    mapCtx.lineWidth = 1.5;
    for (let i = 0; i < 4; i += 1) {
      const gx = x + pieceWidth * (0.2 + i * 0.18);
      const gy = h * (0.24 + ((index + i) % 4) * 0.13);
      mapCtx.beginPath();
      mapCtx.moveTo(gx - 9, gy);
      mapCtx.lineTo(gx, gy - 12);
      mapCtx.lineTo(gx + 9, gy);
      mapCtx.lineTo(gx, gy + 12);
      mapCtx.closePath();
      mapCtx.stroke();
      mapCtx.beginPath();
      mapCtx.moveTo(gx, gy - 8);
      mapCtx.lineTo(gx, gy + 8);
      mapCtx.stroke();
    }

    mapCtx.fillStyle = "rgba(73, 224, 255, 0.14)";
    for (let i = 0; i < 9; i += 1) {
      const sx = x + ((index * 53 + i * 19) % Math.max(30, pieceWidth));
      const sy = h * (0.12 + ((index * 7 + i * 11) % 70) / 100);
      mapCtx.beginPath();
      mapCtx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
      mapCtx.fill();
    }
    mapCtx.restore();
  }

  function drawRescueWorld(w, h, friend = state.rescuedFriend || currentFriend(), pieces = state.puzzlePieces, world = rescueWorldAt(0)) {
    if (world.id === "moon") {
      drawMoonWorld(w, h, world);
    } else if (world.id === "mars") {
      drawMarsWorld(w, h, world);
    } else if (world.id === "saturn") {
      drawSaturnWorld(w, h, world);
    } else if (world.id === "jupiter") {
      drawJupiterWorld(w, h, world);
    } else {
      drawAlienJungleWorld(w, h, world);
    }
    drawPlanetWorldLabel(w, h, world);
    if (pieces >= MAX_LEVELS) {
      drawFriendReveal(w, h, friend);
    }
  }

  function drawAlienJungleWorld(w, h) {
    const sky = mapCtx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#6fe4ff");
    sky.addColorStop(0.24, "#4f7be8");
    sky.addColorStop(0.55, "#315846");
    sky.addColorStop(1, "#062514");
    mapCtx.fillStyle = sky;
    mapCtx.fillRect(0, 0, w, h);

    drawDistantMoons(w, h);
    drawSporeField(w, h);
    drawMapHills(w, h);
    drawBioRiver(w, h);
    drawCastle(w, h);
    drawAncientPath(w, h);
    drawGlyphStones(w, h);
    drawAlienCreatures(w, h);
    drawJungle(w, h);
    drawCanopyVines(w, h);
  }

  function drawMoonWorld(w, h, world) {
    drawSpaceSky(w, h, "#06101d", "#11192a", "#02040a");
    drawMapPlanet(w * 0.78, h * 0.17, 48, "#7db7ff", "#10345c", 0.32);

    const ground = mapCtx.createLinearGradient(0, h * 0.56, 0, h);
    ground.addColorStop(0, "#9099a6");
    ground.addColorStop(0.42, "#58616d");
    ground.addColorStop(1, "#252b35");
    mapCtx.fillStyle = ground;
    mapCtx.beginPath();
    mapCtx.moveTo(0, h * 0.62);
    mapCtx.bezierCurveTo(w * 0.18, h * 0.51, w * 0.35, h * 0.66, w * 0.53, h * 0.56);
    mapCtx.bezierCurveTo(w * 0.72, h * 0.46, w * 0.88, h * 0.63, w, h * 0.54);
    mapCtx.lineTo(w, h);
    mapCtx.lineTo(0, h);
    mapCtx.closePath();
    mapCtx.fill();

    drawCraterField(w, h, "#2d333d");
    drawMoonBase(w, h, world);
    drawPlanetPath(w, h, "#cfd8e6", "rgba(244, 247, 251, 0.28)");
  }

  function drawMarsWorld(w, h, world) {
    const sky = mapCtx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#361625");
    sky.addColorStop(0.35, "#924023");
    sky.addColorStop(1, "#1b0808");
    mapCtx.fillStyle = sky;
    mapCtx.fillRect(0, 0, w, h);
    drawMapStars(w, h, 34, "rgba(255, 202, 79, 0.45)");
    drawMapPlanet(w * 0.18, h * 0.16, 28, "#f7b05c", "#772814", 0.18);

    mapCtx.fillStyle = "#5f2117";
    mapCtx.beginPath();
    mapCtx.moveTo(0, h * 0.62);
    mapCtx.lineTo(w * 0.16, h * 0.42);
    mapCtx.lineTo(w * 0.32, h * 0.6);
    mapCtx.lineTo(w * 0.48, h * 0.36);
    mapCtx.lineTo(w * 0.66, h * 0.61);
    mapCtx.lineTo(w * 0.84, h * 0.43);
    mapCtx.lineTo(w, h * 0.58);
    mapCtx.lineTo(w, h);
    mapCtx.lineTo(0, h);
    mapCtx.closePath();
    mapCtx.fill();

    const dust = mapCtx.createLinearGradient(0, h * 0.57, 0, h);
    dust.addColorStop(0, "#c15b31");
    dust.addColorStop(0.5, "#7b2d1f");
    dust.addColorStop(1, "#2a0d0a");
    mapCtx.fillStyle = dust;
    mapCtx.fillRect(0, h * 0.64, w, h * 0.36);
    drawDustLines(w, h);
    drawMarsOutpost(w, h, world);
    drawPlanetPath(w, h, "#ffb06a", "rgba(255, 202, 79, 0.2)");
  }

  function drawSaturnWorld(w, h, world) {
    drawSpaceSky(w, h, "#160c2b", "#26235d", "#080611");
    mapCtx.save();
    mapCtx.translate(w * 0.7, h * 0.2);
    mapCtx.rotate(-0.18);
    mapCtx.strokeStyle = "rgba(255, 225, 148, 0.58)";
    mapCtx.lineWidth = 16;
    mapCtx.beginPath();
    mapCtx.ellipse(0, 0, 140, 31, 0, 0, Math.PI * 2);
    mapCtx.stroke();
    mapCtx.strokeStyle = "rgba(185, 131, 255, 0.34)";
    mapCtx.lineWidth = 6;
    mapCtx.beginPath();
    mapCtx.ellipse(0, 0, 172, 39, 0, 0, Math.PI * 2);
    mapCtx.stroke();
    const planet = mapCtx.createRadialGradient(-14, -18, 8, 0, 0, 64);
    planet.addColorStop(0, "#fff0a8");
    planet.addColorStop(0.52, "#d9b64a");
    planet.addColorStop(1, "#6f4f17");
    mapCtx.fillStyle = planet;
    mapCtx.beginPath();
    mapCtx.arc(0, 0, 62, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.restore();

    const ground = mapCtx.createLinearGradient(0, h * 0.56, 0, h);
    ground.addColorStop(0, "#b5d5e9");
    ground.addColorStop(0.48, "#5d7790");
    ground.addColorStop(1, "#172139");
    mapCtx.fillStyle = ground;
    mapCtx.beginPath();
    mapCtx.moveTo(0, h * 0.68);
    mapCtx.bezierCurveTo(w * 0.22, h * 0.54, w * 0.38, h * 0.72, w * 0.58, h * 0.57);
    mapCtx.bezierCurveTo(w * 0.78, h * 0.42, w * 0.88, h * 0.66, w, h * 0.5);
    mapCtx.lineTo(w, h);
    mapCtx.lineTo(0, h);
    mapCtx.closePath();
    mapCtx.fill();
    drawIceCracks(w, h, world);
    drawSaturnTemple(w, h, world);
    drawPlanetPath(w, h, "#f5d875", "rgba(185, 131, 255, 0.2)");
  }

  function drawJupiterWorld(w, h, world) {
    const sky = mapCtx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#07132d");
    sky.addColorStop(0.48, "#714019");
    sky.addColorStop(1, "#1b0e0a");
    mapCtx.fillStyle = sky;
    mapCtx.fillRect(0, 0, w, h);
    drawMapStars(w, h, 28, "rgba(244, 247, 251, 0.52)");

    for (let i = 0; i < 8; i += 1) {
      const y = h * (0.18 + i * 0.07);
      mapCtx.fillStyle = i % 2 === 0 ? "rgba(255, 202, 79, 0.25)" : "rgba(255, 122, 69, 0.24)";
      mapCtx.beginPath();
      mapCtx.ellipse(w * 0.55, y, w * 0.62, 20 + (i % 3) * 6, -0.08, 0, Math.PI * 2);
      mapCtx.fill();
    }
    mapCtx.fillStyle = "rgba(199, 72, 45, 0.62)";
    mapCtx.beginPath();
    mapCtx.ellipse(w * 0.72, h * 0.43, 56, 28, -0.22, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.strokeStyle = "rgba(255, 238, 188, 0.42)";
    mapCtx.lineWidth = 3;
    mapCtx.stroke();

    drawFloatingIslands(w, h, world);
    drawJupiterSkyCastle(w, h, world);
    drawPlanetPath(w, h, "#ffca4f", "rgba(73, 224, 255, 0.18)");
  }

  function drawSpaceSky(w, h, top, mid, bottom) {
    const sky = mapCtx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, top);
    sky.addColorStop(0.52, mid);
    sky.addColorStop(1, bottom);
    mapCtx.fillStyle = sky;
    mapCtx.fillRect(0, 0, w, h);
    drawMapStars(w, h, 58, "rgba(244, 247, 251, 0.62)");
  }

  function drawMapStars(w, h, count, color) {
    mapCtx.save();
    mapCtx.fillStyle = color;
    for (let i = 0; i < count; i += 1) {
      const x = (i * 97 + 41) % w;
      const y = h * (0.04 + ((i * 37) % 54) / 100);
      const r = 0.8 + (i % 4) * 0.55;
      mapCtx.globalAlpha = 0.28 + (i % 5) * 0.12;
      mapCtx.beginPath();
      mapCtx.arc(x, y, r, 0, Math.PI * 2);
      mapCtx.fill();
    }
    mapCtx.restore();
  }

  function drawMapPlanet(x, y, r, light, dark, alpha = 1) {
    mapCtx.save();
    mapCtx.globalAlpha = alpha;
    const planet = mapCtx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.12, x, y, r);
    planet.addColorStop(0, light);
    planet.addColorStop(0.62, light);
    planet.addColorStop(1, dark);
    mapCtx.fillStyle = planet;
    mapCtx.beginPath();
    mapCtx.arc(x, y, r, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.restore();
  }

  function drawCraterField(w, h, color) {
    mapCtx.save();
    mapCtx.strokeStyle = color;
    mapCtx.lineWidth = 2;
    for (let i = 0; i < 15; i += 1) {
      const x = (i * 67 + 31) % w;
      const y = h * (0.66 + ((i * 19) % 28) / 100);
      const rx = 15 + (i % 4) * 8;
      const ry = 5 + (i % 3) * 3;
      mapCtx.globalAlpha = 0.28 + (i % 3) * 0.1;
      mapCtx.beginPath();
      mapCtx.ellipse(x, y, rx, ry, -0.12, 0, Math.PI * 2);
      mapCtx.stroke();
    }
    mapCtx.restore();
  }

  function drawPlanetPath(w, h, color, fill) {
    mapCtx.save();
    mapCtx.strokeStyle = color;
    mapCtx.lineWidth = 5;
    mapCtx.lineCap = "round";
    mapCtx.globalAlpha = 0.52;
    mapCtx.beginPath();
    mapCtx.moveTo(w * 0.09, h * 0.95);
    mapCtx.bezierCurveTo(w * 0.25, h * 0.82, w * 0.38, h * 0.76, w * 0.51, h * 0.67);
    mapCtx.bezierCurveTo(w * 0.63, h * 0.58, w * 0.7, h * 0.52, w * 0.77, h * 0.43);
    mapCtx.stroke();
    mapCtx.globalAlpha = 1;
    mapCtx.fillStyle = fill;
    mapCtx.beginPath();
    mapCtx.ellipse(w * 0.48, h * 0.72, 62, 19, -0.3, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.restore();
  }

  function drawMoonBase(w, h, world) {
    const x = w * 0.58;
    const y = h * 0.44;
    mapCtx.save();
    mapCtx.strokeStyle = "rgba(207, 216, 230, 0.72)";
    mapCtx.lineWidth = 3;
    mapCtx.beginPath();
    mapCtx.arc(x, y + 48, 76, Math.PI, Math.PI * 2);
    mapCtx.stroke();
    mapCtx.fillStyle = "rgba(73, 224, 255, 0.14)";
    mapCtx.beginPath();
    mapCtx.arc(x, y + 48, 72, Math.PI, Math.PI * 2);
    mapCtx.lineTo(x + 72, y + 48);
    mapCtx.lineTo(x - 72, y + 48);
    mapCtx.closePath();
    mapCtx.fill();
    drawMapTower(x - 38, y + 24, 28, 86, "#4b5565", world.glow);
    drawMapTower(x + 10, y + 3, 34, 108, "#697280", world.glow);
    drawMapTower(x + 52, y + 31, 25, 78, "#404b59", world.glow);
    mapCtx.restore();
  }

  function drawMarsOutpost(w, h, world) {
    const x = w * 0.63;
    const y = h * 0.5;
    mapCtx.save();
    drawMapTower(x - 60, y + 42, 30, 86, "#3d1c18", world.glow);
    drawMapTower(x - 16, y + 12, 43, 116, "#5a241b", world.glow);
    drawMapTower(x + 42, y + 35, 32, 92, "#442018", world.glow);
    mapCtx.fillStyle = "rgba(255, 202, 79, 0.28)";
    mapCtx.beginPath();
    mapCtx.moveTo(x - 82, y + 72);
    mapCtx.lineTo(x + 82, y + 72);
    mapCtx.lineTo(x + 55, y + 102);
    mapCtx.lineTo(x - 58, y + 102);
    mapCtx.closePath();
    mapCtx.fill();
    mapCtx.restore();
  }

  function drawSaturnTemple(w, h, world) {
    const x = w * 0.42;
    const y = h * 0.5;
    mapCtx.save();
    for (let i = 0; i < 5; i += 1) {
      drawMapTower(x + (i - 2) * 34, y + Math.abs(i - 2) * 14, 25, 100 - Math.abs(i - 2) * 13, "#33445f", world.glow);
    }
    mapCtx.strokeStyle = "rgba(217, 182, 74, 0.74)";
    mapCtx.lineWidth = 3;
    mapCtx.beginPath();
    mapCtx.moveTo(x - 94, y + 72);
    mapCtx.quadraticCurveTo(x, y + 34, x + 94, y + 72);
    mapCtx.stroke();
    mapCtx.restore();
  }

  function drawFloatingIslands(w, h, world) {
    mapCtx.save();
    for (let i = 0; i < 7; i += 1) {
      const x = w * (0.13 + (i % 4) * 0.22);
      const y = h * (0.58 + Math.floor(i / 4) * 0.15 + (i % 2) * 0.04);
      mapCtx.fillStyle = i % 2 === 0 ? "#5d3b1f" : "#312c3e";
      mapCtx.beginPath();
      mapCtx.ellipse(x, y, 48 - (i % 3) * 8, 15 + (i % 2) * 4, -0.12, 0, Math.PI * 2);
      mapCtx.fill();
      mapCtx.fillStyle = "rgba(73, 224, 255, 0.36)";
      mapCtx.beginPath();
      mapCtx.moveTo(x - 19, y + 9);
      mapCtx.lineTo(x, y + 43);
      mapCtx.lineTo(x + 21, y + 9);
      mapCtx.closePath();
      mapCtx.fill();
    }
    mapCtx.restore();
  }

  function drawJupiterSkyCastle(w, h, world) {
    const x = w * 0.36;
    const y = h * 0.37;
    mapCtx.save();
    mapCtx.fillStyle = "rgba(7, 19, 45, 0.62)";
    mapCtx.beginPath();
    mapCtx.ellipse(x + 40, y + 152, 122, 18, 0, 0, Math.PI * 2);
    mapCtx.fill();
    drawMapTower(x - 15, y + 45, 35, 112, "#1f2c56", world.glow);
    drawMapTower(x + 31, y + 9, 41, 148, "#263b76", world.glow);
    drawMapTower(x + 86, y + 52, 30, 105, "#18254a", world.glow);
    mapCtx.strokeStyle = "rgba(73, 224, 255, 0.66)";
    mapCtx.lineWidth = 3;
    mapCtx.beginPath();
    mapCtx.arc(x + 50, y + 73, 48, 0.15, Math.PI * 1.28);
    mapCtx.stroke();
    mapCtx.restore();
  }

  function drawMapTower(x, y, width, height, color, glow) {
    mapCtx.save();
    mapCtx.fillStyle = color;
    mapCtx.fillRect(x, y, width, height);
    mapCtx.fillStyle = "rgba(244, 247, 251, 0.2)";
    mapCtx.fillRect(x + 4, y + 8, width - 8, 5);
    mapCtx.shadowColor = glow;
    mapCtx.shadowBlur = 14;
    mapCtx.fillStyle = glow;
    mapCtx.beginPath();
    mapCtx.arc(x + width / 2, y + 18, width * 0.28, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.shadowBlur = 0;
    mapCtx.fillStyle = "rgba(4, 7, 11, 0.74)";
    for (let i = 0; i < 3; i += 1) {
      mapCtx.fillRect(x + 6 + i * (width / 3.5), y + height * 0.58, 5, 18);
    }
    mapCtx.restore();
  }

  function drawDustLines(w, h) {
    mapCtx.save();
    mapCtx.strokeStyle = "rgba(255, 202, 79, 0.18)";
    mapCtx.lineWidth = 2;
    for (let i = 0; i < 12; i += 1) {
      const y = h * (0.68 + i * 0.024);
      mapCtx.beginPath();
      mapCtx.moveTo((i * 53) % w, y);
      mapCtx.bezierCurveTo(w * 0.28, y - 8, w * 0.57, y + 10, w, y - 3);
      mapCtx.stroke();
    }
    mapCtx.restore();
  }

  function drawIceCracks(w, h, world) {
    mapCtx.save();
    mapCtx.strokeStyle = "rgba(244, 247, 251, 0.38)";
    mapCtx.lineWidth = 2;
    for (let i = 0; i < 8; i += 1) {
      const x = w * (0.08 + i * 0.12);
      const y = h * (0.72 + (i % 3) * 0.05);
      mapCtx.beginPath();
      mapCtx.moveTo(x, y);
      mapCtx.lineTo(x + 24, y + 8);
      mapCtx.lineTo(x + 44, y - 5);
      mapCtx.stroke();
    }
    mapCtx.fillStyle = "rgba(185, 131, 255, 0.22)";
    mapCtx.beginPath();
    mapCtx.ellipse(w * 0.18, h * 0.77, 35, 9, -0.2, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.fillStyle = world.glow;
    mapCtx.globalAlpha = 0.16;
    mapCtx.fillRect(0, h * 0.82, w, 5);
    mapCtx.restore();
  }

  function drawPlanetWorldLabel(w, h, world) {
    mapCtx.save();
    mapCtx.fillStyle = "rgba(4, 7, 11, 0.48)";
    roundMapRect(16, 15, 154, 34, 8);
    mapCtx.fill();
    mapCtx.strokeStyle = `${world.accent}99`;
    mapCtx.lineWidth = 1.5;
    mapCtx.stroke();
    mapCtx.fillStyle = world.accent;
    mapCtx.font = "900 13px system-ui, sans-serif";
    mapCtx.textAlign = "left";
    mapCtx.fillText(world.name.toUpperCase(), 28, 37);
    mapCtx.restore();
  }

  function drawDistantMoons(w, h) {
    mapCtx.save();
    mapCtx.shadowColor = "rgba(255, 233, 163, 0.55)";
    mapCtx.shadowBlur = 24;
    mapCtx.fillStyle = "rgba(255, 233, 163, 0.95)";
    mapCtx.beginPath();
    mapCtx.arc(w * 0.16, h * 0.18, 36, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.shadowColor = "rgba(184, 246, 255, 0.48)";
    mapCtx.shadowBlur = 16;
    mapCtx.fillStyle = "rgba(207, 255, 247, 0.78)";
    mapCtx.beginPath();
    mapCtx.arc(w * 0.31, h * 0.12, 18, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.shadowBlur = 0;
    mapCtx.restore();
  }

  function drawSporeField(w, h) {
    mapCtx.save();
    for (let i = 0; i < 46; i += 1) {
      const x = (i * 97 + 37) % w;
      const y = h * (0.08 + ((i * 17) % 55) / 100);
      const r = 1.2 + (i % 4) * 0.75;
      mapCtx.globalAlpha = 0.18 + (i % 5) * 0.05;
      mapCtx.fillStyle = i % 3 === 0 ? "#ffca4f" : i % 3 === 1 ? "#79f28e" : "#49e0ff";
      mapCtx.beginPath();
      mapCtx.arc(x, y, r, 0, Math.PI * 2);
      mapCtx.fill();
    }
    mapCtx.globalAlpha = 1;
    mapCtx.restore();
  }

  function drawFriendReveal(w, h, friend = state.rescuedFriend || currentFriend()) {
    const x = w * 0.28;
    const y = h * 0.5;
    mapCtx.save();
    mapCtx.shadowColor = friend?.color || "#ffca4f";
    mapCtx.shadowBlur = 24;
    mapCtx.fillStyle = "rgba(255, 202, 79, 0.22)";
    mapCtx.beginPath();
    mapCtx.ellipse(x, y + 12, 72, 84, 0, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.shadowBlur = 0;
    mapCtx.fillStyle = "rgba(4, 7, 11, 0.5)";
    mapCtx.beginPath();
    mapCtx.ellipse(x, y + 50, 84, 19, 0, 0, Math.PI * 2);
    mapCtx.fill();

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      mapCtx.fillStyle = i % 2 === 0 ? "rgba(121, 242, 142, 0.74)" : "rgba(73, 224, 255, 0.72)";
      mapCtx.beginPath();
      mapCtx.ellipse(x + Math.cos(angle) * 44, y + Math.sin(angle) * 34 + 11, 24, 9, angle, 0, Math.PI * 2);
      mapCtx.fill();
    }

    mapCtx.fillStyle = friend?.color || "#ffca4f";
    mapCtx.beginPath();
    mapCtx.ellipse(x, y, 34, 39, 0, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.fillStyle = "rgba(255,255,255,0.2)";
    mapCtx.beginPath();
    mapCtx.ellipse(x, y - 11, 19, 8, 0, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.fillStyle = "#05070b";
    mapCtx.beginPath();
    mapCtx.arc(x - 12, y - 5, 5, 0, Math.PI * 2);
    mapCtx.arc(x + 12, y - 5, 5, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.strokeStyle = "rgba(5, 7, 11, 0.82)";
    mapCtx.lineWidth = 3;
    mapCtx.beginPath();
    mapCtx.arc(x, y + 5, 13, 0.2, Math.PI - 0.2);
    mapCtx.stroke();

    mapCtx.strokeStyle = friend?.color || "#ffca4f";
    mapCtx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 2) {
      mapCtx.beginPath();
      mapCtx.moveTo(x + i * 17, y - 31);
      mapCtx.quadraticCurveTo(x + i * 28, y - 52, x + i * 42, y - 39);
      mapCtx.stroke();
      mapCtx.beginPath();
      mapCtx.arc(x + i * 43, y - 39, 4, 0, Math.PI * 2);
      mapCtx.fill();
    }

    mapCtx.fillStyle = "rgba(255,255,255,0.92)";
    mapCtx.font = "900 16px system-ui, sans-serif";
    mapCtx.textAlign = "center";
    mapCtx.fillText(friend?.name || "Friend", x, y + 82);
    mapCtx.restore();
  }

  function drawMapHills(w, h) {
    mapCtx.fillStyle = "#2a3f72";
    mapCtx.beginPath();
    mapCtx.moveTo(0, h * 0.57);
    mapCtx.bezierCurveTo(w * 0.13, h * 0.32, w * 0.28, h * 0.55, w * 0.44, h * 0.36);
    mapCtx.bezierCurveTo(w * 0.61, h * 0.18, w * 0.77, h * 0.42, w, h * 0.28);
    mapCtx.lineTo(w, h);
    mapCtx.lineTo(0, h);
    mapCtx.closePath();
    mapCtx.fill();

    mapCtx.fillStyle = "#1a6246";
    mapCtx.beginPath();
    mapCtx.moveTo(0, h * 0.68);
    mapCtx.bezierCurveTo(w * 0.16, h * 0.5, w * 0.35, h * 0.72, w * 0.55, h * 0.53);
    mapCtx.bezierCurveTo(w * 0.75, h * 0.36, w * 0.88, h * 0.66, w, h * 0.5);
    mapCtx.lineTo(w, h);
    mapCtx.lineTo(0, h);
    mapCtx.closePath();
    mapCtx.fill();

    mapCtx.fillStyle = "rgba(255, 202, 79, 0.16)";
    mapCtx.beginPath();
    mapCtx.moveTo(w * 0.61, h * 0.32);
    mapCtx.lineTo(w * 0.66, h * 0.41);
    mapCtx.lineTo(w * 0.56, h * 0.42);
    mapCtx.closePath();
    mapCtx.fill();
  }

  function drawBioRiver(w, h) {
    mapCtx.save();
    mapCtx.lineCap = "round";
    mapCtx.strokeStyle = "rgba(19, 72, 86, 0.88)";
    mapCtx.lineWidth = 42;
    mapCtx.beginPath();
    mapCtx.moveTo(w * 0.72, h * 0.48);
    mapCtx.bezierCurveTo(w * 0.62, h * 0.56, w * 0.55, h * 0.68, w * 0.42, h * 0.78);
    mapCtx.bezierCurveTo(w * 0.32, h * 0.86, w * 0.22, h * 0.88, w * 0.08, h * 1.02);
    mapCtx.stroke();

    mapCtx.strokeStyle = "rgba(73, 224, 255, 0.72)";
    mapCtx.lineWidth = 25;
    mapCtx.beginPath();
    mapCtx.moveTo(w * 0.72, h * 0.48);
    mapCtx.bezierCurveTo(w * 0.62, h * 0.56, w * 0.55, h * 0.68, w * 0.42, h * 0.78);
    mapCtx.bezierCurveTo(w * 0.32, h * 0.86, w * 0.22, h * 0.88, w * 0.08, h * 1.02);
    mapCtx.stroke();

    mapCtx.strokeStyle = "rgba(244, 247, 251, 0.48)";
    mapCtx.lineWidth = 3;
    mapCtx.beginPath();
    mapCtx.moveTo(w * 0.69, h * 0.54);
    mapCtx.bezierCurveTo(w * 0.55, h * 0.62, w * 0.5, h * 0.77, w * 0.35, h * 0.84);
    mapCtx.stroke();
    mapCtx.restore();
  }

  function drawCastle(w, h) {
    const x = w * 0.66;
    const y = h * 0.2;
    const scale = w / 760;

    mapCtx.save();
    mapCtx.fillStyle = "rgba(7, 13, 16, 0.34)";
    mapCtx.beginPath();
    mapCtx.ellipse(x + 68 * scale, y + 200 * scale, 122 * scale, 25 * scale, 0, 0, Math.PI * 2);
    mapCtx.fill();

    mapCtx.fillStyle = "#384862";
    mapCtx.fillRect(x - 22 * scale, y + 108 * scale, 174 * scale, 94 * scale);
    mapCtx.fillStyle = "#6e7f9d";
    mapCtx.fillRect(x + 4 * scale, y + 70 * scale, 128 * scale, 132 * scale);
    mapCtx.fillRect(x + 18 * scale, y + 30 * scale, 30 * scale, 72 * scale);
    mapCtx.fillRect(x + 84 * scale, y + 12 * scale, 35 * scale, 96 * scale);

    mapCtx.fillStyle = "#95a9ce";
    drawBattlements(x - 22 * scale, y + 91 * scale, 174 * scale, 22 * scale, 5);
    drawBattlements(x + 18 * scale, y + 14 * scale, 30 * scale, 18 * scale, 3);
    drawBattlements(x + 84 * scale, y - 5 * scale, 35 * scale, 20 * scale, 3);

    mapCtx.shadowColor = "rgba(255, 202, 79, 0.55)";
    mapCtx.shadowBlur = 18;
    mapCtx.fillStyle = "#ffca4f";
    mapCtx.fillRect(x + 96 * scale, y + 40 * scale, 14 * scale, 24 * scale);
    mapCtx.beginPath();
    mapCtx.arc(x + 103 * scale, y + 52 * scale, 27 * scale, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.shadowBlur = 0;

    mapCtx.fillStyle = "#142029";
    for (let i = 0; i < 4; i += 1) {
      mapCtx.beginPath();
      mapCtx.arc(x + (19 + i * 34) * scale, y + 140 * scale, 8 * scale, Math.PI, 0);
      mapCtx.lineTo(x + (27 + i * 34) * scale, y + 165 * scale);
      mapCtx.lineTo(x + (11 + i * 34) * scale, y + 165 * scale);
      mapCtx.closePath();
      mapCtx.fill();
    }

    mapCtx.strokeStyle = "rgba(121, 242, 142, 0.54)";
    mapCtx.lineWidth = 3 * scale;
    mapCtx.beginPath();
    mapCtx.moveTo(x + 22 * scale, y + 58 * scale);
    mapCtx.bezierCurveTo(x + 8 * scale, y + 96 * scale, x + 28 * scale, y + 132 * scale, x + 12 * scale, y + 185 * scale);
    mapCtx.stroke();
    mapCtx.beginPath();
    mapCtx.moveTo(x + 119 * scale, y + 42 * scale);
    mapCtx.bezierCurveTo(x + 152 * scale, y + 84 * scale, x + 111 * scale, y + 126 * scale, x + 146 * scale, y + 189 * scale);
    mapCtx.stroke();

    mapCtx.fillStyle = "#081016";
    mapCtx.beginPath();
    mapCtx.arc(x + 103 * scale, y + 52 * scale, 5 * scale, 0, Math.PI * 2);
    mapCtx.fill();

    mapCtx.fillStyle = "#1f1930";
    mapCtx.beginPath();
    mapCtx.arc(x + 60 * scale, y + 202 * scale, 22 * scale, Math.PI, 0);
    mapCtx.lineTo(x + 82 * scale, y + 202 * scale);
    mapCtx.lineTo(x + 38 * scale, y + 202 * scale);
    mapCtx.closePath();
    mapCtx.fill();
    mapCtx.restore();
  }

  function drawBattlements(x, y, width, height, count) {
    const block = width / count;
    for (let i = 0; i < count; i += 1) {
      mapCtx.fillRect(x + i * block, y, block * 0.52, height);
    }
  }

  function drawAncientPath(w, h) {
    mapCtx.save();
    for (let i = 0; i < 9; i += 1) {
      const t = i / 8;
      const x = w * (0.27 + t * 0.39 + Math.sin(i) * 0.025);
      const y = h * (0.78 - t * 0.24 + Math.cos(i * 1.4) * 0.02);
      mapCtx.fillStyle = i % 2 === 0 ? "rgba(255, 202, 79, 0.34)" : "rgba(244, 247, 251, 0.24)";
      mapCtx.beginPath();
      mapCtx.ellipse(x, y, 18 - t * 6, 7 - t * 2, -0.22, 0, Math.PI * 2);
      mapCtx.fill();
    }
    mapCtx.restore();
  }

  function drawGlyphStones(w, h) {
    drawGlyphStone(w * 0.14, h * 0.77, 1.0, "#79f28e");
    drawGlyphStone(w * 0.55, h * 0.74, 0.78, "#ffca4f");
    drawGlyphStone(w * 0.78, h * 0.68, 0.9, "#49e0ff");
  }

  function drawAlienCreatures(w, h) {
    drawCreature(w * 0.18, h * 0.68, 1.05, "#11372b", "#79f28e");
    drawCreature(w * 0.48, h * 0.64, 0.72, "#211c38", "#ff5aa7");
    drawCreature(w * 0.84, h * 0.7, 0.9, "#173349", "#49e0ff");
  }

  function drawCreature(x, y, scale, body, eye) {
    mapCtx.save();
    mapCtx.strokeStyle = body;
    mapCtx.lineWidth = 4 * scale;
    mapCtx.lineCap = "round";
    for (let i = -1; i <= 1; i += 2) {
      mapCtx.beginPath();
      mapCtx.moveTo(x + i * 9 * scale, y - 15 * scale);
      mapCtx.quadraticCurveTo(x + i * 18 * scale, y - 33 * scale, x + i * 32 * scale, y - 25 * scale);
      mapCtx.stroke();
      mapCtx.fillStyle = eye;
      mapCtx.beginPath();
      mapCtx.arc(x + i * 33 * scale, y - 25 * scale, 4 * scale, 0, Math.PI * 2);
      mapCtx.fill();
    }

    mapCtx.fillStyle = body;
    mapCtx.beginPath();
    mapCtx.ellipse(x, y, 30 * scale, 21 * scale, 0, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.fillStyle = "rgba(255,255,255,0.12)";
    mapCtx.beginPath();
    mapCtx.ellipse(x, y - 8 * scale, 18 * scale, 6 * scale, 0, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.fillStyle = eye;
    mapCtx.shadowColor = eye;
    mapCtx.shadowBlur = 8 * scale;
    mapCtx.beginPath();
    mapCtx.arc(x - 8 * scale, y - 4 * scale, 4 * scale, 0, Math.PI * 2);
    mapCtx.arc(x + 8 * scale, y - 4 * scale, 4 * scale, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.shadowBlur = 0;
    mapCtx.strokeStyle = body;
    for (let i = -1; i <= 1; i += 1) {
      mapCtx.beginPath();
      mapCtx.moveTo(x + i * 14 * scale, y + 12 * scale);
      mapCtx.lineTo(x + i * 26 * scale, y + 35 * scale);
      mapCtx.stroke();
    }
    mapCtx.restore();
  }

  function drawJungle(w, h) {
    const ground = mapCtx.createLinearGradient(0, h * 0.66, 0, h);
    ground.addColorStop(0, "#1f8f50");
    ground.addColorStop(0.55, "#0d5a33");
    ground.addColorStop(1, "#062717");
    mapCtx.fillStyle = ground;
    mapCtx.fillRect(0, h * 0.69, w, h * 0.31);

    const trunks = [
      [0.05, 0.42, 0.9],
      [0.28, 0.5, 0.72],
      [0.58, 0.45, 0.85],
      [0.92, 0.38, 1.05],
      [0.72, 0.48, 0.62],
    ];
    for (const [x, y, scale] of trunks) {
      drawTree(w * x, h * y, scale, h);
    }

    for (let i = 0; i < 36; i += 1) {
      const x = (i * 47) % w;
      const y = h * (0.78 + ((i * 13) % 17) / 100);
      mapCtx.fillStyle = i % 5 === 0 ? "#79f28e" : "#36c66b";
      mapCtx.beginPath();
      mapCtx.ellipse(x, y, 22, 7, -0.6, 0, Math.PI * 2);
      mapCtx.fill();
    }

    for (let i = 0; i < 14; i += 1) {
      drawBioMushroom((i * 63 + 21) % w, h * (0.8 + ((i * 9) % 13) / 100), 0.7 + (i % 4) * 0.12, i % 2 === 0 ? "#ff5aa7" : "#49e0ff");
    }
  }

  function drawTree(x, y, scale, h) {
    mapCtx.save();
    mapCtx.lineCap = "round";
    mapCtx.strokeStyle = "#154125";
    mapCtx.lineWidth = 12 * scale;
    mapCtx.beginPath();
    mapCtx.moveTo(x, h);
    mapCtx.bezierCurveTo(x - 12 * scale, y + 100 * scale, x + 20 * scale, y + 52 * scale, x, y);
    mapCtx.stroke();
    mapCtx.strokeStyle = "rgba(121, 242, 142, 0.42)";
    mapCtx.lineWidth = 3 * scale;
    mapCtx.beginPath();
    mapCtx.moveTo(x + 1 * scale, h);
    mapCtx.bezierCurveTo(x - 8 * scale, y + 110 * scale, x + 15 * scale, y + 54 * scale, x + 3 * scale, y + 8 * scale);
    mapCtx.stroke();

    const leafColors = ["#31a85d", "#42d170", "#1f7d49", "#79f28e"];
    for (let i = 0; i < 13; i += 1) {
      const angle = (i / 13) * Math.PI * 2;
      const lx = x + Math.cos(angle) * 43 * scale;
      const ly = y + Math.sin(angle) * 24 * scale;
      mapCtx.fillStyle = leafColors[i % leafColors.length];
      mapCtx.beginPath();
      mapCtx.ellipse(lx, ly, 51 * scale, 15 * scale, angle, 0, Math.PI * 2);
      mapCtx.fill();
    }

    mapCtx.fillStyle = "rgba(255, 202, 79, 0.72)";
    for (let i = 0; i < 5; i += 1) {
      mapCtx.beginPath();
      mapCtx.arc(x + Math.cos(i * 1.7) * 31 * scale, y + Math.sin(i * 1.4) * 18 * scale, 3.5 * scale, 0, Math.PI * 2);
      mapCtx.fill();
    }
    mapCtx.restore();
  }

  function drawCanopyVines(w, h) {
    mapCtx.save();
    mapCtx.lineCap = "round";
    for (let i = 0; i < 12; i += 1) {
      const x = (i * 73 + 17) % w;
      const length = h * (0.16 + (i % 5) * 0.035);
      mapCtx.strokeStyle = i % 2 === 0 ? "rgba(21, 65, 37, 0.78)" : "rgba(121, 242, 142, 0.32)";
      mapCtx.lineWidth = 3 + (i % 3);
      mapCtx.beginPath();
      mapCtx.moveTo(x, 0);
      mapCtx.bezierCurveTo(x - 14, length * 0.35, x + 16, length * 0.72, x - 5, length);
      mapCtx.stroke();
      mapCtx.fillStyle = "rgba(121, 242, 142, 0.5)";
      mapCtx.beginPath();
      mapCtx.ellipse(x + 9, length * 0.62, 9, 4, -0.7, 0, Math.PI * 2);
      mapCtx.fill();
    }
    mapCtx.restore();
  }

  function drawGlyphStone(x, y, scale, glow) {
    mapCtx.save();
    mapCtx.fillStyle = "#23383d";
    mapCtx.beginPath();
    mapCtx.ellipse(x, y, 19 * scale, 31 * scale, -0.08, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    mapCtx.lineWidth = 1.5 * scale;
    mapCtx.stroke();
    mapCtx.shadowColor = glow;
    mapCtx.shadowBlur = 8 * scale;
    mapCtx.strokeStyle = glow;
    mapCtx.lineWidth = 2 * scale;
    mapCtx.beginPath();
    mapCtx.moveTo(x, y - 17 * scale);
    mapCtx.lineTo(x - 8 * scale, y - 2 * scale);
    mapCtx.lineTo(x + 7 * scale, y - 2 * scale);
    mapCtx.lineTo(x, y + 16 * scale);
    mapCtx.stroke();
    mapCtx.shadowBlur = 0;
    mapCtx.restore();
  }

  function drawBioMushroom(x, y, scale, color) {
    mapCtx.save();
    mapCtx.fillStyle = "rgba(244, 247, 251, 0.68)";
    mapCtx.fillRect(x - 3 * scale, y - 18 * scale, 6 * scale, 20 * scale);
    mapCtx.shadowColor = color;
    mapCtx.shadowBlur = 10 * scale;
    mapCtx.fillStyle = color;
    mapCtx.beginPath();
    mapCtx.ellipse(x, y - 18 * scale, 16 * scale, 9 * scale, 0, Math.PI, Math.PI * 2);
    mapCtx.lineTo(x - 16 * scale, y - 18 * scale);
    mapCtx.fill();
    mapCtx.shadowBlur = 0;
    mapCtx.fillStyle = "rgba(255, 255, 255, 0.65)";
    mapCtx.beginPath();
    mapCtx.arc(x - 5 * scale, y - 22 * scale, 2.5 * scale, 0, Math.PI * 2);
    mapCtx.arc(x + 5 * scale, y - 20 * scale, 2 * scale, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.restore();
  }

  function roundMapRect(x, y, width, height, radius) {
    mapCtx.beginPath();
    mapCtx.moveTo(x + radius, y);
    mapCtx.arcTo(x + width, y, x + width, y + height, radius);
    mapCtx.arcTo(x + width, y + height, x, y + height, radius);
    mapCtx.arcTo(x, y + height, x, y, radius);
    mapCtx.arcTo(x, y, x + width, y, radius);
    mapCtx.closePath();
  }

  function offerUpgrade() {
    state.mode = "upgrade";
    state.upgradeKind = "core";
    keys.clear();
    player.reload = 0;
    player.invulnerable = Math.max(player.invulnerable, 0.8);
    ui.upgradeKicker.textContent = "Core upgrade";
    ui.upgradeTitle.textContent = "Choose one";
    ui.upgradeText.textContent = "Pick a ship improvement, then keep flying.";
    state.upgradeChoices = pickUpgradeChoices();
    renderUpgradeChoices();
    ui.upgradePanel.hidden = false;
    syncMusic();
  }

  function offerPilotLevelUp(nextStage) {
    state.mode = "upgrade";
    state.upgradeKind = "pilot";
    state.pendingStage = nextStage;
    keys.clear();
    player.reload = 0;
    player.invulnerable = Math.max(player.invulnerable, 0.8);
    ui.upgradeKicker.textContent = "Pilot level-up";
    ui.upgradeTitle.textContent = `${state.pilot.name} evolves`;
    ui.upgradeText.textContent = "Choose one main-character upgrade before the next maze.";
    state.upgradeChoices = pickPilotUpgradeChoices();
    renderUpgradeChoices();
    ui.upgradePanel.hidden = false;
    syncMusic();
  }

  function pickUpgradeChoices() {
    const available = UPGRADE_POOL.filter((upgrade) => !upgrade.once || !state.upgradeHistory.has(upgrade.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }

  function pickPilotUpgradeChoices() {
    const upgrades = state.pilot?.levelUps || [];
    const available = upgrades.filter((upgrade) => !state.pilotUpgradeHistory.has(upgrade.id));
    const pool = available.length >= 2 ? available : upgrades;
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
  }

  function renderUpgradeChoices() {
    ui.upgradeChoices.innerHTML = state.upgradeChoices.map((upgrade, index) => `
      <button class="upgrade-choice" type="button" data-upgrade="${index}" style="--upgrade-color: ${upgrade.color}">
        <span class="upgrade-chip">${index + 1}</span>
        <span class="upgrade-copy">
          <strong>${upgrade.name}</strong>
          <em>${upgrade.kind}</em>
          <span>${upgrade.detail}</span>
        </span>
      </button>
    `).join("");
  }

  function chooseUpgrade(index) {
    const upgrade = state.upgradeChoices[index];
    if (!upgrade || state.mode !== "upgrade") {
      return;
    }
    upgrade.apply(state.loadout, state, player);
    if (state.upgradeKind === "pilot") {
      state.pilotUpgradeHistory.add(upgrade.id);
      state.pilotLevel += 1;
    } else if (upgrade.once) {
      state.upgradeHistory.add(upgrade.id);
    }
    state.upgradeCount += 1;
    state.score += 50;
    state.messageTimer = 1.3;
    state.toast = upgrade.name;
    hideUpgradePanel();
    if (state.upgradeKind === "pilot" && state.pendingStage !== null) {
      const nextStage = state.pendingStage;
      state.pendingStage = null;
      setupLevel(nextStage);
      state.messageTimer = 1.4;
      state.toast = `${state.pilot.name} Lv ${state.pilotLevel}`;
    }
    state.upgradeKind = "core";
    state.mode = "playing";
    ping("upgrade");
    syncMusic();
    renderPilotHud();
    updateHud();
  }

  function hideUpgradePanel() {
    ui.upgradePanel.hidden = true;
    ui.upgradeChoices.innerHTML = "";
  }

  function openInstructions() {
    if (!ui.instructionsPanel.hidden) {
      return;
    }
    dismissAboutOverlay();
    state.instructionsReturnMode = state.mode;
    state.mode = "instructions";
    keys.clear();
    ui.instructionsPanel.hidden = false;
    syncMusic();
    updateHud();
  }

  function closeInstructions() {
    if (ui.instructionsPanel.hidden) {
      return;
    }
    ui.instructionsPanel.hidden = true;
    state.mode = state.instructionsReturnMode || "ready";
    state.instructionsReturnMode = "ready";
    syncMusic();
    updateHud();
  }

  function dismissInstructionsOverlay() {
    if (ui.instructionsPanel.hidden) {
      return;
    }
    ui.instructionsPanel.hidden = true;
    if (state.mode === "instructions") {
      state.mode = state.instructionsReturnMode || "ready";
    }
    state.instructionsReturnMode = "ready";
  }

  function dismissAboutOverlay() {
    if (ui.aboutAuthorPanel.hidden) {
      return;
    }
    ui.aboutAuthorPanel.hidden = true;
    if (state.mode === "about") {
      state.mode = state.aboutReturnMode || "select";
    }
    state.aboutReturnMode = "select";
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - lastFrame) / 1000);
    lastFrame = now;
    if (state.mode === "playing") {
      update(dt);
    }
    render(now);
    requestAnimationFrame(loop);
  }

  function unlockAudio() {
    if (state.muted) {
      return;
    }
    if (audioContext) {
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
      return;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      return;
    }
    audioContext = new AudioCtor();
    masterGain = audioContext.createGain();
    sfxGain = audioContext.createGain();
    musicGain = audioContext.createGain();
    masterGain.gain.value = 0.82;
    sfxGain.gain.value = 0.78;
    musicGain.gain.value = 0.055;
    sfxGain.connect(masterGain);
    musicGain.connect(masterGain);
    masterGain.connect(audioContext.destination);
  }

  function ping(kind) {
    if (state.muted) {
      return;
    }
    unlockAudio();
    if (!audioContext) {
      return;
    }

    if (kind === "start") {
      playSequence([330, 440, 660], 0.055, "triangle", 0.06, 0.045);
    } else if (kind === "core") {
      playSequence([660, 880, 1320], 0.065, "sine", 0.07, 0.055);
      playTone(1760, 0.08, "triangle", 0.035, 0.15);
    } else if (kind === "boost") {
      playSequence([220, 330, 494], 0.07, "sawtooth", 0.045, 0.035);
      playNoise(0.12, 0.028, 1800, 0.02);
    } else if (kind === "upgrade") {
      playSequence([523, 659, 784, 1047], 0.085, "triangle", 0.075, 0.065);
      playTone(1568, 0.18, "sine", 0.04, 0.22);
    } else if (kind === "shoot") {
      playTone(980, 0.035, "square", 0.052);
      playTone(520, 0.055, "triangle", 0.03, 0.026);
    } else if (kind === "rocket") {
      playTone(185, 0.16, "sawtooth", 0.045);
      playTone(92, 0.2, "triangle", 0.028, 0.03);
      playNoise(0.12, 0.035, 640, 0.02);
    } else if (kind === "bossBoom") {
      playTone(52, 0.45, "sawtooth", 0.12);
      playTone(86, 0.34, "triangle", 0.09, 0.02);
      playNoise(0.5, 0.12, 180);
      playNoise(0.3, 0.08, 1200, 0.06);
      playSequence([220, 147, 98], 0.09, "sawtooth", 0.075, 0.055);
    } else if (kind === "zap") {
      playNoise(0.13, 0.07, 1400);
      playSequence([740, 370], 0.06, "sawtooth", 0.055, 0.04);
    } else if (kind === "wall") {
      playTone(124, 0.12, "triangle", 0.065);
      playNoise(0.16, 0.055, 460);
    } else if (kind === "goo") {
      playTone(180, 0.16, "sine", 0.05);
      playNoise(0.12, 0.035, 720);
    } else if (kind === "gravity") {
      playSequence([165, 110, 73], 0.07, "sawtooth", 0.045, 0.045);
      playNoise(0.16, 0.045, 320);
    } else if (kind === "repair") {
      playSequence([620, 780, 520], 0.045, "square", 0.035, 0.045);
      playTone(196, 0.12, "triangle", 0.03, 0.03);
    } else if (kind === "friendCheer") {
      playSequence([523, 659, 784], 0.055, "triangle", 0.04, 0.045);
      playTone(1047, 0.08, "sine", 0.028, 0.13);
    } else if (kind === "maintenanceHuh") {
      playTone(330, 0.11, "triangle", 0.032);
      playTone(262, 0.16, "sine", 0.04, 0.07);
      playNoise(0.055, 0.012, 760, 0.02);
    } else if (kind === "maintenanceHammer") {
      playTone(410, 0.045, "square", 0.045);
      playTone(228, 0.055, "triangle", 0.035, 0.035);
      playNoise(0.045, 0.025, 1800, 0.005);
    } else if (kind === "maintenanceDrill") {
      playTone(98, 0.24, "sawtooth", 0.026);
      playNoise(0.28, 0.055, 2100);
      playNoise(0.12, 0.03, 900, 0.15);
    } else if (kind === "tentacle") {
      playTone(138, 0.18, "sawtooth", 0.045);
      playTone(92, 0.22, "triangle", 0.035, 0.04);
      playNoise(0.18, 0.04, 520, 0.02);
    } else if (kind === "hit") {
      playTone(92, 0.24, "sawtooth", 0.09);
      playTone(58, 0.2, "triangle", 0.06, 0.08);
      playNoise(0.22, 0.07, 240);
    } else if (kind === "gate") {
      playSequence([392, 523, 659, 784, 1047], 0.08, "triangle", 0.065, 0.045);
      playTone(196, 0.35, "sine", 0.045, 0.08);
    } else if (kind === "reset") {
      playSequence([262, 196], 0.055, "sine", 0.05, 0.06);
    } else {
      playTone(440, 0.08, "sine", 0.05);
    }
  }

  function playSequence(notes, duration, type, volume, gap) {
    notes.forEach((frequency, index) => {
      playTone(frequency, duration, type, volume, index * gap);
    });
  }

  function playTone(frequency, duration, type = "sine", volume = 0.05, delay = 0, destination = sfxGain) {
    if (!audioContext || !destination) {
      return;
    }
    const start = audioContext.currentTime + delay;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function playNoise(duration, volume, filterFrequency = 900, delay = 0, destination = sfxGain) {
    if (!audioContext || !destination) {
      return;
    }
    const start = audioContext.currentTime + delay;
    const sampleCount = Math.max(1, Math.floor(audioContext.sampleRate * duration));
    const buffer = audioContext.createBuffer(1, sampleCount, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFrequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(destination);
    source.start(start);
    source.stop(start + duration + 0.02);
  }

  function syncMusic() {
    if (state.muted) {
      stopMusic();
      return;
    }
    if (state.mode === "playing" || state.mode === "upgrade" || state.mode === "map") {
      startMusic();
    } else {
      stopMusic();
    }
  }

  function startMusic() {
    unlockAudio();
    if (!audioContext || musicTimer) {
      return;
    }
    musicStep = 0;
    playMusicStep();
    musicTimer = window.setInterval(playMusicStep, 260);
  }

  function stopMusic() {
    if (!musicTimer) {
      return;
    }
    window.clearInterval(musicTimer);
    musicTimer = null;
  }

  function playMusicStep() {
    if (!audioContext || state.muted || !musicGain) {
      return;
    }

    const bass = [82, null, 98, null, 110, null, 98, null, 73, null, 98, null, 123, null, 110, null];
    const melody = [null, 659, null, 784, null, 988, 880, null, null, 587, null, 659, null, 784, 988, null];
    const bassNote = bass[musicStep % bass.length];
    const melodyNote = melody[musicStep % melody.length];

    if (bassNote) {
      playTone(bassNote, 0.22, "sawtooth", 0.18, 0, musicGain);
    }
    if (melodyNote) {
      playTone(melodyNote, 0.16, "triangle", 0.11, 0.015, musicGain);
    }
    if (musicStep % 4 === 0) {
      playTone(247, 0.42, "sine", 0.07, 0.02, musicGain);
    }
    if (musicStep % 2 === 0) {
      playNoise(0.045, 0.045, 1800, 0, musicGain);
    }

    musicStep += 1;
  }

  function keyDirection(key) {
    return {
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down",
      ShiftLeft: "boost",
      ShiftRight: "boost",
    }[key];
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width;
    const height = rect.height || canvas.height;
    return {
      x: ((event.clientX - rect.left) / width) * canvas.width,
      y: ((event.clientY - rect.top) / height) * canvas.height,
    };
  }

  window.addEventListener("keydown", (event) => {
    const direction = keyDirection(event.code);
    if (state.mode === "shipPicker") {
      if (event.code === "Escape") {
        event.preventDefault();
        closeShipPicker();
      } else if (event.code.startsWith("Digit")) {
        const index = Number(event.code.slice(5)) - 1;
        if (SHIP_AVATARS[index]) {
          event.preventDefault();
          chooseShipAvatar(SHIP_AVATARS[index].id);
        }
      } else if (direction || event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
      }
      return;
    }

    if (state.mode === "about") {
      if (event.code === "Escape") {
        event.preventDefault();
        closeAboutAuthor();
      } else if (direction || event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
      }
      return;
    }

    if (state.mode === "map") {
      if (event.code === "Escape") {
        event.preventDefault();
        closeRescueMap();
      } else if (direction || event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
      }
      return;
    }

    if (state.mode === "instructions") {
      if (event.code === "Escape" || event.code === "KeyI") {
        event.preventDefault();
        closeInstructions();
      } else if (direction || event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
      }
      return;
    }

    if (event.code === "KeyI") {
      event.preventDefault();
      openInstructions();
      return;
    }

    if (state.mode === "select") {
      if (event.code === "Digit1") {
        event.preventDefault();
        selectPilot(0);
      } else if (event.code === "Digit2") {
        event.preventDefault();
        selectPilot(1);
      } else if (event.code === "Digit3") {
        event.preventDefault();
        selectPilot(2);
      } else if (direction || event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
      }
      return;
    }

    if (state.mode === "upgrade") {
      if (event.code === "Digit1") {
        event.preventDefault();
        chooseUpgrade(0);
      } else if (event.code === "Digit2") {
        event.preventDefault();
        chooseUpgrade(1);
      } else if (direction || event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
      }
      return;
    }

    if (direction) {
      event.preventDefault();
      keys.add(direction);
    }

    if (event.code === "Space") {
      event.preventDefault();
      if (state.mode !== "playing") {
        startOrResume();
      } else {
        fireBullet();
      }
    } else if (event.code === "Enter") {
      startOrResume();
    } else if (event.code === "KeyP") {
      togglePause();
    } else if (event.code === "KeyR") {
      resetGame();
    } else if (event.code === "KeyM") {
      toggleSound();
    }
  });

  window.addEventListener("keyup", (event) => {
    const direction = keyDirection(event.code);
    if (direction) {
      event.preventDefault();
      keys.delete(direction);
    }
  });

  document.querySelectorAll("[data-touch]").forEach((button) => {
    const key = button.dataset.touch;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      if (key === "shoot") {
        if (state.mode !== "playing") {
          startOrResume();
        } else {
          fireBullet();
        }
        return;
      }
      keys.add(key);
      if (state.mode !== "playing") {
        startOrResume();
      }
    });
    button.addEventListener("pointerup", (event) => {
      event.preventDefault();
      keys.delete(key);
    });
    button.addEventListener("pointercancel", () => keys.delete(key));
    button.addEventListener("lostpointercapture", () => keys.delete(key));
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!player || (state.mode !== "playing" && state.mode !== "paused")) {
      return;
    }
    const point = canvasPoint(event);
    if (distance(point, player) <= 34) {
      event.preventDefault();
      openShipPicker();
    }
  });

  window.addEventListener("blur", () => {
    keys.clear();
    if (state.mode === "playing") {
      state.mode = "paused";
      syncMusic();
      updateHud();
    }
  });
  window.addEventListener("resize", syncLayoutMetrics);

  ui.start.addEventListener("click", startOrResume);
  ui.aboutAuthor.addEventListener("click", openAboutAuthor);
  ui.pause.addEventListener("click", togglePause);
  ui.instructions.addEventListener("click", openInstructions);
  ui.reset.addEventListener("click", resetGame);
  ui.sound.addEventListener("click", toggleSound);
  ui.pilotHud.addEventListener("click", () => {
    if (state.pilot) {
      openRescueMap("resume");
    }
  });
  ui.closeRescueMap.addEventListener("click", closeRescueMap);
  ui.closeAboutAuthor.addEventListener("click", closeAboutAuthor);
  ui.closeAboutAuthorBottom.addEventListener("click", closeAboutAuthor);
  ui.closeShipPicker.addEventListener("click", closeShipPicker);
  ui.shareMap.addEventListener("click", shareFinishedMap);
  ui.currentPuzzle.addEventListener("click", () => setMapView("current"));
  ui.rescueMemoryButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-memory-index]");
    if (!button || button.disabled) {
      return;
    }
    setMapView("archive", Number(button.dataset.memoryIndex));
  });
  ui.closeInstructions.addEventListener("click", closeInstructions);
  ui.closeInstructionsBottom.addEventListener("click", closeInstructions);
  ui.shipChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-ship]");
    if (!button) {
      return;
    }
    chooseShipAvatar(button.dataset.ship);
  });
  ui.pilotChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pilot]");
    if (!button) {
      return;
    }
    selectPilot(Number(button.dataset.pilot));
  });
  ui.upgradeChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-upgrade]");
    if (!button) {
      return;
    }
    chooseUpgrade(Number(button.dataset.upgrade));
  });

  newRun("select");
  requestAnimationFrame(loop);
})();

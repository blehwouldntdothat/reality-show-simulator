// ============================================================
// Survivor Simulator — Main Script
// ============================================================

// Utility selectors
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// ============================================================
// PLAYER + ALLIANCE CLASSES
// ============================================================

class Player {
  constructor(name, id) {
    this.id = id;
    this.name = name;
    this.active = true;

    this.hasIdol = false;
    this.hasVoteSteal = false;

    this.relationships = {}; // playerId → score
    this.allianceIds = new Set();

    this.trackRecord = []; // "WIN", "SAFE", "LOW", "OUT"
  }
}

class Alliance {
  constructor(id, memberIds) {
    this.id = id;
    this.memberIds = new Set(memberIds);
    this.strength = 0.6 + Math.random() * 0.3;
  }
}

// ============================================================
// SEASON STATE
// ============================================================

class SeasonState {
  constructor(players, options) {
    this.players = players;
    this.options = options;

    this.episode = 1;
    this.eliminatedOrder = [];
    this.alliances = [];
    this.rejoinUsed = false;

    this.splitMode = {
      enabled: options.splitTribe,
      groupA: [],
      groupB: [],
      toggleFlag: false
    };

    this.initRelationshipsAndAlliances();
  }

  get activePlayers() {
    return this.players.filter(p => p.active);
  }

  initRelationshipsAndAlliances() {
    // Relationships
    for (const p of this.players) {
      for (const q of this.players) {
        if (p.id === q.id) continue;
        p.relationships[q.id] = (Math.random() * 2 - 1).toFixed(2);
      }
    }

    // Alliances
    const numAlliances = Math.min(3, Math.max(1, Math.floor(this.players.length / 5)));
    let allianceId = 1;

    for (let i = 0; i < numAlliances; i++) {
      const size = 3 + Math.floor(Math.random() * 2);
      const shuffled = [...this.players].sort(() => Math.random() - 0.5);
      const members = shuffled.slice(0, size);

      const a = new Alliance(allianceId++, members.map(m => m.id));
      this.alliances.push(a);

      for (const m of members) {
        m.allianceIds.add(a.id);
      }
    }

    // Split twist
    if (this.options.splitTribe) {
      const shuffled = [...this.players].sort(() => Math.random() - 0.5);
      const mid = Math.ceil(shuffled.length / 2);
      this.splitMode.groupA = shuffled.slice(0, mid).map(p => p.id);
      this.splitMode.groupB = shuffled.slice(mid).map(p => p.id);
    }
  }
}

let season = null;

// ============================================================
// THEME
// ============================================================

function setTheme(theme) {
  document.body.className = `theme-${theme}`;
}

// ============================================================
// CAST SETUP
// ============================================================

function buildCastInputs(size) {
  const container = $("#cast-list");
  container.innerHTML = "";

  for (let i = 0; i < size; i++) {
    const div = document.createElement("div");
    div.className = "cast-input-row";
    div.innerHTML = `
      <label>
        <span>Player ${i + 1}:</span>
        <input type="text" data-cast-index="${i}" placeholder="Name" />
      </label>
    `;
    container.appendChild(div);
  }
}

function randomName() {
  const first = ["Alex", "Jordan", "Taylor", "Morgan", "Riley", "Casey", "Jamie", "Sky", "Rowan", "Elliot", "Harper", "Quinn"];
  const last = ["Stone", "Rivera", "Blake", "Knight", "Fox", "Brooks", "Vale", "Summers", "Reed", "Hart"];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
}

function randomizeCastNames() {
  $$("input[data-cast-index]").forEach(input => {
    if (!input.value.trim()) input.value = randomName();
  });
}

function getCastFromInputs() {
  return $$("input[data-cast-index]")
    .map(i => i.value.trim())
    .filter(Boolean);
}

function loadCustomCast() {
  const text = $("#custom-cast-input").value.trim();
  if (!text) return;

  try {
    const arr = JSON.parse(text);
    const names = arr.map(p => p.name).filter(Boolean);

    $("#cast-size").value = names.length;
    buildCastInputs(names.length);

    $$("input[data-cast-index]").forEach((input, idx) => {
      input.value = names[idx] || "";
    });
  } catch {
    alert("Invalid JSON.");
  }
}

// ============================================================
// DEFAULT PLAYER PICKER
// ============================================================

function renderDefaultSearch() {
  const query = $("#default-search").value.toLowerCase();
  const results = $("#default-results");
  results.innerHTML = "";

  const matches = window.DEFAULT_PLAYERS.filter(p =>
    p.name.toLowerCase().includes(query)
  );

  matches.forEach(p => {
    const div = document.createElement("div");
    div.className = "default-player-pill";
    div.textContent = p.name;
    div.onclick = () => addDefaultPlayerToCast(p.name);
    results.appendChild(div);
  });
}

function addDefaultPlayerToCast(name) {
  for (const input of $$("input[data-cast-index]")) {
    if (!input.value.trim()) {
      input.value = name;
      return;
    }
  }
  alert("Your cast is full.");
}

// ============================================================
// EPISODE LOGGING
// ============================================================

function logEpisode(text, type = "generic") {
  const log = $("#episode-log");
  const div = document.createElement("div");
  div.className = "log-entry";

  if (type === "header") div.innerHTML = `<strong>${text}</strong>`;
  else div.textContent = text;

  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// ============================================================
// EPISODE GROUP SELECTION
// ============================================================

function chooseGroupForEpisode() {
  if (!season.options.splitTribe) return season.activePlayers;

  const ids = season.splitMode.toggleFlag
    ? season.splitMode.groupB
    : season.splitMode.groupA;

  season.splitMode.toggleFlag = !season.splitMode.toggleFlag;

  const group = season.activePlayers.filter(p => ids.includes(p.id));
  return group.length ? group : season.activePlayers;
}

// ============================================================
// CHALLENGES
// ============================================================

function simulateRewardChallenge(group) {
  const challenge = CHALLENGES.reward[Math.floor(Math.random() * CHALLENGES.reward.length)];

  logEpisode(`Reward Challenge — ${challenge.name}`, "header");
  logEpisode(challenge.description);

  const winner = group[Math.floor(Math.random() * group.length)];
  logEpisode(`${winner.name} wins the reward.`);

  return winner;
}

function simulateImmunityChallenge(group) {
  const challenge = CHALLENGES.immunity[Math.floor(Math.random() * CHALLENGES.immunity.length)];

  logEpisode(`Immunity Challenge — ${challenge.name}`, "header");
  logEpisode(challenge.description);

  const winner = group[Math.floor(Math.random() * group.length)];
  logEpisode(`${winner.name} wins immunity.`);

  return winner;
}

// ============================================================
// POST-CHALLENGE EVENTS
// ============================================================

function simulatePostChallengeEvents(group) {
  logEpisode("Back at camp, dynamics shift...");

  for (let i = 0; i < 3; i++) {
    const a = group[Math.floor(Math.random() * group.length)];
    const b = group[Math.floor(Math.random() * group.length)];
    if (!a || !b || a.id === b.id) continue;

    const delta = (Math.random() * 0.4 - 0.2);
    a.relationships[b.id] = Math.max(-1, Math.min(1, parseFloat(a.relationships[b.id]) + delta));
    b.relationships[a.id] = Math.max(-1, Math.min(1, parseFloat(b.relationships[a.id]) + delta));
  }
}

// ============================================================
// ADVANTAGES
// ============================================================

function assignAdvantages(group) {
  if (season.options.idols && Math.random() < 0.35) {
    const finder = group[Math.floor(Math.random() * group.length)];
    finder.hasIdol = true;
    logEpisode(`${finder.name} finds a hidden immunity idol.`);
  }

  if (season.options.voteSteal && Math.random() < 0.2) {
    const finder = group[Math.floor(Math.random() * group.length)];
    finder.hasVoteSteal = true;
    logEpisode(`${finder.name} gains a vote steal advantage.`);
  }
}

// ============================================================
// VOTING
// ============================================================

function computeVoteWeights(group, immunePlayer) {
  const weights = new Map();
  const voters = group.filter(p => p.active && p.id !== immunePlayer.id);
  const targets = group.filter(p => p.active && p.id !== immunePlayer.id);

  for (const voter of voters) {
    const scores = targets.map(t => {
      let base = -parseFloat(voter.relationships[t.id]);
      const sharedAlliance = [...voter.allianceIds].some(id => t.allianceIds.has(id));
      if (sharedAlliance) base -= 1.0;
      base += (Math.random() - 0.5) * 0.5;
      return { target: t, score: base };
    });

    scores.sort((a, b) => b.score - a.score);
    const choice = scores[0].target;

    weights.set(choice.id, (weights.get(choice.id) || 0) + 1);
  }

  return weights;
}

function applyVoteSteal(group, immunePlayer, weights) {
  const users = group.filter(p => p.active && p.hasVoteSteal && p.id !== immunePlayer.id);
  if (!users.length) return;

  const user = users[Math.floor(Math.random() * users.length)];
  user.hasVoteSteal = false;

  logEpisode(`${user.name} uses a vote steal!`);

  const targets = Array.from(weights.keys());
  const targetId = targets[Math.floor(Math.random() * targets.length)];

  weights.set(targetId, (weights.get(targetId) || 0) + 1);
}

function applyIdols(group, immunePlayer, weights) {
  const idolHolders = group.filter(p => p.active && p.hasIdol && p.id !== immunePlayer.id);

  for (const holder of idolHolders) {
    const votesOnHolder = weights.get(holder.id) || 0;

    if (votesOnHolder > 0 && Math.random() < 0.8) {
      holder.hasIdol = false;
      logEpisode(`${holder.name} plays a hidden immunity idol!`);
      weights.set(holder.id, 0);
    }
  }
}

// ============================================================
// TIEBREAKERS
// ============================================================

function resolveTiebreaker(tiedPlayers, group, immunePlayer) {
  const mode = season.options.tiebreakerMode;

  // Revote
  logEpisode("Tie detected. Revote!");

  const voters = group.filter(p => p.active && !tiedPlayers.includes(p) && p.id !== immunePlayer.id);
  const targets = tiedPlayers;

  const weights = new Map();

  for (const voter of voters) {
    const scores = targets.map(t => {
      let base = -parseFloat(voter.relationships[t.id]);
      base += (Math.random() - 0.5) * 0.5;
      return { target: t, score: base };
    });

    scores.sort((a, b) => b.score - a.score);
    const choice = scores[0].target;

    weights.set(choice.id, (weights.get(choice.id) || 0) + 1);
  }

  const maxVotes = Math.max(...weights.values());
  const newTied = tiedPlayers.filter(p => (weights.get(p.id) || 0) === maxVotes);

  if (newTied.length === 1) return newTied[0];

  // If still tied
  if (mode === "revote") {
    logEpisode("Still tied. Rocks decide the fate...");

    const safeIds = newTied.map(p => p.id).concat([immunePlayer.id]);
    const rockPool = group.filter(p => p.active && !safeIds.includes(p.id));

    const loser = rockPool[Math.floor(Math.random() * rockPool.length)];
    logEpisode(`${loser.name} draws the losing rock.`);
    return loser;
  }

  // Challenge tiebreaker
  const tb = TIEBREAKERS[Math.floor(Math.random() * TIEBREAKERS.length)];

  logEpisode(`Tiebreaker Challenge — ${tb.name}`, "header");
  logEpisode(tb.description);

  const loser = newTied[Math.floor(Math.random() * newTied.length)];
  logEpisode(`${loser.name} loses the tiebreaker challenge.`);

  return loser;
}

// ============================================================
// ELIMINATION
// ============================================================

function eliminatePlayer(player) {
  player.active = false;
  season.eliminatedOrder.push(player);
}

function simulateElimination(group, immunePlayer) {
  logEpisode("Elimination ceremony begins...", "header");

  let weights = computeVoteWeights(group, immunePlayer);

  if (season.options.voteSteal) applyVoteSteal(group, immunePlayer, weights);
  if (season.options.idols) applyIdols(group, immunePlayer, weights);

  const entries = Array.from(weights.entries());
  entries.sort((a, b) => b[1] - a[1]);

  const maxVotes = entries[0][1];
  const topTargets = entries.filter(e => e[1] === maxVotes).map(([id]) =>
    group.find(p => p.id === id)
  );

  if (topTargets.length === 1) {
    const out = topTargets[0];
    logEpisode(`${out.name} is voted out with ${maxVotes} votes.`);
    return out;
  }

  logEpisode(`Tie between ${topTargets.map(p => p.name).join(" & ")}.`);
  return resolveTiebreaker(topTargets, group, immunePlayer);
}

// ============================================================
// TWISTS
// ============================================================

function applyTwistsPreEpisode(group) {
  if (season.options.suddenDeath && Math.random() < 0.1) {
    logEpisode("TWIST: Sudden death challenge!", "header");

    const loser = group[Math.floor(Math.random() * group.length)];
    logEpisode(`${loser.name} loses the sudden death challenge and is eliminated.`);

    eliminatePlayer(loser);
    return true;
  }

  if (season.options.rejoin && !season.rejoinUsed && season.episode >= 5 && Math.random() < 0.4) {
    const pool = season.eliminatedOrder.slice(0, Math.min(5, season.eliminatedOrder.length));

    if (pool.length > 0) {
      const rejoiner = pool[Math.floor(Math.random() * pool.length)];
      rejoiner.active = true;

      season.eliminatedOrder = season.eliminatedOrder.filter(p => p.id !== rejoiner.id);
      season.rejoinUsed = true;

      logEpisode(`TWIST: Rejoin challenge! ${rejoiner.name} returns to the game.`, "header");
    }
  }

  return false;
}

// ============================================================
// TRACK RECORD
// ============================================================

function updateTrackRecordForEpisode(immunePlayer, eliminatedPlayer) {
  const epIndex = season.episode - 1;

  for (const p of season.players) {
    if (!p.active && p !== eliminatedPlayer && p.trackRecord.length <= epIndex) {
      p.trackRecord[epIndex] = "OUT";
      continue;
    }

    if (p === eliminatedPlayer) {
      p.trackRecord[epIndex] = "OUT";
    } else if (p === immunePlayer) {
      p.trackRecord[epIndex] = "WIN";
    } else if (p.active) {
      p.trackRecord[epIndex] = Math.random() < 0.25 ? "LOW" : "SAFE";
    } else {
      p.trackRecord[epIndex] = "OUT";
    }
  }
}

function renderTrackRecordTable() {
  const table = $("#track-record-table");
  table.innerHTML = "";

  const episodes = season.episode;

  const sorted = season.players.slice().sort((a, b) => {
    const aOut = season.eliminatedOrder.findIndex(p => p.id === a.id);
    const bOut = season.eliminatedOrder.findIndex(p => p.id === b.id);

    if (aOut === -1 && bOut === -1) return 0;
    if (aOut === -1) return 1;
    if (bOut === -1) return -1;
    return aOut - bOut;
  });

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  headRow.innerHTML = `
    <th>#</th>
    <th>Player</th>
    ${Array.from({ length: episodes }, (_, i) => `<th>Ep ${i + 1}</th>`).join("")}
  `;

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  sorted.forEach((p, index) => {
    const tr = document.createElement("tr");

    const placement = season.eliminatedOrder.findIndex(x => x.id === p.id);
    const placeNum = placement === -1 ? sorted.length : placement + 1;

    tr.innerHTML = `<td>${placeNum}</td><td>${p.name}</td>`;

    for (let e = 0; e < episodes; e++) {

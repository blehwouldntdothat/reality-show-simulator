// ============================================================
// defaultPlayers.js
// Pre-made characters the user can search and add to their cast
// ============================================================

window.DEFAULT_PLAYERS = [
  // --- Classic Survivor Archetypes ---
  { name: "Ava Storm", archetype: "Strategist", season: "Custom" },
  { name: "Leo Hart", archetype: "Challenge Beast", season: "Custom" },
  { name: "Mira Vale", archetype: "Social Player", season: "Custom" },
  { name: "Jasper Quinn", archetype: "Wildcard", season: "Custom" },
  { name: "Nova Reed", archetype: "Superfan", season: "Custom" },
  { name: "Kai Rivers", archetype: "Calm Thinker", season: "Custom" },
  { name: "Sage Monroe", archetype: "Villain", season: "Custom" },
  { name: "Ember Fox", archetype: "Hero", season: "Custom" },
  { name: "Rowan Blake", archetype: "Loyalist", season: "Custom" },
  { name: "Luna Frost", archetype: "Underdog", season: "Custom" },

  // --- Add as many as you want ---
  { name: "Tara Flint", archetype: "Strategist" },
  { name: "Drew Maddox", archetype: "Goofball" },
  { name: "Selene Cross", archetype: "Villain" },
  { name: "Orion Pike", archetype: "Challenge Beast" },
  { name: "Holly Crest", archetype: "Social Player" },
  { name: "Vance Holloway", archetype: "Wildcard" },
  { name: "Piper Gale", archetype: "Hero" },
  { name: "Nico Frost", archetype: "Underdog" },
  { name: "Rhea Solis", archetype: "Calm Thinker" },
  { name: "Atlas Ward", archetype: "Superfan" }
];

// ============================================================
// Utility: search function (optional)
// You can use this in your main script if you want.
// ============================================================

window.searchDefaultPlayers = function (query) {
  const q = query.toLowerCase();
  return window.DEFAULT_PLAYERS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.archetype && p.archetype.toLowerCase().includes(q))
  );
};

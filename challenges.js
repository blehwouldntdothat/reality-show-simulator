// ============================================================
// challenges.js
// Reward, immunity, and optional team challenges for the simulator
// ============================================================

window.CHALLENGES = {
  // ------------------------------------------------------------
  // REWARD CHALLENGES
  // ------------------------------------------------------------
  reward: [
    {
      name: "Fishing Frenzy",
      description: "Castaways race to gather fish using makeshift tools. Speed and accuracy determine the winner."
    },
    {
      name: "Shelter Sprint",
      description: "Players collect scattered materials and assemble a mini-shelter as fast as possible."
    },
    {
      name: "Jungle Relay",
      description: "Teams navigate obstacles, retrieve bags, and solve a small puzzle at the end."
    },
    {
      name: "Comfort Quest",
      description: "Players compete in a balance-and-endurance challenge for blankets and pillows."
    },
    {
      name: "Fruit Feast",
      description: "A scavenger hunt for fruit hidden around the island. The most collected wins."
    },
    {
      name: "SOS Signal",
      description: "Players must build the most visible distress signal using limited supplies."
    }
  ],

  // ------------------------------------------------------------
  // IMMUNITY CHALLENGES
  // ------------------------------------------------------------
  immunity: [
    {
      name: "Balance of Power",
      description: "Players balance on narrow beams while holding weighted poles. Last standing wins immunity."
    },
    {
      name: "Puzzle Pyramid",
      description: "A multi-stage puzzle challenge testing memory, logic, and speed."
    },
    {
      name: "Endurance Gauntlet",
      description: "Castaways hold a heavy idol above their head. Dropping it means elimination from the challenge."
    },
    {
      name: "Tethered Maze",
      description: "Players navigate a rope maze while blindfolded, relying on touch and memory."
    },
    {
      name: "Ring Toss Showdown",
      description: "A classic Survivor challenge: retrieve rings and toss them onto pegs to score points."
    },
    {
      name: "Obstacle Tower",
      description: "Players climb, crawl, and leap through a vertical obstacle course before solving a final puzzle."
    }
  ],

  // ------------------------------------------------------------
  // TEAM CHALLENGES (OPTIONAL)
  // If you add tribes later, these will already be ready.
  // ------------------------------------------------------------
  team: [
    {
      name: "Raft Rush",
      description: "Teams paddle across the water to retrieve crates, then assemble a puzzle on shore."
    },
    {
      name: "Tug of War",
      description: "A strength-based challenge where teams pull against each other in a muddy arena."
    },
    {
      name: "Fire Relay",
      description: "Teams transport a flame through obstacles without letting it go out."
    }
  ],
  ]
};

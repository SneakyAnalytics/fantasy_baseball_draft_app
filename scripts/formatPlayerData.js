import fs from "fs";

const formatPlayer = (rawPlayer) => ({
  id: rawPlayer.id || 0,
  name: rawPlayer.name,
  team: rawPlayer.team,
  position: rawPlayer.primary_position,
  positions: rawPlayer.eligible_positions || [rawPlayer.primary_position],
  projectedPoints: calculateProjectedPoints(rawPlayer.stats),
  adp: rawPlayer.adp || 0,
  tier: calculateTier(rawPlayer.adp),
  stats: {
    R: rawPlayer.stats?.R || 0,
    HR: rawPlayer.stats?.HR || 0,
    RBI: rawPlayer.stats?.RBI || 0,
    SB: rawPlayer.stats?.SB || 0,
    AVG: rawPlayer.stats?.AVG || 0,
    IP: rawPlayer.stats?.IP || 0,
    W: rawPlayer.stats?.W || 0,
    SV: rawPlayer.stats?.SV || 0,
    K: rawPlayer.stats?.K || 0,
    ERA: rawPlayer.stats?.ERA || 0,
    WHIP: rawPlayer.stats?.WHIP || 0,
  },
});

const calculateProjectedPoints = (stats) => {
  // Implement your league's scoring system here
  // This is just an example
  if (!stats) return 0;

  return (
    stats.R * 1 +
    stats.HR * 4 +
    stats.RBI * 1 +
    stats.SB * 2 +
    stats.W * 4 +
    stats.SV * 5 +
    stats.K * 0.5
    // Add more scoring categories as needed
  );
};

const calculateTier = (adp) => {
  if (adp <= 20) return 1;
  if (adp <= 50) return 2;
  if (adp <= 100) return 3;
  if (adp <= 150) return 4;
  return 5;
};

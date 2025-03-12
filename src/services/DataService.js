import mergedData from "../../data/merged_projections.json";

export const DataService = {
  players: mergedData,

  getAllPlayers() {
    return this.players.sort((a, b) => (a.adp || 999) - (b.adp || 999));
  },

  getPlayerById(id) {
    return this.players.find((player) => player.id === id);
  },

  getPlayersByPosition(position) {
    return this.players
      .filter((player) => player.positions.includes(position))
      .sort((a, b) => (a.adp || 999) - (b.adp || 999));
  },

  getTopPlayersByFantasyPoints(limit = 25) {
    return [...this.players]
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints)
      .slice(0, limit);
  },

  getPositionScarcity() {
    const positionCounts = this.players.reduce((acc, player) => {
      player.positions.forEach((pos) => {
        acc[pos] = (acc[pos] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(positionCounts).sort((a, b) => a[1] - b[1]);
  },

  getAvailablePlayers(draftedIds) {
    return this.players.filter((player) => !draftedIds.includes(player.id));
  },
};

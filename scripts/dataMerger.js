import { processProjectionsCSV, processRosterResourceCSV } from "./csvProcessor.js";
import path from "path";
import fs from "fs/promises";

async function mergePlayerData() {
  try {
    // Process roster data first to get positions and status
    console.log("Processing roster resource data...");
    const rosterData = await processRosterResourceCSV(
      path.join(process.cwd(), "data", "roster-resource-download.csv")
    );
    console.log(`Processed ${Object.keys(rosterData).length} roster entries`);

    // Process batting projections
    console.log("Processing batting projections...");
    const battingData = await processProjectionsCSV(
      path.join(process.cwd(), "data", "fangraphs_batting_projections.csv"),
      "batting",
      rosterData
    );
    console.log(`Processed ${battingData.length} batting projections`);

    // Process pitching projections
    console.log("Processing pitching projections...");
    const pitchingData = await processProjectionsCSV(
      path.join(process.cwd(), "data", "fangraphs_pitching_projections.csv"),
      "pitching",
      rosterData
    );
    console.log(`Processed ${pitchingData.length} pitching projections`);

    // Deduplicate players (combine batting and pitching stats for two-way players)
    console.log("Deduplicating players...");
    const playerMap = new Map();
    
    // First add all batters
    battingData.forEach(player => {
      playerMap.set(player.name, player);
    });
    
    // Then add or merge pitchers
    pitchingData.forEach(pitcher => {
      if (playerMap.has(pitcher.name)) {
        // Merge batting and pitching stats for the same player
        const existingPlayer = playerMap.get(pitcher.name);
        
        // Ensure the player is marked as a two-way player
        existingPlayer.isTwoWayPlayer = true;
        
        // Add pitching stats to the existing player
        existingPlayer.pitchingStats = {
          W: pitcher.stats.W || 0,
          L: pitcher.stats.L || 0,
          ERA: pitcher.stats.ERA || 0,
          G: pitcher.stats.G || 0,
          GS: pitcher.stats.GS || 0,
          SV: pitcher.stats.SV || 0,
          IP: pitcher.stats.IP || 0,
          SO: pitcher.stats.SO || 0,
          WHIP: pitcher.stats.WHIP || 0,
        };
        
        // Adjust projectedPoints to include both batting and pitching
        existingPlayer.projectedPoints += pitcher.projectedPoints;
        
        // If the player's main role is pitching, ensure position reflects that
        if (pitcher.pitchingRole === 'primary') {
          existingPlayer.positions = [...new Set([...existingPlayer.positions, ...pitcher.positions])];
        }
      } else {
        // Just add the pitcher
        playerMap.set(pitcher.name, pitcher);
      }
    });
    
    // Convert Map to array
    const allPlayers = Array.from(playerMap.values());
    console.log(`Total unique players after deduplication: ${allPlayers.length}`);

    // Save merged data
    const outputPath = path.join(
      process.cwd(),
      "data",
      "merged_projections.json"
    );
    await fs.writeFile(outputPath, JSON.stringify(allPlayers, null, 2));
    console.log(`Data saved to ${outputPath}`);

    return allPlayers;
  } catch (error) {
    console.error("Error processing projections:", error);
    return [];
  }
}

mergePlayerData();

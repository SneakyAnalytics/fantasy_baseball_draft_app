import fs from "fs/promises";
import { parse } from "csv-parse";
import path from "path";

// Process Roster Resource CSV to get position and status data
export async function processRosterResourceCSV(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    
    return new Promise((resolve, reject) => {
      const rosterData = {};
      
      parse(fileContent, {
        columns: true,
        skipEmptyLines: true,
      })
        .on("data", (data) => {
          // Handle BOM in CSV headers
          if (data["﻿playerId"] && !data["playerId"]) {
            data["playerId"] = data["﻿playerId"];
          }
          
          const playerName = data["Name"];
          if (!playerName) return;
          
          // Create a clean key for matching players
          const nameKey = playerName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/[^a-z0-9]/g, ""); // Remove non-alphanumeric chars
          
          rosterData[nameKey] = {
            playerId: data["playerId"],
            name: data["Name"],
            team: data["Team"],
            position: data["Pos"],
            primaryPosition: data["Pos"],
            positions: parsePositions(data["Pos"]),
            status: data["Projected Opening Day Status"] || "Unknown",
            serviceTime: data["Service Time"] || "",
            age: parseFloat(data["Age"]) || 0,
          };
        })
        .on("end", () => {
          resolve(rosterData);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.error("Error processing roster CSV:", error);
    return {};
  }
}

// Parse positions from Roster Resource format
function parsePositions(posString) {
  if (!posString) return ["UTIL"];
  
  // Map standard positions
  const positionMap = {
    "C": ["C", "UTIL"],
    "1B": ["1B", "UTIL"],
    "2B": ["2B", "UTIL"],
    "3B": ["3B", "UTIL"],
    "SS": ["SS", "UTIL"],
    "LF": ["OF", "UTIL"],
    "CF": ["OF", "UTIL"],
    "RF": ["OF", "UTIL"],
    "OF": ["OF", "UTIL"],
    "DH": ["UTIL"],
    "SP": ["SP", "P"],
    "RP": ["RP", "P"],
    "CL": ["RP", "P"],
  };
  
  // Get the mapped positions or default to UTIL
  const positions = positionMap[posString] || ["UTIL"];
  
  return positions;
}

// Process projections CSV files (batting and pitching)
export async function processProjectionsCSV(filePath, type = "batting", rosterData = {}) {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    
    // Default positions if roster data unavailable
    function inferBattingPosition(row) {
      // For batters, use HR and SB to guess if it's an OF
      const hr = parseInt(row["HR"]) || 0;
      const sb = parseInt(row["SB"]) || 0;
      
      if (hr > 30) return ["OF", "UTIL"];  // Power hitters
      if (sb > 20) return ["OF", "UTIL"];  // Speed players
      if (hr > 20 && sb > 10) return ["OF", "UTIL"]; // Combo players
      
      return ["UTIL"];
    }
    
    function inferPitchingPosition(row) {
      const gs = parseInt(row["GS"]) || 0;
      const sv = parseInt(row["SV"]) || 0;
      
      if (gs > 10) return ["SP", "P"];   // Starting pitchers
      if (sv > 0) return ["RP", "P"];    // Relief pitchers
      return ["P"];                      // Default pitcher position
    }
    
    // Match player with roster data
    function matchPlayerWithRoster(name, team) {
      // Clean name for matching
      const cleanName = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9]/g, ""); // Remove non-alphanumeric chars
      
      // Try exact match first
      const rosterMatch = rosterData[cleanName];
      
      // If no exact match, try partial matching
      if (!rosterMatch && Object.keys(rosterData).length > 0) {
        // Find closest match
        for (const key in rosterData) {
          if (cleanName.includes(key) || key.includes(cleanName)) {
            return rosterData[key];
          }
        }
      }
      
      return rosterMatch;
    }

    function calculateBattingPoints(row) {
      // Add more sophisticated points calculation
      const points = {
        singles:
          ((parseInt(row["H"]) || 0) -
            (parseInt(row["2B"]) || 0) -
            (parseInt(row["3B"]) || 0) -
            (parseInt(row["HR"]) || 0)) *
          1,
        doubles: (parseInt(row["2B"]) || 0) * 2,
        triples: (parseInt(row["3B"]) || 0) * 3,
        hr: (parseInt(row["HR"]) || 0) * 4,
        rbi: (parseInt(row["RBI"]) || 0) * 1.5,
        runs: (parseInt(row["R"]) || 0) * 1.5,
        sb: (parseInt(row["SB"]) || 0) * 3,
        bb: (parseInt(row["BB"]) || 0) * 0.5,
      };

      return Object.values(points).reduce((sum, val) => sum + val, 0);
    }

    function calculatePitchingPoints(row) {
      return (
        (parseInt(row["W"]) || 0) * 5 +
        (parseInt(row["SV"]) || 0) * 4 +
        (parseInt(row["SO"]) || 0) * 1 -
        (parseFloat(row["ERA"]) || 4.5) * 10 -
        (parseFloat(row["WHIP"]) || 1.4) * 10
      );
    }

    function calculateTier(adp) {
      if (adp <= 20) return 1;
      if (adp <= 50) return 2;
      if (adp <= 100) return 3;
      if (adp <= 150) return 4;
      return 5;
    }

    function processBattingRow(row) {
      if (!row || !row["Name"]) return null;

      const name = row["Name"];
      const team = row["Team"];
      
      // Try to match with roster data
      const rosterMatch = matchPlayerWithRoster(name, team);
      
      // Use roster data if available, otherwise infer
      const positions = rosterMatch?.positions || inferBattingPosition(row);
      const primaryPosition = rosterMatch?.primaryPosition || positions[0];
      const status = rosterMatch?.status || "Unknown";
      
      const fantasyPoints = calculateBattingPoints(row);
      const adp = parseFloat(row["ADP"]) || 999.0;

      return {
        id: `${row["Name"].toLowerCase().replace(/[^a-z0-9]/g, "-")}-${team}`,
        name: name,
        team: team,
        position: primaryPosition,
        positions: positions,
        rosterStatus: status,
        projectedPoints: fantasyPoints,
        fantasyPoints: fantasyPoints,
        adp: adp,
        tier: calculateTier(adp),
        stats: {
          PA: parseInt(row["PA"]) || 0,
          AB: parseInt(row["AB"]) || 0,
          H: parseInt(row["H"]) || 0,
          "2B": parseInt(row["2B"]) || 0,
          "3B": parseInt(row["3B"]) || 0,
          HR: parseInt(row["HR"]) || 0,
          R: parseInt(row["R"]) || 0,
          RBI: parseInt(row["RBI"]) || 0,
          SB: parseInt(row["SB"]) || 0,
          BB: parseInt(row["BB"]) || 0,
          AVG: parseFloat(row["AVG"]) || 0,
          OBP: parseFloat(row["OBP"]) || 0,
          SLG: parseFloat(row["SLG"]) || 0,
        },
        // Store all stats for detailed view later
        allStats: { ...row },
        serviceTime: rosterMatch?.serviceTime || "",
        age: rosterMatch?.age || 0,
        type: "batter",
        source: "fangraphs",
      };
    }

    function processPitchingRow(row) {
      // Fix issues with BOM in CSV headers
      if (!row || !row["Name"]) {
        if (row && row["﻿Name"]) {
          row["Name"] = row["﻿Name"];
        } else {
          return null;
        }
      }
      
      try {
        const name = row["Name"];
        const team = row["Team"] || "";
        
        // Try to match with roster data
        const rosterMatch = matchPlayerWithRoster(name, team);
        
        // Use roster data if available, otherwise infer
        const positions = rosterMatch?.positions || inferPitchingPosition(row);
        const primaryPosition = rosterMatch?.primaryPosition || positions[0];
        const status = rosterMatch?.status || "Unknown";
        
        const fantasyPoints = calculatePitchingPoints(row);
        const adp = parseFloat(row["ADP"]) || 999.0;
        
        // Determine if this is primarily a pitcher
        const gs = parseInt(row["GS"]) || 0;
        const ip = parseFloat(row["IP"]) || 0;
        const pitchingRole = ip > 50 ? 'primary' : 'secondary';

        return {
          id: `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${team}`,
          name: name,
          team: team,
          position: primaryPosition,
          positions: positions,
          rosterStatus: status,
          projectedPoints: fantasyPoints,
          fantasyPoints: fantasyPoints,
          adp: adp,
          tier: calculateTier(adp),
          stats: {
            W: parseInt(row["W"]) || 0,
            L: parseInt(row["L"]) || 0,
            ERA: parseFloat(row["ERA"]) || 0,
            G: parseInt(row["G"]) || 0,
            GS: parseInt(row["GS"]) || 0,
            SV: parseInt(row["SV"]) || 0,
            IP: parseFloat(row["IP"]) || 0,
            SO: parseInt(row["SO"]) || 0,
            WHIP: parseFloat(row["WHIP"]) || 0,
          },
          // Store all stats for detailed view later
          allStats: { ...row },
          serviceTime: rosterMatch?.serviceTime || "",
          age: rosterMatch?.age || 0,
          type: "pitcher",
          pitchingRole: pitchingRole,
          source: "fangraphs",
        };
      } catch (error) {
        console.error("Error processing pitching row:", error);
        return null;
      }
    }

    return new Promise((resolve, reject) => {
      const results = [];

      parse(fileContent, {
        columns: true,
        skipEmptyLines: true,
      })
        .on("data", (data) => {
          // Fix the 'Name' key by checking for '﻿Name' (with BOM) as seen in error logs
          if (data["﻿Name"] && !data["Name"]) {
            data["Name"] = data["﻿Name"];
          }

          const processed =
            type === "batting"
              ? processBattingRow(data)
              : processPitchingRow(data);
          if (processed) results.push(processed);
        })
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.error("Error processing CSV:", error, "for file:", filePath);
    return [];
  }
}

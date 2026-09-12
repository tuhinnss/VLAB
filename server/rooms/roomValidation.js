import { RETAINED_SIMULATION_LINKS } from "../../app/(core)/data/retainedSimulations.js";

/** Same simulators the frontend can actually navigate to — see retainedSimulations.js. */
const SIMULATOR_IDS = new Set(
  RETAINED_SIMULATION_LINKS.map((link) => link.split("/").pop())
);

export function isValidSimulatorId(simulatorId) {
  return typeof simulatorId === "string" && SIMULATOR_IDS.has(simulatorId);
}

export function listSimulatorIds() {
  return Array.from(SIMULATOR_IDS);
}

// Room capacity rules. Only touched here if the limits ever need to change.
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS_TO_START = 2;

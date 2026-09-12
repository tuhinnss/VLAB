/**
 * Simulations that currently have a static-exported route (see
 * `dynamicParams = false` + `generateStaticParams` in
 * `app/(pages)/simulations/[id]/page.tsx`). Anything in `chapters.js` but not
 * listed here has no reachable `/simulations/:id` page yet.
 *
 * Shared with the multiplayer room server so a room can never be created for
 * a simulator nobody can actually navigate to.
 */
export const RETAINED_SIMULATION_LINKS = [
  "/simulations/BallAcceleration",
  "/simulations/BouncingBall",
  "/simulations/BallGravity",
  "/simulations/ParabolicMotion",
  "/simulations/InclinedPlane",
];

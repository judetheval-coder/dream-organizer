# Evolving Shapes — MVP Plan

## Objective
Create a minimal, playable prototype demonstrating the core emergent/adaptive mechanics: player movement, shapes that learn & adapt using short-term memory, and basic visual/audio feedback.

## Goals
- Implement player movement + smooth controls + trail
- Create shape agent types: basic chaser (triangle), evader (circle), swarmer (particles)
- Basic memory-based prediction & behavior selection (pursue & wander)
- XP & simple level up per shape with visual feedback
- Running world with spawn events and tuneable parameters via JSON

## Timeline & Milestones (2-6 weeks)
- Week 0 (planning): finalize scope and create design docs & JSON schema
- Week 1 (MVP prototyping): player movement; spawn system; shape agents with chase/wander
- Week 2 (AI & memory): implement memory buffer, prediction, simple learning; visualize trace
- Week 3 (Evolution & visuals): level up visuals, trail, particle effects, sound stubs
- Week 4 (Polish): debugging, performance, analytics, export (snapshot)

## Deliverables
- `docs/MVP_PLAN.md`
- Unity C# scripts: `PlayerController.cs`, `ShapeAgent.cs`, `Spawner.cs` (or Godot/JS equivalents)
- JSON parameters & sample dataset: `config/default_parameters.json`
- README with instructions and next steps

## Acceptance Criteria
MVP is complete when a tester can run the project and experience:
1. Smooth player movement with trail.
2. Spawned shapes that chase or wander adaptively using recent player movement.
3. Visual indicators of shape evolution.

## Future Enhancements (Post-MVP)
- Swarming, orbiting, mutators, splitting & reproduction
- Additional zones and procedural events
- Audio & visual polish
- Export of visual compositions to PNG/SVG
- Multiplayer & advanced ML-based learning

## Tools & Technologies
- Primary: Unity 2020+ with C# (prefab & ScriptableObjects recommended)
- Alternatives: Godot 4 (GDScript), Web prototype (TypeScript + Canvas + WebAudio)


## Next Steps
1. Build initial prototype scripts for Unity (PlayerController, ShapeAgent, Spawner)
2. Add JSON config schema and sample dataset
3. Create a reference shader/particle system plan


---

(End of MVP Plan)

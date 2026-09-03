# KeeleSepp Lesson Scene Standard v1

## Purpose

Adaptive lessons use purposeful illustrated scenes, not emoji collages or decorative stock imagery. A scene must help the learner understand, speak, describe, solve a problem or transfer language to a new situation.

## Visual contract

- polished educational cartoon / caricature style for school-age learners and adults;
- expressive but believable people, gestures and facial expressions;
- clear real-life context with useful environmental clues;
- soft natural palette aligned with KeeleSepp cream, navy, muted green and gold UI;
- landscape composition suitable for the main Lesson Mode card;
- no text baked into the illustration unless the lesson explicitly requires authentic signage;
- no emoji placeholders in production lessons;
- avoid childish clip-art, photorealistic stock style, visual clutter and irrelevant decoration.

## Pedagogical contract

Each scene is attached to a concrete lesson activity and should support one or more actions: identify, describe, explain, ask, respond, compare, justify, role-play or solve.

The same scene should normally be reused across support/core/advanced routes. Difficulty changes through instructions, scaffolding and transfer demand rather than by generating three unrelated pictures.

A lesson scene record should be able to carry:

- stable `id`;
- `src` or managed asset reference;
- short `alt` description;
- `purpose` describing what language action the scene supports;
- optional `focusVocabularyIds`;
- optional `credit` / provenance metadata when required.

## Route use example

For a delayed-bus scene:

- support: identify what happened and complete a model phrase;
- core: explain the problem and ask another person for help;
- advanced: role-play a conversation, propose alternatives and justify the best solution.

## Lesson Mode rendering

The current scene is a primary teaching surface below the task prompt. It should use most of the available card width, preserve its aspect ratio and crop minimally. On mobile it remains visible and should not collapse into an icon.

Vocabulary icons may be small supporting illustrations, but they do not replace the main scene.

## Generation guidance

When generating a new scene, specify the pedagogical situation first, then characters/actions/emotions, then environmental clues, and finally the KeeleSepp visual treatment. Do not ask the image model to render UI chrome or lesson text into the scene itself.

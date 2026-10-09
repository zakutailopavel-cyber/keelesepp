import { useEffect, useState } from 'react';
import { grammarFor, loadGrammarProfile } from '../didactics/grammarProfile.js';
import { levelKey } from '../didactics/levels.js';

// the EKI grammar topics of a level, for the AI request fields („Lünk harjutab”, „Grammatika tekstis”)
export function useGrammarTopics(level) {
  const [topics, setTopics] = useState([]);
  useEffect(() => {
    let alive = true;
    loadGrammarProfile().then((p) => { if (alive && p) setTopics([...new Set(grammarFor(p, levelKey(level)).targets.map((t) => t.topic))]); });
    return () => { alive = false; };
  }, [level]);
  return topics;
}

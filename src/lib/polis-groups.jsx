/* eslint-disable react-refresh/only-export-components -- data module: exports
   the group config (whose `icon` fields are components), not a UI component. */
import { Icon as LucideIcon, Car, Landmark } from 'lucide-react';
import { treesForest } from '@lucide/lab';
import { POLIS_GROUPS_DATA } from './polis-groups-data';

// Layer a representative Lucide icon onto each opinion group (text lives in the
// Node-importable polis-groups-data.js, the single source):
//   A → Car (car-first), B → Landmark (culture/heritage),
//   C → trees (a Lucide Lab icon) for the green / sustainable-city majority.
const Trees = (props) => <LucideIcon iconNode={treesForest} {...props} />;
const ICONS = { A: Car, B: Landmark, C: Trees };

export const POLIS_GROUPS = POLIS_GROUPS_DATA.map((g) => ({ ...g, icon: ICONS[g.label] }));

export const polisGroupByLabel = Object.fromEntries(POLIS_GROUPS.map((g) => [g.label, g]));

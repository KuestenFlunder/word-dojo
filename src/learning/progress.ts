/**
 * Fortschritt des Kindes: Fach je Wort UND Modus, dazu Sterne und Tages-Serie.
 * Alle Funktionen sind rein (geben einen neuen Fortschritt zurück, verändern nichts).
 */
import type { Vocab, WordId } from '../data/types';
import { BOXES, isDue, nextBox, type LeitnerBox, type Outcome } from './leitner';
import { emptyRewards, parseRewards, type Rewards } from './rewards';

/** Aktuelle Version des gespeicherten Formats. */
export const PROGRESS_VERSION = 1;

/**
 * Lernmodi. Jeder führt seinen eigenen Karteikasten.
 * - `en-de`: Karte, Englisch zeigen, aufdecken, selbst bewerten.
 * - `de-en`: Karte, Deutsch zeigen, aufdecken, selbst bewerten.
 * - `schreiben`: Deutsch zeigen, Englisch tippen.
 */
export const MODES = ['en-de', 'de-en', 'schreiben'] as const;
export type Mode = (typeof MODES)[number];

/** Lernstand eines Wortes in einem Modus. */
export interface ItemProgress {
  box: LeitnerBox;
  /** Wie oft gewusst. */
  correct: number;
  /** Wie oft nicht gewusst (bei `schreiben`: falsch getippt und abgeschrieben). */
  wrong: number;
  /** Zeitpunkt des letzten Übens in ms seit Epoch, `null` = nie. */
  lastPracticed: number | null;
}

/** Schlüssel eines Eintrags: Modus und Wort, z. B. `"schreiben:u2p1:hero"`. */
export type ItemKey = `${Mode}:${WordId}`;

/** Gesamter gespeicherter Fortschritt. */
export interface Progress {
  version: typeof PROGRESS_VERSION;
  /** Nur geübte Wörter stehen hier; fehlende gelten als {@link NEW_ITEM_PROGRESS}. */
  items: Partial<Record<ItemKey, ItemProgress>>;
  /** Sterne und Tages-Serie. */
  rewards: Rewards;
}

/** Zustand eines noch nie geübten Wortes: Fach 1, sofort fällig. */
export const NEW_ITEM_PROGRESS: Readonly<ItemProgress> = { box: 1, correct: 0, wrong: 0, lastPracticed: null };

/** Leerer Fortschritt (Neustart). */
export function emptyProgress(): Progress {
  return { version: PROGRESS_VERSION, items: {}, rewards: emptyRewards() };
}

/** Schlüssel für {@link Progress.items}. */
export function itemKey(mode: Mode, wordId: WordId): ItemKey {
  return `${mode}:${wordId}`;
}

/** Lernstand eines Wortes in einem Modus (auch für nie geübte). */
export function getItemProgress(progress: Progress, mode: Mode, wordId: WordId): ItemProgress {
  return progress.items[itemKey(mode, wordId)] ?? NEW_ITEM_PROGRESS;
}

/** Trägt ein Ergebnis ein: gewusst → ein Fach weiter, nicht gewusst → Fach 1; dazu Zähler und Zeitpunkt. */
export function recordOutcome(progress: Progress, mode: Mode, wordId: WordId, outcome: Outcome, now: number): Progress {
  const current = getItemProgress(progress, mode, wordId);
  const updated: ItemProgress = {
    box: nextBox(current.box, outcome),
    correct: current.correct + (outcome === 'gewusst' ? 1 : 0),
    wrong: current.wrong + (outcome === 'nicht-gewusst' ? 1 : 0),
    lastPracticed: now,
  };
  return { ...progress, items: { ...progress.items, [itemKey(mode, wordId)]: updated } };
}

/** True, wenn das Wort in diesem Modus jetzt fällig ist. */
export function isWordDue(progress: Progress, mode: Mode, wordId: WordId, now: number): boolean {
  const item = getItemProgress(progress, mode, wordId);
  return isDue(item.box, item.lastPracticed, now);
}

/** Fach-Statistik eines Modus über eine Wortliste. */
export interface ModeStats {
  /** Anzahl Wörter der Liste. */
  total: number;
  /** Wörter je Fach (nie geübte zählen zu Fach 1). */
  boxes: Record<LeitnerBox, number>;
  /** Jetzt fällige Wörter (nie geübte eingeschlossen). */
  due: number;
  /** Noch nie in diesem Modus geübt. */
  unseen: number;
  /** In Fach 5 angekommen. */
  mastered: number;
}

/** Zählt für einen Modus, wie viele der Wörter in welchem Fach liegen und wie viele fällig sind. */
export function modeStats(progress: Progress, mode: Mode, words: readonly Vocab[], now: number): ModeStats {
  const boxes: Record<LeitnerBox, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let due = 0;
  let unseen = 0;
  for (const word of words) {
    const item = getItemProgress(progress, mode, word.id);
    boxes[item.box]++;
    if (isDue(item.box, item.lastPracticed, now)) due++;
    if (item.lastPracticed === null) unseen++;
  }
  return { total: words.length, boxes, due, unseen, mastered: boxes[5] };
}

/** {@link modeStats} für alle drei Modi. */
export function allModeStats(progress: Progress, words: readonly Vocab[], now: number): Record<Mode, ModeStats> {
  return {
    'en-de': modeStats(progress, 'en-de', words, now),
    'de-en': modeStats(progress, 'de-en', words, now),
    schreiben: modeStats(progress, 'schreiben', words, now),
  };
}

/** Serialisiert den Fortschritt für die Ablage. */
export function serializeProgress(progress: Progress): string {
  return JSON.stringify(progress);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function parseItemProgress(value: unknown): ItemProgress | undefined {
  if (!isRecord(value)) return undefined;
  const { box, correct, wrong, lastPracticed } = value;
  if (typeof box !== 'number' || !(BOXES as readonly number[]).includes(box)) return undefined;
  if (!isCount(correct) || !isCount(wrong)) return undefined;
  if (lastPracticed !== null && (typeof lastPracticed !== 'number' || !Number.isFinite(lastPracticed))) return undefined;
  return { box: box as LeitnerBox, correct, wrong, lastPracticed };
}

function isItemKey(key: string): key is ItemKey {
  return MODES.some((mode) => key.startsWith(`${mode}:`) && key.length > mode.length + 1);
}

/** Wie {@link tryParseProgress}, liefert bei unbrauchbarem Inhalt aber einen leeren Fortschritt. */
export function parseProgress(raw: string | null | undefined): Progress {
  if (!raw) return emptyProgress();
  return tryParseProgress(raw) ?? emptyProgress();
}

/**
 * Liest gespeicherten Fortschritt robust ein. Unbrauchbarer Inhalt (kein JSON, falsche
 * Version, falscher Aufbau) ergibt `undefined`, damit die Ablage den Rohinhalt vor dem
 * Neustart sichern kann. Einzelne kaputte Einträge werden verworfen, der Rest bleibt.
 * Einträge zu Wörtern, die es (noch) nicht gibt, bleiben erhalten.
 */
export function tryParseProgress(raw: string): Progress | undefined {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!isRecord(data) || data.version !== PROGRESS_VERSION || !isRecord(data.items)) return undefined;

  const progress = emptyProgress();
  for (const [key, value] of Object.entries(data.items)) {
    const parsed = parseItemProgress(value);
    if (parsed && isItemKey(key)) progress.items[key] = parsed;
  }
  progress.rewards = parseRewards(data.rewards);
  return progress;
}

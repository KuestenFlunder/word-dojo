/**
 * Belohnung: Sterne fürs Üben und die Tages-Serie. Sterne werden nur mehr, nie weniger.
 * Alle Funktionen sind rein. Tage sind Kalendertage in der Zeitzone des Geräts.
 */

/** Sterne für ein geschafftes Wort – gewusst oder nach dem Abschreiben (fürs Durchhalten). */
export const STARS_PER_WORD = 1;

/** Stand der Belohnungen. */
export interface Rewards {
  /** Gesammelte Sterne insgesamt. */
  stars: number;
  /** Tage in Folge geübt, Stand {@link lastDay}. Für die Anzeige {@link currentStreak} nehmen. */
  streak: number;
  /** Längste Serie bisher. */
  longestStreak: number;
  /** Letzter Übungstag als `YYYY-MM-DD`, `null` = noch nie geübt. */
  lastDay: string | null;
}

/** Stand ohne jede Übung. */
export function emptyRewards(): Rewards {
  return { stars: 0, streak: 0, longestStreak: 0, lastDay: null };
}

function key(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Kalendertag zu einem Zeitpunkt (ms seit Epoch) als `YYYY-MM-DD`, in Gerätezeit. */
export function dayKey(now: number): string {
  return key(new Date(now));
}

function previousDayKey(now: number): string {
  const date = new Date(now);
  // Über den Kalender statt minus 24 h: stimmt auch an Tagen mit Zeitumstellung.
  return key(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));
}

/** Legt Sterne dazu. Negative oder krumme Werte werden ignoriert – es gibt nie einen Abzug. */
export function addStars(rewards: Rewards, count: number): Rewards {
  if (!Number.isInteger(count) || count <= 0) return rewards;
  return { ...rewards, stars: rewards.stars + count };
}

/**
 * Vermerkt, dass zum Zeitpunkt `now` geübt wurde: erster Eintrag des Tages verlängert die
 * Serie (gestern geübt) oder beginnt sie neu (Lücke); weitere Einträge am selben Tag ändern nichts.
 */
export function recordPracticeDay(rewards: Rewards, now: number): Rewards {
  const today = dayKey(now);
  if (rewards.lastDay === today) return rewards;
  const streak = rewards.lastDay === previousDayKey(now) ? rewards.streak + 1 : 1;
  return { ...rewards, streak, longestStreak: Math.max(rewards.longestStreak, streak), lastDay: today };
}

/** True, wenn heute schon geübt wurde. */
export function practicedToday(rewards: Rewards, now: number): boolean {
  return rewards.lastDay === dayKey(now);
}

/**
 * Aktuelle Serie für die Anzeige: zählt, wenn heute oder gestern geübt wurde (heute ist
 * dann noch zu schaffen); nach einem ausgelassenen Tag 0.
 */
export function currentStreak(rewards: Rewards, now: number): number {
  if (rewards.lastDay === dayKey(now) || rewards.lastDay === previousDayKey(now)) return rewards.streak;
  return 0;
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** Liest gespeicherte Belohnungen robust; Unbrauchbares ergibt den leeren Stand. */
export function parseRewards(value: unknown): Rewards {
  if (typeof value !== 'object' || value === null) return emptyRewards();
  const { stars, streak, longestStreak, lastDay } = value as Record<string, unknown>;
  if (!isCount(stars) || !isCount(streak) || !isCount(longestStreak)) return emptyRewards();
  if (lastDay !== null && (typeof lastDay !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(lastDay))) return emptyRewards();
  return { stars, streak, longestStreak, lastDay };
}

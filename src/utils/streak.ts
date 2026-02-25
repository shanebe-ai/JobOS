import type { Application } from '../domain/application';

export interface StreakData {
    currentStreak: number;
    bestStreak: number;
    lastApplicationDate: string | null;
    isActiveToday: boolean;
}

/**
 * Extracts unique dates (normalized to midnight) when applications were submitted.
 * Uses appliedDate if available, otherwise falls back to lastActionDate.
 * Only counts applications with status='Applied' or beyond.
 */
export function getApplicationDates(applications: Application[]): Date[] {
    const appliedApps = applications.filter(app =>
        app.status !== 'Saved' && app.status !== 'Withdrawn'
    );

    const dateSet = new Set<string>();
    appliedApps.forEach(app => {
        const dateStr = app.appliedDate || app.lastActionDate;
        const date = new Date(dateStr);
        // Normalize to date string (YYYY-MM-DD) to dedupe same-day applications
        dateSet.add(date.toISOString().split('T')[0]);
    });

    return Array.from(dateSet)
        .map(d => new Date(d + 'T00:00:00'))
        .sort((a, b) => b.getTime() - a.getTime()); // Most recent first
}

/**
 * Calculates current streak: consecutive days ending with today or yesterday.
 * If the user hasn't applied today but applied yesterday, streak continues.
 * If they missed yesterday, streak resets to 0.
 */
export function calculateCurrentStreak(applications: Application[]): number {
    const dates = getApplicationDates(applications);
    if (dates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mostRecentDate = new Date(dates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);

    // Streak only counts if most recent activity is today or yesterday
    const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0; // Streak broken

    let streak = 1;
    let expectedDate = new Date(mostRecentDate);

    for (let i = 1; i < dates.length; i++) {
        expectedDate.setDate(expectedDate.getDate() - 1);
        const currentDate = new Date(dates[i]);
        currentDate.setHours(0, 0, 0, 0);

        if (currentDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else {
            break; // Gap found, streak ends
        }
    }

    return streak;
}

/**
 * Checks if the user has already applied today.
 */
export function hasAppliedToday(applications: Application[]): boolean {
    const today = new Date().toDateString();
    return applications.some(app => {
        if (app.status === 'Saved' || app.status === 'Withdrawn') return false;
        const appDate = new Date(app.appliedDate || app.lastActionDate).toDateString();
        return appDate === today;
    });
}

/**
 * Gets motivational message based on streak length.
 */
export function getStreakMessage(streak: number, appliedToday: boolean): string {
    if (streak === 0) {
        return appliedToday ? 'Streak started!' : 'Apply today to start a streak!';
    }
    if (!appliedToday) {
        return 'Apply today to keep your streak!';
    }
    if (streak >= 30) return 'Legendary consistency!';
    if (streak >= 14) return 'Two weeks strong!';
    if (streak >= 7) return 'One week streak!';
    if (streak >= 3) return 'Building momentum!';
    return 'Keep it going!';
}

/**
 * Gets the fire emoji display based on streak.
 * More fire for longer streaks.
 */
export function getStreakEmoji(streak: number): string {
    if (streak >= 30) return '\u{1F525}\u{1F525}\u{1F525}'; // Triple fire
    if (streak >= 7) return '\u{1F525}\u{1F525}';           // Double fire
    if (streak >= 1) return '\u{1F525}';                    // Single fire
    return '\u{2744}\u{FE0F}';                              // Snowflake (frozen/no streak)
}

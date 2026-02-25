import { describe, it, expect } from 'vitest';
import {
    calculateCurrentStreak,
    hasAppliedToday,
    getStreakMessage,
    getStreakEmoji,
    getApplicationDates
} from '../streak';
import type { Application } from '../../domain/application';

// Helper to create test applications
const createApp = (daysAgo: number, status: Application['status'] = 'Applied'): Application => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(12, 0, 0, 0); // Noon to avoid edge cases
    return {
        id: `app-${daysAgo}-${Math.random()}`,
        jobId: `job-${daysAgo}`,
        status,
        lastActionDate: date.toISOString(),
        notes: '',
        archived: false
    };
};

describe('Utils: Streak', () => {
    describe('getApplicationDates', () => {
        it('returns empty array for no applications', () => {
            expect(getApplicationDates([])).toEqual([]);
        });

        it('extracts dates from Applied applications', () => {
            const apps = [createApp(0), createApp(1)];
            const dates = getApplicationDates(apps);
            expect(dates.length).toBe(2);
        });

        it('ignores Saved applications', () => {
            const apps = [createApp(0, 'Applied'), createApp(1, 'Saved')];
            const dates = getApplicationDates(apps);
            expect(dates.length).toBe(1);
        });

        it('ignores Withdrawn applications', () => {
            const apps = [createApp(0, 'Applied'), createApp(1, 'Withdrawn')];
            const dates = getApplicationDates(apps);
            expect(dates.length).toBe(1);
        });

        it('includes Interviewing, Offer, Rejected statuses', () => {
            const apps = [
                createApp(0, 'Applied'),
                createApp(1, 'Interviewing'),
                createApp(2, 'Offer'),
                createApp(3, 'Rejected')
            ];
            const dates = getApplicationDates(apps);
            expect(dates.length).toBe(4);
        });

        it('deduplicates same-day applications', () => {
            const apps = [createApp(0), createApp(0), createApp(0)];
            const dates = getApplicationDates(apps);
            expect(dates.length).toBe(1);
        });

        it('returns dates sorted most recent first', () => {
            const apps = [createApp(2), createApp(0), createApp(1)];
            const dates = getApplicationDates(apps);
            expect(dates[0].getTime()).toBeGreaterThan(dates[1].getTime());
            expect(dates[1].getTime()).toBeGreaterThan(dates[2].getTime());
        });
    });

    describe('calculateCurrentStreak', () => {
        it('returns 0 for empty applications', () => {
            expect(calculateCurrentStreak([])).toBe(0);
        });

        it('returns 1 for single application today', () => {
            const apps = [createApp(0)];
            expect(calculateCurrentStreak(apps)).toBe(1);
        });

        it('returns 1 for single application yesterday', () => {
            const apps = [createApp(1)];
            expect(calculateCurrentStreak(apps)).toBe(1);
        });

        it('returns 0 if last application was 2+ days ago', () => {
            const apps = [createApp(2)];
            expect(calculateCurrentStreak(apps)).toBe(0);
        });

        it('counts consecutive days correctly', () => {
            const apps = [createApp(0), createApp(1), createApp(2)];
            expect(calculateCurrentStreak(apps)).toBe(3);
        });

        it('stops counting at gaps', () => {
            const apps = [createApp(0), createApp(1), createApp(3)]; // Gap at day 2
            expect(calculateCurrentStreak(apps)).toBe(2);
        });

        it('ignores Saved applications', () => {
            const apps = [createApp(0, 'Applied'), createApp(1, 'Saved')];
            expect(calculateCurrentStreak(apps)).toBe(1);
        });

        it('counts multiple applications on same day as 1', () => {
            const apps = [createApp(0), createApp(0), createApp(1)];
            expect(calculateCurrentStreak(apps)).toBe(2);
        });

        it('handles long streaks', () => {
            const apps = Array.from({ length: 30 }, (_, i) => createApp(i));
            expect(calculateCurrentStreak(apps)).toBe(30);
        });

        it('breaks streak correctly with old gap', () => {
            // Streak of 3 days, then gap, then old app
            const apps = [createApp(0), createApp(1), createApp(2), createApp(5)];
            expect(calculateCurrentStreak(apps)).toBe(3);
        });
    });

    describe('hasAppliedToday', () => {
        it('returns false for empty applications', () => {
            expect(hasAppliedToday([])).toBe(false);
        });

        it('returns true if applied today', () => {
            const apps = [createApp(0)];
            expect(hasAppliedToday(apps)).toBe(true);
        });

        it('returns false if last application was yesterday', () => {
            const apps = [createApp(1)];
            expect(hasAppliedToday(apps)).toBe(false);
        });

        it('returns false for Saved status today', () => {
            const apps = [createApp(0, 'Saved')];
            expect(hasAppliedToday(apps)).toBe(false);
        });

        it('returns true for Interviewing status updated today', () => {
            const apps = [createApp(0, 'Interviewing')];
            expect(hasAppliedToday(apps)).toBe(true);
        });
    });

    describe('getStreakMessage', () => {
        it('prompts to start streak when at 0 and not applied today', () => {
            expect(getStreakMessage(0, false)).toBe('Apply today to start a streak!');
        });

        it('celebrates streak start', () => {
            expect(getStreakMessage(0, true)).toBe('Streak started!');
        });

        it('encourages maintaining streak when not applied today', () => {
            expect(getStreakMessage(5, false)).toBe('Apply today to keep your streak!');
        });

        it('shows generic encouragement for short streaks', () => {
            expect(getStreakMessage(1, true)).toBe('Keep it going!');
            expect(getStreakMessage(2, true)).toBe('Keep it going!');
        });

        it('shows momentum message at 3 days', () => {
            expect(getStreakMessage(3, true)).toBe('Building momentum!');
        });

        it('shows week milestone at 7 days', () => {
            expect(getStreakMessage(7, true)).toBe('One week streak!');
        });

        it('shows two week milestone at 14 days', () => {
            expect(getStreakMessage(14, true)).toBe('Two weeks strong!');
        });

        it('shows legendary message at 30 days', () => {
            expect(getStreakMessage(30, true)).toBe('Legendary consistency!');
        });
    });

    describe('getStreakEmoji', () => {
        it('returns snowflake for no streak', () => {
            expect(getStreakEmoji(0)).toBe('\u{2744}\u{FE0F}');
        });

        it('returns single fire for short streaks (1-6 days)', () => {
            expect(getStreakEmoji(1)).toBe('\u{1F525}');
            expect(getStreakEmoji(6)).toBe('\u{1F525}');
        });

        it('returns double fire for week+ streaks (7-29 days)', () => {
            expect(getStreakEmoji(7)).toBe('\u{1F525}\u{1F525}');
            expect(getStreakEmoji(29)).toBe('\u{1F525}\u{1F525}');
        });

        it('returns triple fire for month+ streaks (30+ days)', () => {
            expect(getStreakEmoji(30)).toBe('\u{1F525}\u{1F525}\u{1F525}');
            expect(getStreakEmoji(100)).toBe('\u{1F525}\u{1F525}\u{1F525}');
        });
    });
});

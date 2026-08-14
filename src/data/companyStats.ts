/**
 * Company stats — SINGLE SOURCE OF TRUTH for every number shown on the site.
 *
 * RULE: only put numbers here that are literally true and that you could show
 * a screenshot of if a renter asked. No round marketing numbers, no invented
 * review counts. If a number isn't real yet, leave it null — the site
 * automatically falls back to a claim that's true at any size.
 *
 * To switch the star badge + stat tiles over to real figures, fill in
 * `tripsCompleted` and `averageRating` below from your actual rental history
 * (Turo dashboard + private rentals) and set `yearStarted`. Nothing else in
 * the codebase needs to change — the footer badge and the About page stats
 * both read from here.
 */

interface RealStats {
  /** Total completed trips across Turo + private rentals. null = don't show. */
  tripsCompleted: number | null;
  /** Average star rating from real reviews, e.g. 4.94. null = don't show. */
  averageRating: number | null;
  /** First year you rented a car out. null = don't show. */
  yearStarted: number | null;
}

export const REAL_STATS: RealStats = {
  tripsCompleted: null,
  averageRating: null,
  yearStarted: null,
};

/** Primary market. */
export const HOME_CITY = 'Miami';
export const SERVICE_AREA = 'Miami & South Florida';

const { tripsCompleted, averageRating, yearStarted } = REAL_STATS;

/**
 * Footer trust line. Uses the real numbers when they exist, otherwise a
 * statement that is true regardless of fleet size.
 */
export const TRUST_LINE =
  tripsCompleted !== null && averageRating !== null
    ? `${averageRating.toFixed(2)}★ across ${tripsCompleted.toLocaleString()}+ completed rentals`
    : 'Every renter personally vetted · Every car personally inspected';

/**
 * The four stat tiles on the About page. Only verifiable claims ship by
 * default; real numbers replace them automatically once filled in above.
 */
export const ABOUT_STATS: { value: string; label: string }[] = [
  yearStarted !== null
    ? { value: String(yearStarted), label: 'Renting since' }
    : { value: '100%', label: 'Locally owned' },
  tripsCompleted !== null
    ? { value: `${tripsCompleted.toLocaleString()}+`, label: 'Rentals completed' }
    : { value: '1:1', label: 'Every renter vetted' },
  averageRating !== null
    ? { value: `${averageRating.toFixed(2)}★`, label: 'Average renter rating' }
    : { value: '24/7', label: 'Roadside support' },
  { value: HOME_CITY, label: 'Based in Florida' },
];

import { calculateXP, ReviewResult } from '../sm2'; // Adjust path as necessary

describe('SM-2 Utilities', () => {
  describe('calculateXP', () => {
    it('should return 0 XP for FORGOT', () => {
      expect(calculateXP(ReviewResult.FORGOT)).toBe(0);
    });

    it('should return 1 XP for HARD', () => {
      expect(calculateXP(ReviewResult.HARD)).toBe(1);
    });

    it('should return 3 XP for GOOD', () => {
      expect(calculateXP(ReviewResult.GOOD)).toBe(3);
    });

    it('should return 5 XP for EASY', () => {
      expect(calculateXP(ReviewResult.EASY)).toBe(5);
    });

    // Test with a numeric value if ReviewResult can also be number
    it('should handle numeric ReviewResult values correctly', () => {
      expect(calculateXP(0 as ReviewResult)).toBe(0); // FORGOT
      expect(calculateXP(1 as ReviewResult)).toBe(1); // HARD
      expect(calculateXP(2 as ReviewResult)).toBe(3); // GOOD
      expect(calculateXP(3 as ReviewResult)).toBe(5); // EASY
    });

    it('should return 0 for undefined or unexpected result values', () => {
      // Assuming the function is robust and returns 0 for unexpected inputs
      expect(calculateXP(undefined as any)).toBe(0);
      expect(calculateXP(5 as ReviewResult)).toBe(0); // Assuming 5 is not a valid ReviewResult for XP
    });
  });

  // Add more describe blocks for other functions in sm2.ts like calculateNextInterval
  // For calculateNextInterval, you would mock Date.now() and test various card states and review results
}); 
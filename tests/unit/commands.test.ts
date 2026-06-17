/**
 * Workitem commands unit tests
 */

import { isValidWorkitemId } from '../../src/utils/validators';

describe('Workitem Commands', () => {
  describe('createWorkitemCommand', () => {
    it('should require space ID in non-interactive mode', () => {
      // This would require mocking the command execution
      // For now, we test the validator
      expect(isValidWorkitemId('PROJ-123')).toBe(true);
    });
  });

  describe('updateWorkitemCommand', () => {
    it('should validate workitem ID format', () => {
      expect(isValidWorkitemId('PROJ-123')).toBe(true);
      expect(isValidWorkitemId('ABC-456')).toBe(true);
      expect(isValidWorkitemId('invalid')).toBe(false);
      expect(isValidWorkitemId('PROJ')).toBe(false);
      expect(isValidWorkitemId('123')).toBe(false);
    });
  });
});

describe('Comment Commands', () => {
  describe('addCommentCommand', () => {
    it('should validate workitem ID', () => {
      expect(isValidWorkitemId('PROJ-123')).toBe(true);
      expect(isValidWorkitemId('invalid-id')).toBe(false);
    });
  });

  describe('listCommentsCommand', () => {
    it('should accept valid workitem IDs', () => {
      const validIds = ['PROJ-1', 'ABC-999', 'TEST-12345'];
      validIds.forEach((id) => {
        expect(isValidWorkitemId(id)).toBe(true);
      });
    });

    it('should reject invalid workitem IDs', () => {
      const invalidIds = ['proj-1', 'PROJ', '123', 'PROJ-', '-123'];
      invalidIds.forEach((id) => {
        expect(isValidWorkitemId(id)).toBe(false);
      });
    });
  });
});

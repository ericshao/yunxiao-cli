/**
 * Validators 单元测试
 */

import {
  isValidWorkitemId,
  isValidOrganizationId,
  isValidProjectId,
  isValidOutputFormat,
  isValidPage,
  isValidPerPage,
} from '../../src/utils/validators';

describe('Validators', () => {
  describe('isValidWorkitemId', () => {
    it('should validate correct workitem IDs', () => {
      expect(isValidWorkitemId('CLOD-1013')).toBe(true);
      expect(isValidWorkitemId('ABC-123')).toBe(true);
      expect(isValidWorkitemId('PROJECT-999')).toBe(true);
    });

    it('should reject invalid workitem IDs', () => {
      expect(isValidWorkitemId('clod-1013')).toBe(false); // lowercase
      expect(isValidWorkitemId('CLOD1013')).toBe(false); // missing hyphen
      expect(isValidWorkitemId('CLOD-')).toBe(false); // missing number
      expect(isValidWorkitemId('123-CLOD')).toBe(false); // reversed
      expect(isValidWorkitemId('')).toBe(false);
    });
  });

  describe('isValidOrganizationId', () => {
    it('should validate organization IDs', () => {
      expect(isValidOrganizationId('org123')).toBe(true);
      expect(isValidOrganizationId('a'.repeat(64))).toBe(true);
    });

    it('should reject invalid organization IDs', () => {
      expect(isValidOrganizationId('')).toBe(false);
      expect(isValidOrganizationId('a'.repeat(65))).toBe(false);
    });
  });

  describe('isValidOutputFormat', () => {
    it('should validate output formats', () => {
      expect(isValidOutputFormat('table')).toBe(true);
      expect(isValidOutputFormat('json')).toBe(true);
      expect(isValidOutputFormat('csv')).toBe(true);
      expect(isValidOutputFormat('markdown')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidOutputFormat('xml')).toBe(false);
      expect(isValidOutputFormat('html')).toBe(false);
      expect(isValidOutputFormat('')).toBe(false);
    });
  });

  describe('isValidPage', () => {
    it('should validate page numbers', () => {
      expect(isValidPage(1)).toBe(true);
      expect(isValidPage(100)).toBe(true);
    });

    it('should reject invalid page numbers', () => {
      expect(isValidPage(0)).toBe(false);
      expect(isValidPage(-1)).toBe(false);
      expect(isValidPage(1.5)).toBe(false);
    });
  });

  describe('isValidPerPage', () => {
    it('should validate per-page values', () => {
      expect(isValidPerPage(1)).toBe(true);
      expect(isValidPerPage(50)).toBe(true);
      expect(isValidPerPage(100)).toBe(true);
    });

    it('should reject invalid per-page values', () => {
      expect(isValidPerPage(0)).toBe(false);
      expect(isValidPerPage(-1)).toBe(false);
      expect(isValidPerPage(101)).toBe(false);
      expect(isValidPerPage(1.5)).toBe(false);
    });
  });
});

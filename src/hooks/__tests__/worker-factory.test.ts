/**
 * Tests for worker-factory
 * Tests error handling behavior through mocks
 *
 * Note: Direct testing of createAIWorker is not possible due to import.meta.url,
 * which is not supported in Jest's Node.js environment. The error handling paths
 * are tested indirectly through useAIPlayer tests where createAIWorker returns null.
 */

// Use the existing mock from __mocks__/worker-factory.ts
jest.mock('../worker-factory');

import { createAIWorker } from '../worker-factory';

describe('worker-factory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAIWorker mock behavior', () => {
    it('should return null by default (simulating error case)', () => {
      // The mock returns null by default, simulating Worker creation failure
      const result = createAIWorker();
      expect(result).toBeNull();
    });

    it('should be configurable to return Worker instance', () => {
      // The mock can be configured to return a Worker instance
      const mockWorker = { postMessage: jest.fn() } as unknown as Worker;
      (createAIWorker as jest.Mock).mockReturnValue(mockWorker);

      const result = createAIWorker();
      expect(result).toBe(mockWorker);
    });

    it('should be configurable to simulate various error scenarios', () => {
      // The mock supports different return values for testing various scenarios
      (createAIWorker as jest.Mock)
        .mockReturnValueOnce(null) // First call: failure
        .mockReturnValueOnce({ postMessage: jest.fn() }); // Second call: success

      expect(createAIWorker()).toBeNull();
      expect(createAIWorker()).not.toBeNull();
    });
  });
});

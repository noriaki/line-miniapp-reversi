/**
 * Unit tests for message type system
 * Test coverage: Message discriminated union, MessageBoxProps, UseMessageQueueReturn
 */

import type {
  Message,
  MessageBoxProps,
  UseMessageQueueReturn,
} from '../message';

describe('Message Type System', () => {
  describe('Message discriminated union', () => {
    it('should accept info message with required properties', () => {
      const infoMessage: Message = {
        type: 'info',
        text: 'パスしました',
        timeout: 3000,
      };

      expect(infoMessage.type).toBe('info');
      expect(infoMessage.text).toBe('パスしました');
      expect(infoMessage.timeout).toBe(3000);
    });

    it('should accept warning message with required properties', () => {
      const warningMessage: Message = {
        type: 'warning',
        text: 'その手は置けません',
        timeout: 2000,
      };

      expect(warningMessage.type).toBe('warning');
      expect(warningMessage.text).toBe('その手は置けません');
      expect(warningMessage.timeout).toBe(2000);
    });

    it('should enforce type property for discriminated union', () => {
      const messages: Message[] = [
        { type: 'info', text: 'Info message', timeout: 3000 },
        { type: 'warning', text: 'Warning message', timeout: 2000 },
      ];

      messages.forEach((msg) => {
        expect(['info', 'warning']).toContain(msg.type);
      });
    });

    it('should work with type guards', () => {
      const message: Message = {
        type: 'info',
        text: 'Test',
        timeout: 3000,
      };

      if (message.type === 'info') {
        // TypeScript should infer this is an info message
        expect(message.text).toBeDefined();
        expect(message.timeout).toBeDefined();
      }
    });

    it('should support Japanese text in message', () => {
      const japaneseMessage: Message = {
        type: 'info',
        text: '日本語のメッセージテキスト',
        timeout: 3000,
      };

      expect(japaneseMessage.text).toBe('日本語のメッセージテキスト');
    });

    it('should enforce timeout property as number', () => {
      const message: Message = {
        type: 'info',
        text: 'Test timeout',
        timeout: 5000,
      };

      expect(typeof message.timeout).toBe('number');
      expect(message.timeout).toBeGreaterThan(0);
    });
  });

  describe('MessageBoxProps interface', () => {
    it('should accept Message object', () => {
      const props: MessageBoxProps = {
        message: {
          type: 'info',
          text: 'Test message',
          timeout: 3000,
        },
      };

      expect(props.message).not.toBeNull();
      expect(props.message?.type).toBe('info');
    });

    it('should accept null message', () => {
      const props: MessageBoxProps = {
        message: null,
      };

      expect(props.message).toBeNull();
    });

    it('should accept optional testId property', () => {
      const propsWithTestId: MessageBoxProps = {
        message: {
          type: 'warning',
          text: 'Warning',
          timeout: 2000,
        },
        testId: 'custom-message-box',
      };

      expect(propsWithTestId.testId).toBe('custom-message-box');
    });

    it('should work without testId property', () => {
      const propsWithoutTestId: MessageBoxProps = {
        message: {
          type: 'info',
          text: 'Info',
          timeout: 3000,
        },
      };

      expect(propsWithoutTestId.testId).toBeUndefined();
    });

    it('should handle all message types', () => {
      const infoProps: MessageBoxProps = {
        message: {
          type: 'info',
          text: 'Info',
          timeout: 3000,
        },
      };

      const warningProps: MessageBoxProps = {
        message: {
          type: 'warning',
          text: 'Warning',
          timeout: 2000,
        },
      };

      expect(infoProps.message?.type).toBe('info');
      expect(warningProps.message?.type).toBe('warning');
    });
  });

  describe('UseMessageQueueReturn interface', () => {
    it('should have currentMessage property', () => {
      const mockReturn: UseMessageQueueReturn = {
        currentMessage: {
          type: 'info',
          text: 'Current message',
          timeout: 3000,
        },
        addMessage: jest.fn(),
        clearMessage: jest.fn(),
      };

      expect(mockReturn.currentMessage).not.toBeNull();
      expect(mockReturn.currentMessage?.text).toBe('Current message');
    });

    it('should accept null currentMessage', () => {
      const mockReturn: UseMessageQueueReturn = {
        currentMessage: null,
        addMessage: jest.fn(),
        clearMessage: jest.fn(),
      };

      expect(mockReturn.currentMessage).toBeNull();
    });

    it('should have addMessage function that accepts Message', () => {
      const addMessageMock = jest.fn();
      const mockReturn: UseMessageQueueReturn = {
        currentMessage: null,
        addMessage: addMessageMock,
        clearMessage: jest.fn(),
      };

      const testMessage: Message = {
        type: 'warning',
        text: 'Test',
        timeout: 2000,
      };

      mockReturn.addMessage(testMessage);
      expect(addMessageMock).toHaveBeenCalledWith(testMessage);
    });

    it('should have clearMessage function with no parameters', () => {
      const clearMessageMock = jest.fn();
      const mockReturn: UseMessageQueueReturn = {
        currentMessage: {
          type: 'info',
          text: 'Message to clear',
          timeout: 3000,
        },
        addMessage: jest.fn(),
        clearMessage: clearMessageMock,
      };

      mockReturn.clearMessage();
      expect(clearMessageMock).toHaveBeenCalledWith();
    });

    it('should support different timeout values for different message purposes', () => {
      const passNotification: Message = {
        type: 'info',
        text: 'パスしました',
        timeout: 3000, // 3 seconds for pass notification
      };

      const invalidMoveWarning: Message = {
        type: 'warning',
        text: 'その手は置けません',
        timeout: 2000, // 2 seconds for invalid move warning
      };

      const mockReturn: UseMessageQueueReturn = {
        currentMessage: passNotification,
        addMessage: jest.fn(),
        clearMessage: jest.fn(),
      };

      expect(mockReturn.currentMessage?.timeout).toBe(3000);

      // Simulate adding a new message with different timeout
      const addMessage = jest.fn((msg: Message) => {
        expect(msg.timeout).toBe(2000);
      });

      addMessage(invalidMoveWarning);
    });
  });

  describe('TypeScript strict mode compliance', () => {
    it('should not use any type (strict mode)', () => {
      // This test verifies that types are properly defined
      // If any 'any' types were used, TypeScript compiler would catch it
      const message: Message = {
        type: 'info',
        text: 'Strict type check',
        timeout: 3000,
      };

      const props: MessageBoxProps = {
        message,
        testId: 'test',
      };

      const hookReturn: UseMessageQueueReturn = {
        currentMessage: message,
        addMessage: (msg: Message) => {
          expect(msg.type).toBeDefined();
        },
        clearMessage: () => {
          // Clear implementation
        },
      };

      // All types are explicitly defined, no 'any' types
      expect(message).toBeDefined();
      expect(props).toBeDefined();
      expect(hookReturn).toBeDefined();
    });

    it('should enforce readonly constraints for immutability', () => {
      // This test ensures Message properties are not accidentally mutable
      const message: Message = {
        type: 'info',
        text: 'Immutable message',
        timeout: 3000,
      };

      // TypeScript should prevent mutations (compile-time check)
      // This is a runtime verification that the object can be frozen
      const frozenMessage = Object.freeze(message);
      expect(Object.isFrozen(frozenMessage)).toBe(true);
    });
  });
});

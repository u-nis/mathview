// Event system for MathView cursor control
export enum MathViewEventType {
  CURSOR_PLACE_AT_START = 'cursor-place-at-start',
  CURSOR_PLACE_AT_END = 'cursor-place-at-end',
  CURSOR_PLACE_AFTER_NODE = 'cursor-place-after-node',
  CURSOR_PLACE_BEFORE_NODE = 'cursor-place-before-node',
  NAVIGATE_LEFT = 'math-navigate-left',
  NAVIGATE_RIGHT = 'math-navigate-right',
  NODE_CREATED = 'node-created',
  NODE_SELECTED = 'node-selected',
}

export interface MathViewEvent {
  type: MathViewEventType;
  nodeKey?: string;
  data?: any;
}

// Event bus for MathView components
class MathViewEventBus {
  private listeners: Map<MathViewEventType, Set<(event: MathViewEvent) => void>> = new Map();

  subscribe(eventType: MathViewEventType, callback: (event: MathViewEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    const eventListeners = this.listeners.get(eventType)!;
    eventListeners.add(callback);

    // Return unsubscribe function
    return () => {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  publish(event: MathViewEvent): void {
    const eventListeners = this.listeners.get(event.type);
    if (!eventListeners || eventListeners.size === 0) return;
    // Copy to snapshot so listeners can unsubscribe safely during dispatch
    const snapshot = Array.from(eventListeners);
    for (const callback of snapshot) {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in MathView event listener:', error);
      }
    }
  }

  // Convenience methods for common events
  publishCursorPlaceAtEnd(nodeKey: string): void {
    this.publish({
      type: MathViewEventType.CURSOR_PLACE_AT_END,
      nodeKey,
    });
  }

  publishCursorPlaceAtStart(nodeKey: string): void {
    this.publish({
      type: MathViewEventType.CURSOR_PLACE_AT_START,
      nodeKey,
    });
  }

  publishNodeCreated(nodeKey: string): void {
    this.publish({
      type: MathViewEventType.NODE_CREATED,
      nodeKey,
    });
  }

  publishNodeSelected(nodeKey: string, direction?: 'left' | 'right'): void {
    this.publish({
      type: MathViewEventType.NODE_SELECTED,
      nodeKey,
      data: { direction },
    });
  }
}

// Global event bus instance
export const mathViewEventBus = new MathViewEventBus();

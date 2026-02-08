const BASEURL =  'https://cloud.cocobase.buzz'
/**
 * Player information in a game room
 */
export interface Player {
  id: string;
  name?: string;
  [key: string]: any;
}

/**
 * Room information from room discovery
 */
export interface RoomInfo {
  room_id: string;
  player_count: number;
  max_players?: number;
  metadata?: Record<string, any>;
  [key: string]: any;
}

/**
 * Room discovery response
 */
export interface RoomListResponse {
  rooms: RoomInfo[];
  total: number;
}

/**
 * Game event types
 */
export type GameEventType =
  | "connected"
  | "player_joined"
  | "player_left"
  | "state"
  | "message"
  | "error"
  | "disconnected"
  | string;

/**
 * Game event callback
 */
export type GameEventCallback<T = any> = (data: T) => void;

/**
 * Options for connecting to a game
 */
export interface GameConnectOptions {
  /** Room ID to join */
  roomId: string;
  /** JWT token for authentication (optional) */
  token?: string;
  /** Additional data to send on connect */
  metadata?: Record<string, any>;
}

/**
 * GameClient - Easy-to-use multiplayer game client
 *
 * @example
 * ```typescript
 * const game = db.realtime.game('my-game-function');
 *
 * // Set up event handlers
 * game.on('connected', (data) => {
 *   console.log('Connected! My player ID:', data.your_id);
 * });
 *
 * game.on('player_joined', (data) => {
 *   console.log('Player joined:', data.player_id);
 * });
 *
 * game.on('state', (data) => {
 *   // Update game state
 *   renderPlayers(data.players);
 * });
 *
 * // Connect to a room
 * await game.connect({ roomId: 'game-room-1' });
 *
 * // Send actions
 * game.send({ action: 'move', x: 100, y: 200 });
 *
 * // Disconnect when done
 * game.disconnect();
 * ```
 */
export class GameClient {
  private projectId: string;
  private functionName: string;
  private baseURL: string;
  private ws: WebSocket | null = null;
  private token?: string;
  private listeners: Map<string, GameEventCallback[]> = new Map();
  private reconnectEnabled = true;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private currentReconnectDelay = 1000;
  private reconnectTimeout?: ReturnType<typeof setTimeout>;
  private lastConnectOptions?: GameConnectOptions;
  private pingInterval?: ReturnType<typeof setInterval>;
  private _isConnected = false;
  private _playerId?: string;

  constructor(projectId: string, functionName: string, token?: string) {
    this.projectId = projectId;
    this.functionName = functionName;
    this.token = token;
    this.baseURL = BASEURL.replace(/^http/, "ws");
  }

  /**
   * Whether the client is currently connected
   */
  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * The current player's ID (available after connection)
   */
  get playerId(): string | undefined {
    return this._playerId;
  }

  /**
   * Connect to a game room
   *
   * @param options - Connection options
   * @returns Promise that resolves when connected
   *
   * @example
   * ```typescript
   * await game.connect({ roomId: 'lobby' });
   *
   * // With authentication
   * await game.connect({
   *   roomId: 'private-game',
   *   token: userJwtToken
   * });
   *
   * // With metadata
   * await game.connect({
   *   roomId: 'game-1',
   *   metadata: { playerName: 'John', team: 'red' }
   * });
   * ```
   */
  connect(options: GameConnectOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.lastConnectOptions = options;
      const authToken = options.token || this.token;

      // Build WebSocket URL
      let wsUrl = `${this.baseURL}/ws/${this.projectId}/${this.functionName}`;
      if (authToken) {
        wsUrl += `?token=${encodeURIComponent(authToken)}`;
      }

      try {
        this.ws = new WebSocket(wsUrl);
      } catch (err) {
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        this.currentReconnectDelay = this.reconnectDelay;

        // Send initial message with room_id and metadata
        const initMessage: Record<string, any> = {
          room_id: options.roomId,
        };
        if (options.metadata) {
          Object.assign(initMessage, options.metadata);
        }
        this.ws?.send(JSON.stringify(initMessage));

        // Start ping interval
        this.pingInterval = globalThis.setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle pong silently
          if (data.type === "pong") return;

          // Extract event type from various possible fields
          const eventType = data.type || data.event || "message";

          // Handle connection confirmation
          if (
            eventType === "connected" ||
            eventType === "welcome" ||
            data.your_id
          ) {
            this._isConnected = true;
            if (data.your_id) {
              this._playerId = data.your_id;
            }
            this.emit("connected", data);
            resolve();
            return;
          }

          // Handle errors
          if (eventType === "error" || data.error) {
            this.emit("error", data);
            if (!this._isConnected) {
              reject(new Error(data.error || data.message || "Connection error"));
            }
            return;
          }

          // Emit the event
          this.emit(eventType, data);
        } catch (err) {
          this.emit("error", { error: err });
        }
      };

      this.ws.onclose = (event) => {
        this._isConnected = false;
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = undefined;
        }

        this.emit("disconnected", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        // Auto-reconnect if enabled and not a clean close
        if (this.reconnectEnabled && !event.wasClean && this.lastConnectOptions) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        this.emit("error", { error: err });
        if (!this._isConnected) {
          reject(new Error("WebSocket connection failed"));
        }
      };

      // Timeout for initial connection
      setTimeout(() => {
        if (!this._isConnected) {
          this.ws?.close();
          reject(new Error("Connection timeout"));
        }
      }, 10000);
    });
  }

  /**
   * Send a message/action to the game server
   *
   * @param data - Data to send (will be JSON serialized)
   *
   * @example
   * ```typescript
   * // Send a move action
   * game.send({ action: 'move', x: 100, y: 200 });
   *
   * // Send a chat message
   * game.send({ action: 'chat', message: 'Hello!' });
   *
   * // Send any game action
   * game.send({ action: 'shoot', angle: 45, power: 80 });
   * ```
   */
  send(data: Record<string, any>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected to game server");
    }
    this.ws.send(JSON.stringify(data));
  }

  /**
   * Register an event listener
   *
   * @param event - Event type to listen for
   * @param callback - Callback function
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * // Listen for player joining
   * const unsub = game.on('player_joined', (data) => {
   *   console.log('Player joined:', data.player_id);
   * });
   *
   * // Later, unsubscribe
   * unsub();
   *
   * // Common events:
   * game.on('connected', (data) => { ... });
   * game.on('player_joined', (data) => { ... });
   * game.on('player_left', (data) => { ... });
   * game.on('state', (data) => { ... });
   * game.on('tick', (data) => { ... });
   * game.on('error', (data) => { ... });
   * game.on('disconnected', (data) => { ... });
   * ```
   */
  on<T = any>(event: GameEventType, callback: GameEventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback as GameEventCallback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback as GameEventCallback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Register a one-time event listener
   *
   * @param event - Event type to listen for
   * @param callback - Callback function (called once then removed)
   *
   * @example
   * ```typescript
   * game.once('connected', (data) => {
   *   console.log('Connected with ID:', data.your_id);
   * });
   * ```
   */
  once<T = any>(event: GameEventType, callback: GameEventCallback<T>): void {
    const wrapper: GameEventCallback<T> = (data) => {
      this.off(event, wrapper as GameEventCallback);
      callback(data);
    };
    this.on(event, wrapper);
  }

  /**
   * Remove an event listener
   *
   * @param event - Event type
   * @param callback - Callback to remove
   */
  off(event: GameEventType, callback: GameEventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Remove all listeners for an event (or all events)
   *
   * @param event - Optional event type. If not provided, removes all listeners.
   */
  removeAllListeners(event?: GameEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Disconnect from the game server
   *
   * @param disableReconnect - If true, prevents auto-reconnect
   */
  disconnect(disableReconnect = true): void {
    if (disableReconnect) {
      this.reconnectEnabled = false;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
    this._isConnected = false;
    this._playerId = undefined;
  }

  /**
   * Enable or disable auto-reconnect
   */
  setAutoReconnect(enabled: boolean): void {
    this.reconnectEnabled = enabled;
    if (!enabled && this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in ${event} handler:`, err);
        }
      });
    }

    // Also emit to wildcard listeners
    const wildcardCallbacks = this.listeners.get("*");
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((cb) => {
        try {
          cb({ event, data });
        } catch (err) {
          console.error("Error in wildcard handler:", err);
        }
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = undefined;
      if (this.lastConnectOptions && this.reconnectEnabled) {
        try {
          await this.connect(this.lastConnectOptions);
        } catch {
          // Exponential backoff
          this.currentReconnectDelay = Math.min(
            this.currentReconnectDelay * 2,
            this.maxReconnectDelay
          );
          this.scheduleReconnect();
        }
      }
    }, this.currentReconnectDelay);
  }
}

/**
 * List available game rooms for a function
 *
 * @param projectId - Project ID
 * @param apiKey - API key (optional)
 * @param publicOnly - Only list public rooms (default: true)
 * @returns Promise resolving to room list
 *
 * @example
 * ```typescript
 * const { rooms, total } = await listGameRooms('my-project');
 * rooms.forEach(room => {
 *   console.log(`${room.room_id}: ${room.player_count}/${room.max_players} players`);
 * });
 * ```
 */
export async function listGameRooms(
  projectId: string,
  apiKey?: string,
  publicOnly = true
): Promise<RoomListResponse> {
  const url = `${BASEURL}/ws/rooms/${projectId}?public_only=${publicOnly}`;
  const res = await fetch(url, {
    headers: apiKey ? { "X-API-Key": apiKey } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list game rooms: ${text}`);
  }

  return res.json();
}

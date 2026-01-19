# Multiplayer Game Client

Build real-time multiplayer games with WebSocket cloud functions.

## Quick Start

```typescript
const db = new Cocobase({ apiKey: 'your-key', projectId: 'your-project' });

// Create game client
const game = db.realtime.game('my-game-function');

// Set up event handlers
game.on('connected', (data) => {
  console.log('Connected! My ID:', data.your_id);
});

game.on('player_joined', (data) => {
  console.log('Player joined:', data.player_id);
});

game.on('player_left', (data) => {
  console.log('Player left:', data.player_id);
});

game.on('state', (data) => {
  // Game state update from server
  renderPlayers(data.players);
});

// Connect to a room
await game.connect({ roomId: 'game-room-1' });

// Send actions to server
game.send({ action: 'move', x: 100, y: 200 });

// Disconnect when done
game.disconnect();
```

## Connection Options

```typescript
// Basic connection
await game.connect({ roomId: 'lobby' });

// With authentication
await game.connect({
  roomId: 'private-game',
  token: userJwtToken
});

// With player metadata
await game.connect({
  roomId: 'game-1',
  metadata: {
    playerName: 'John',
    team: 'red',
    avatar: 'warrior'
  }
});
```

## Event Handling

### Common Events

| Event | Description | Data |
|-------|-------------|------|
| `connected` | Successfully joined room | `{ your_id, ... }` |
| `player_joined` | Another player joined | `{ player_id, ... }` |
| `player_left` | A player disconnected | `{ player_id, ... }` |
| `state` | Game state update | `{ players, ... }` |
| `tick` | Game loop tick | `{ players, tick_count, ... }` |
| `error` | Error occurred | `{ error, message }` |
| `disconnected` | Connection closed | `{ code, reason, wasClean }` |

### Registering Listeners

```typescript
// Standard listener
game.on('player_joined', (data) => {
  console.log('Player joined:', data);
});

// One-time listener
game.once('connected', (data) => {
  console.log('First connection:', data.your_id);
});

// Wildcard listener (for debugging)
game.on('*', ({ event, data }) => {
  console.log(`[${event}]`, data);
});

// Unsubscribe
const unsub = game.on('state', handleState);
unsub(); // Remove listener

// Or manually
game.off('state', handleState);

// Remove all listeners
game.removeAllListeners('state');  // For one event
game.removeAllListeners();          // For all events
```

## Sending Messages

```typescript
// Movement
game.send({ action: 'move', x: 100, y: 200 });

// Chat
game.send({ action: 'chat', message: 'Hello everyone!' });

// Game actions
game.send({ action: 'shoot', angle: 45, power: 80 });
game.send({ action: 'jump' });
game.send({ action: 'use_item', item_id: 'health_potion' });
```

## Connection State

```typescript
// Check if connected
if (game.isConnected) {
  game.send({ action: 'move', x: 10, y: 20 });
}

// Get player ID
console.log('My ID:', game.playerId);
```

## Auto-Reconnect

Auto-reconnect is enabled by default with exponential backoff:

```typescript
// Disable auto-reconnect
game.setAutoReconnect(false);

// Enable auto-reconnect
game.setAutoReconnect(true);

// Disconnect without reconnecting
game.disconnect(true);  // disableReconnect = true

// Disconnect but allow reconnect
game.disconnect(false);
```

## Room Discovery

List available public game rooms:

```typescript
const { rooms, total } = await db.realtime.listGameRooms();

rooms.forEach(room => {
  console.log(`${room.room_id}: ${room.player_count}/${room.max_players} players`);
  console.log('  Status:', room.metadata?.status);
  console.log('  Game mode:', room.metadata?.game_mode);
});

// Only public rooms (default)
const publicRooms = await db.realtime.listGameRooms(true);

// All rooms (if permitted)
const allRooms = await db.realtime.listGameRooms(false);
```

## Complete Game Example

```typescript
class SimpleGame {
  private game: GameClient;
  private players: Map<string, Player> = new Map();
  private myId?: string;

  constructor(db: Cocobase) {
    this.game = db.realtime.game('simple-game');
    this.setupHandlers();
  }

  private setupHandlers() {
    this.game.on('connected', (data) => {
      this.myId = data.your_id;
      console.log('Joined as:', this.myId);
    });

    this.game.on('player_joined', (data) => {
      this.players.set(data.player_id, {
        id: data.player_id,
        x: 0,
        y: 0
      });
      this.render();
    });

    this.game.on('player_left', (data) => {
      this.players.delete(data.player_id);
      this.render();
    });

    this.game.on('state', (data) => {
      // Update all player positions
      for (const [id, player] of Object.entries(data.players)) {
        this.players.set(id, player as Player);
      }
      this.render();
    });

    this.game.on('error', (data) => {
      console.error('Game error:', data);
    });

    this.game.on('disconnected', (data) => {
      console.log('Disconnected:', data.reason);
    });
  }

  async join(roomId: string, playerName: string) {
    await this.game.connect({
      roomId,
      metadata: { playerName }
    });
  }

  move(x: number, y: number) {
    if (this.game.isConnected) {
      this.game.send({ action: 'move', x, y });
    }
  }

  leave() {
    this.game.disconnect();
  }

  private render() {
    // Update your game UI
    console.log('Players:', Array.from(this.players.values()));
  }
}

// Usage
const game = new SimpleGame(db);
await game.join('lobby', 'Player1');

// Handle user input
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') game.move(10, 0);
  if (e.key === 'ArrowLeft') game.move(-10, 0);
  if (e.key === 'ArrowUp') game.move(0, -10);
  if (e.key === 'ArrowDown') game.move(0, 10);
});
```

## Types

```typescript
interface GameConnectOptions {
  /** Room ID to join */
  roomId: string;
  /** JWT token for authentication (optional) */
  token?: string;
  /** Additional data to send on connect */
  metadata?: Record<string, any>;
}

interface Player {
  id: string;
  name?: string;
  [key: string]: any;
}

interface RoomInfo {
  room_id: string;
  player_count: number;
  max_players?: number;
  metadata?: Record<string, any>;
}

interface RoomListResponse {
  rooms: RoomInfo[];
  total: number;
}

type GameEventType =
  | 'connected'
  | 'player_joined'
  | 'player_left'
  | 'state'
  | 'message'
  | 'error'
  | 'disconnected'
  | string;
```

## Server-Side Setup

Create a WebSocket cloud function on the Cocobase dashboard. Example server code:

```python
def on_connect():
    room.join(request.get('room_id', 'lobby'), max_players=4)

    if not room.state:
        room.state = {'players': {}}

    room.state['players'][session.player_id] = {
        'name': request.get('playerName', 'Guest'),
        'x': 0, 'y': 0
    }

    room.broadcast({'type': 'player_joined', 'player_id': session.player_id})
    return {'type': 'connected', 'your_id': session.player_id}


def on_message():
    action = request.get('action')

    if action == 'move':
        x, y = request.get('x', 0), request.get('y', 0)
        room.state['players'][session.player_id]['x'] = x
        room.state['players'][session.player_id]['y'] = y
        room.broadcast({
            'type': 'state',
            'players': room.state['players']
        })


def on_disconnect():
    if session.player_id in room.state.get('players', {}):
        del room.state['players'][session.player_id]
    room.broadcast({'type': 'player_left', 'player_id': session.player_id})
```

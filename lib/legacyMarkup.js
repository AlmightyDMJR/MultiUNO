export const legacyMarkup = `
<div id="toast"></div>

<div id="home-screen" class="screen">
  <div class="logo">U<span>N</span>O</div>
  <p class="tagline">Cinematic Edition · Online Multiplayer</p>
  <div class="home-btns">
    <button class="btn-primary btn-red" onclick="showScreen('create-screen')">
      🏠 Create Room
    </button>
    <button class="btn-primary btn-blue" onclick="showScreen('join-screen')">
      🔗 Join Room
    </button>
    <button class="btn-ghost" onclick="showScreen('local-screen')">
      🎮 Local (vs CPU)
    </button>
  </div>
</div>

<div id="create-screen" class="screen out">
  <div class="panel">
    <h2>Create a Room</h2>

    <div style="margin-bottom: 18px">
      <div
        style="
          font-size: 11px;
          letter-spacing: 2px;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        "
      >
        Your Room Code
      </div>
      <div
        id="preview-code"
        onclick="refreshPreviewCode()"
        title="Click to regenerate"
        style="
          font-family: 'Bebas Neue', cursive;
          font-size: 54px;
          letter-spacing: 14px;
          color: #fff;
          text-align: center;
          padding: 16px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 14px;
          text-shadow: 0 0 28px rgba(255, 255, 255, 0.25);
          cursor: pointer;
          transition:
            opacity 0.15s,
            transform 0.15s,
            background 0.2s;
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
        "
      >
        ······
      </div>
      <div
        style="
          font-size: 10px;
          color: var(--muted);
          text-align: center;
          margin-top: 6px;
          letter-spacing: 1px;
        "
      >
        Share this code with friends · Click to regenerate
      </div>
    </div>

    <div class="field">
      <label>Your Name</label>
      <input
        type="text"
        id="create-name"
        placeholder="Enter your name"
        maxlength="14"
      />
    </div>
    <div class="err-msg" id="create-err"></div>
    <button class="btn-primary btn-red" style="width: 100%" onclick="createRoom()">
      CREATE ROOM ▶
    </button>
    <button
      class="btn-ghost"
      style="width: 100%; margin-top: 10px"
      onclick="showScreen('home-screen')"
    >
      ← Back
    </button>
  </div>
</div>

<div id="join-screen" class="screen out">
  <div class="panel">
    <h2>Join a Room</h2>
    <div class="field">
      <label>Your Name</label>
      <input
        type="text"
        id="join-name"
        placeholder="Enter your name"
        maxlength="14"
      />
    </div>
    <div class="field">
      <label>Room Code</label>
      <input
        type="text"
        id="join-code"
        placeholder="e.g. ALPHA42"
        maxlength="8"
        style="
          text-transform: uppercase;
          letter-spacing: 3px;
          font-family: 'Bebas Neue', cursive;
          font-size: 22px;
        "
      />
    </div>
    <div class="err-msg" id="join-err"></div>
    <button class="btn-primary btn-blue" style="width: 100%" onclick="joinRoom()">
      JOIN ROOM
    </button>
    <button
      class="btn-ghost"
      style="width: 100%; margin-top: 10px"
      onclick="showScreen('home-screen')"
    >
      ← Back
    </button>
  </div>
</div>

<div id="lobby-screen" class="screen out">
  <div class="panel">
    <h2>Waiting for Players</h2>
    <div class="room-code-display" id="lobby-code" onclick="copyCode()" title="Click to copy">
      ------
    </div>
    <div class="room-code-hint">Share this code · Click to copy · 2–7 players</div>
    <div class="lobby-list" id="lobby-list"></div>
    <div class="lobby-status" id="lobby-status">Waiting for players…</div>
    <button
      class="btn-primary btn-red"
      id="start-online-btn"
      style="width: 100%; margin-top: 14px; display: none"
      onclick="startOnlineGame()"
    >
      START GAME ▶
    </button>
    <button
      class="btn-ghost"
      style="width: 100%; margin-top: 10px"
      onclick="leaveRoom()"
    >
      Leave Room
    </button>
  </div>
</div>

<div id="local-screen" class="screen out">
  <div class="panel">
    <h2>Local Game — 2 to 7 Players</h2>
    <div id="local-player-list"></div>
    <button class="btn-primary btn-red" style="width: 100%; margin-top: 4px" onclick="startLocalGame()">
      DEAL CARDS ▶
    </button>
    <button
      class="btn-ghost"
      style="width: 100%; margin-top: 10px"
      onclick="showScreen('home-screen')"
    >
      ← Back
    </button>
  </div>
</div>

<div id="pass-screen" class="screen out">
  <div
    class="panel"
    style="
      text-align: center;
      gap: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
    "
  >
    <div
      style="
        font-family: 'Bebas Neue', cursive;
        font-size: 48px;
        letter-spacing: 4px;
        color: #fff;
      "
      id="pass-title"
    >
      PASS DEVICE
    </div>
    <p
      id="pass-sub"
      style="
        color: var(--muted);
        font-size: 14px;
        line-height: 1.6;
        max-width: 280px;
      "
    ></p>
    <button class="btn-primary btn-red" style="width: 220px; margin-top: 6px" onclick="passReady()">
      I'M READY ▶
    </button>
  </div>
</div>

<div id="game-screen">
  <canvas id="pcv"></canvas>
  <div id="stars"></div>
  <div id="table"></div>
  <div id="opp-zones"></div>

  <div id="pile-area">
    <div id="draw-pile" onclick="humanDraw()">
      <div class="pile-back"></div>
      <div class="pile-back"></div>
      <div class="pile-back"></div>
    </div>
    <div id="discard-zone">
      DISCARD
      <div id="discard-live"></div>
    </div>
  </div>

  <div id="dir-ring">↻</div>
  <div id="color-ring"></div>
  <div id="msg"></div>

  <div id="action-bar">
    <div id="turn-msg">YOUR TURN</div>
    <button class="action-btn" id="uno-btn" onclick="callUno()">UNO!</button>
    <button class="action-btn" id="skip-btn" onclick="humanSkip()">SKIP TURN</button>
  </div>

  <div id="bottom-zone">
    <div id="bottom-name-lbl">YOU</div>
    <div id="bottom-hand"></div>
  </div>

  <div id="color-picker">
    <h3>Pick a Color</h3>
    <div id="cp-btns">
      <div
        class="cp-btn"
        style="background: var(--red); --gc: rgba(232, 25, 44, 0.7)"
        onclick="pickColor('red')"
      ></div>
      <div
        class="cp-btn"
        style="background: var(--blue); --gc: rgba(0, 102, 204, 0.7)"
        onclick="pickColor('blue')"
      ></div>
      <div
        class="cp-btn"
        style="background: var(--green); --gc: rgba(20, 138, 0, 0.7)"
        onclick="pickColor('green')"
      ></div>
      <div
        class="cp-btn"
        style="background: var(--yellow); --gc: rgba(255, 194, 26, 0.7)"
        onclick="pickColor('yellow')"
      ></div>
    </div>
  </div>

  <div id="scores-panel"></div>

  <div id="wait-overlay">
    <div class="spinner"></div>
    <p id="wait-msg">Waiting for players…</p>
  </div>

  <div id="end-overlay">
    <h1 id="end-title">WINNER!</h1>
    <p id="end-sub"></p>
    <div id="scorecard"></div>
    <div class="end-btns">
      <button id="play-again-btn" onclick="playAgain()">🔄 PLAY AGAIN</button>
      <button id="back-home-btn" onclick="backToHome()">🏠 HOME</button>
    </div>
  </div>
</div>
`;

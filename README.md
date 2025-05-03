
  <h1>Deniska Race</h1>
  <p>A pixel-art endless runner starring Denis and his BMW, racing along the M1 highway past potholes, police checkpoints, service stations, and rogue quadcopters. Collect coins, pay fines—or crash and burn.</p>

  <h2>Demo</h2>
  <ul>
    <li><strong>Web:</strong> <a href="https://dreadvake.github.io/Deniska_Runner/">https://dreadvake.github.io/Deniska_Runner/</a></li>
  </ul>

  <h2>Features</h2>
  <ul>
    <li><strong>Retro Pixel Art</strong><br>
        Seamless parallax cityscape background and hand-drawn sprites.</li>
    <li><strong>Endless Runner</strong><br>
        Auto-scaling speed: pace increases as your score climbs.</li>
    <li><strong>Dynamic Obstacles</strong>
      <ul>
        <li>Potholes &amp; Check Engine signs (instant game over)</li>
        <li>Police Inspectors &amp; Service Stations impose fines (–50/–100 points) or end your run</li>
        <li>Quadcopters fly overhead; crush them for +50 points and a dramatic fall animation</li>
      </ul>
    </li>
    <li><strong>Scoring &amp; Pop-ups</strong><br>
      <code>+25</code> for coins, <code>+50</code> for quadcopters, <code>–50/–100</code> for fines, with animated pop-ups and a “Best” session score.</li>
    <li><strong>Desktop Only</strong><br>
      Fixed 800×400 canvas optimized for PC browsers.</li>
  </ul>

  <h2>Repository Structure</h2>
  <pre><code>Deniska_Runner/
├── assets/                <!-- sprites, backgrounds, sounds -->
├── index.html             <!-- game entry point -->
├── README.md              <!-- this file -->
└── .gitignore
</code></pre>

  <h2>Installation &amp; Deployment</h2>
  <ol>
    <li><strong>Clone the repo</strong><br>
      <pre><code>git clone https://github.com/dreadvake/Deniska_Runner.git  
cd Deniska_Runner</code></pre>
    </li>
    <li><strong>Serve locally</strong><br>
      <pre><code>npx http-server .</code></pre>
    </li>
    <li><strong>Deploy to GitHub Pages</strong><br>
      In your repository’s Settings → Pages, select branch <code>main</code> and folder <code>/</code>.</li>
  </ol>

  <h2>Technologies</h2>
  <ul>
    <li>HTML5 Canvas &amp; JavaScript (ES6)</li>
    <li>GitHub Pages for hosting</li>
    <li>python-telegram-bot for optional backend integration</li>
  </ul>

  <h2>License</h2>
  <p>Released under the <strong>MIT License</strong>. See <code>LICENSE</code> for details.</p>
</section>

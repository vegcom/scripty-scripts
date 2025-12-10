// ==UserScript==
// @name         Nuke Watch Later
// @namespace    https://youtube.com
// @version      1.1
// @description  yeet ur watch later into the void (vroom vroom edition)
// @match        https://www.youtube.com/playlist?list=WL
// @updateURL    https://raw.githubusercontent.com/vegcom/scripty-scripts/main/nuke-watchlater.user.js
// @downloadURL  https://raw.githubusercontent.com/vegcom/scripty-scripts/main/nuke-watchlater.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ⚡ SPEED CONFIG - lower = faster, higher = safer
    const MENU_DELAY = 150;   // was 300
    const REMOVE_DELAY = 300; // was 500

    const delay = ms => new Promise(r => setTimeout(r, ms));

    async function nukeWatchLater() {
        let count = 0;

        while (true) {
            const video = document.querySelector('ytd-playlist-video-renderer');
            if (!video) {
                console.log(`✨ done, removed ${count} videos`);
                alert(`watch later is deceased (${count} videos removed)`);
                break;
            }

            const title = video.querySelector('#video-title')?.textContent?.trim() || 'unknown';
            console.log(`🗑️ [${++count}] removing: ${title}`);

            video.querySelector('#button[aria-label="Action menu"]')?.click();
            await delay(MENU_DELAY);

            const menuItems = document.querySelectorAll('ytd-menu-service-item-renderer');
            const removeBtn = [...menuItems].find(el => el.textContent.includes('Remove from'));
            removeBtn?.click();

            await delay(REMOVE_DELAY);
        }
    }

    function addNukeButton() {
        if (document.querySelector('#nuke-wl-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'nuke-wl-btn';
        btn.textContent = '☢️ Nuke Watch Later';
        btn.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      z-index: 9999;
      padding: 10px 16px;
      background: #cc0000;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;
      btn.onclick = () => {
          if (confirm('u sure? this will delete EVERYTHING in watch later')) {
              nukeWatchLater();
          }
      };
      document.body.appendChild(btn);
  }

    window.addEventListener('yt-navigate-finish', addNukeButton);
    if (document.querySelector('ytd-playlist-video-renderer')) addNukeButton();
})();

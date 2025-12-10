// ==UserScript==
// @name         Auto Show Transcript
// @namespace    https://youtube.com
// @version      1.0
// @description  transcripts go brr
// @match        https://www.youtube.com/watch*
// @updateURL    https://raw.githubusercontent.com/vegcom/scripty-scripts/main/auto-transcript.user.js
// @downloadURL  https://raw.githubusercontent.com/vegcom/scripty-scripts/main/auto-transcript.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const delay = ms => new Promise(r => setTimeout(r, ms));

    async function showTranscript() {
        // wait for page to actually render
        await delay(1500);

        // check if transcript panel already open
        if (document.querySelector('ytd-transcript-segment-list-renderer')) {
            console.log('📜 transcript already open');
            return;
        }

        // expand description first (transcript button lives there now)
        const expandBtn = document.querySelector('tp-yt-paper-button#expand');
        if (expandBtn) {
            expandBtn.click();
            await delay(300);
        }

        // find and click "Show transcript"
        const buttons = document.querySelectorAll('ytd-video-description-transcript-section-renderer button');
        const transcriptBtn = [...buttons].find(b => b.textContent.includes('Show transcript'));

        if (transcriptBtn) {
            transcriptBtn.click();
            console.log('📜 transcript opened~');
        } else {
            console.log('📜 no transcript available for this video');
        }
    }

    // handle yt spa navigation
    window.addEventListener('yt-navigate-finish', showTranscript);

    // also run on initial load
    if (window.location.pathname === '/watch') {
        showTranscript();
    }
})();

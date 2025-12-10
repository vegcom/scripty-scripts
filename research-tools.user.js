// ==UserScript==
// @name         YouTube Research Tools
// @namespace    https://youtube.com
// @version      1.2
// @description  Quick links to Filmot, YouTube Metadata, Wayback Machine, and copy info
// @match        https://www.youtube.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/vegcom/scripty-scripts/main/research-tools.user.js
// @downloadURL  https://raw.githubusercontent.com/vegcom/scripty-scripts/main/research-tools.user.js
// ==/UserScript==

(function() {
    'use strict';

    function getVideoId() {
        const url = new URL(window.location.href);
        return url.searchParams.get('v');
    }

    function getChannelId() {
        const meta = document.querySelector('meta[itemprop="channelId"]');
        if (meta) return meta.content;

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical?.href.includes('/channel/')) {
            return canonical.href.split('/channel/')[1].split('/')[0];
        }

        const match = window.location.pathname.match(/\/channel\/([^\/]+)/);
        return match?.[1] || null;
    }

    function isVideoPage() {
        return window.location.pathname === '/watch';
    }

    function isChannelPage() {
        const path = window.location.pathname;
        return path.startsWith('/@') || path.startsWith('/channel/') || path.startsWith('/c/');
    }

    function createButton(id, text, color, onClick) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.textContent = text;
        btn.style.cssText = `
            padding: 6px 12px;
            background: ${color};
            color: white;
            border: none;
            border-radius: 18px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            margin-left: 8px;
        `;
        btn.addEventListener('click', onClick);
        return btn;
    }

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const original = btn.textContent;
            btn.textContent = '✓ Copied';
            setTimeout(() => btn.textContent = original, 1500);
        });
    }

    function addButtons() {
        document.getElementById('yt-metadata-btn')?.remove();
        document.getElementById('yt-filmot-btn')?.remove();
        document.getElementById('yt-archive-btn')?.remove();
        document.getElementById('yt-copy-btn')?.remove();

        let container;

        if (isVideoPage()) {
            container = document.querySelector('#owner') ||
                document.querySelector('#actions') ||
                document.querySelector('#top-row');

            if (!container) return;

            const videoId = getVideoId();
            if (!videoId) return;

            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

            // metadata
            const metaBtn = createButton(
                'yt-metadata-btn',
                '📊 Metadata',
                '#065fd4',
                () => window.open(`https://mattw.io/youtube-metadata/?url=${encodeURIComponent(videoUrl)}&submit=true`, '_blank')
            );
            container.appendChild(metaBtn);

            // filmot
            const filmotBtn = createButton(
                'yt-filmot-btn',
                '🔍 Filmot',
                '#1a73e8',
                () => window.open(`https://filmot.com/video/${videoId}`, '_blank')
            );
            container.appendChild(filmotBtn);

            // wayback
            const archiveBtn = createButton(
                'yt-archive-btn',
                '🏛️ Archive',
                '#6b7280',
                () => window.open(`https://web.archive.org/web/*/${videoUrl}`, '_blank')
            );
            container.appendChild(archiveBtn);

            // copy info
            const title = document.querySelector('h1.ytd-video-primary-info-renderer, h1.ytd-watch-metadata')?.textContent?.trim() || 'Unknown Title';
            const channel = document.querySelector('#owner #channel-name a, #owner ytd-channel-name a')?.textContent?.trim() || 'Unknown Channel';

            const copyBtn = createButton(
                'yt-copy-btn',
                '📋 Copy',
                '#059669',
                () => copyToClipboard(`[${title} - ${channel}](${videoUrl})`, copyBtn)
            );
            container.appendChild(copyBtn);

        } else if (isChannelPage()) {
            container = document.querySelector('#channel-header-container #buttons') ||
                document.querySelector('#inner-header-container #buttons') ||
                document.querySelector('ytd-c4-tabbed-header-renderer #buttons');

            if (!container) return;

            const channelId = getChannelId();
            const channelName = document.querySelector('#channel-name yt-formatted-string, #channel-header ytd-channel-name yt-formatted-string')?.textContent?.trim() || 'Unknown Channel';
            const channelUrl = window.location.href.split('?')[0];

            // metadata
            const metaBtn = createButton(
                'yt-metadata-btn',
                '📊 Metadata',
                '#065fd4',
                () => window.open(`https://mattw.io/youtube-metadata/?url=${encodeURIComponent(channelUrl)}`, '_blank')
            );
            container.appendChild(metaBtn);

            // filmot
            if (channelId) {
                const filmotBtn = createButton(
                    'yt-filmot-btn',
                    '🔍 Filmot',
                    '#1a73e8',
                    () => window.open(`https://filmot.com/channel/${channelId}`, '_blank')
                );
                container.appendChild(filmotBtn);
            }

            // wayback
            const archiveBtn = createButton(
                'yt-archive-btn',
                '🏛️ Archive',
                '#6b7280',
                () => window.open(`https://web.archive.org/web/*/${channelUrl}`, '_blank')
            );
            container.appendChild(archiveBtn);

            // copy info
            const copyBtn = createButton(
                'yt-copy-btn',
                '📋 Copy',
                '#059669',
                () => copyToClipboard(`${channelName} (${channelUrl})`, copyBtn)
            );
            container.appendChild(copyBtn);
        }
    }

    function init() {
        const observer = new MutationObserver(() => {
            if ((isVideoPage() || isChannelPage()) && !document.getElementById('yt-metadata-btn')) {
                addButtons();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('yt-navigate-finish', () => {
            setTimeout(addButtons, 500);
        });

        setTimeout(addButtons, 1000);
    }

    init();
})();

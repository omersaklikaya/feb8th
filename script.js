(function () {
  'use strict';

  // 8 Şubat 2025'ten itibaren sayaç (saniyeye kadar)
  var startDate = new Date(2025, 1, 8, 0, 0, 0, 0); // 8 Şubat 2025 00:00:00

  function updateCounter() {
    var now = new Date();
    var diff = Math.max(0, Math.floor((now - startDate) / 1000)); // toplam saniye
    var days = Math.floor(diff / 86400);
    var hours = Math.floor((diff % 86400) / 3600);
    var minutes = Math.floor((diff % 3600) / 60);
    var seconds = diff % 60;
    var daysEl = document.getElementById('days');
    var hoursEl = document.getElementById('hours');
    var minutesEl = document.getElementById('minutes');
    var secondsEl = document.getElementById('seconds');
    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;
  }

  updateCounter();
  setInterval(updateCounter, 1000);

  var messageBtn = document.getElementById('messageBtn');
  var messageOverlay = document.getElementById('messageOverlay');
  var messageBook = document.getElementById('messageBook');
  if (messageBtn && messageOverlay && messageBook) {
    function openMessage() {
      messageOverlay.classList.remove('hidden');
      messageOverlay.setAttribute('aria-hidden', 'false');
    }
    function closeMessage() {
      messageOverlay.classList.add('hidden');
      messageOverlay.setAttribute('aria-hidden', 'true');
    }
    messageBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      openMessage();
    });
    messageOverlay.addEventListener('click', function (e) {
      if (e.target === messageOverlay) closeMessage();
    });
    messageBook.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  var noteBtn = document.getElementById('noteBtn');
  var noteOverlay = document.getElementById('noteOverlay');
  var noteContent = noteOverlay ? noteOverlay.querySelector('.note-content') : null;
  if (noteBtn && noteOverlay) {
    function openNote() {
      noteOverlay.style.display = '';
      noteOverlay.classList.remove('hidden');
      noteOverlay.setAttribute('aria-hidden', 'false');
      noteOverlay.classList.remove('ferman-open');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          noteOverlay.classList.add('ferman-open');
        });
      });
    }
    function closeNote() {
      noteOverlay.classList.remove('ferman-open');
      noteOverlay.classList.add('hidden');
      noteOverlay.style.display = 'none';
      noteOverlay.setAttribute('aria-hidden', 'true');
    }
    noteBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openNote();
    });
    noteOverlay.addEventListener('click', function (e) {
      if (e.target === noteOverlay) closeNote();
    });
    if (noteContent) {
      noteContent.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  // Sen olduğunu düşündüğüm şeyler: kepenk tıklanınca sağa kayar
  document.querySelectorAll('.thing-shutter').forEach(function (shutter) {
    shutter.addEventListener('click', function () {
      var slot = shutter.closest('.thing-slot');
      if (slot) {
        slot.classList.toggle('revealed');
        var row = slot.closest('.song-row');
        if (row) row.classList.toggle('revealed');
      }
    });
    shutter.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var slot = shutter.closest('.thing-slot');
        if (slot) {
          slot.classList.toggle('revealed');
          var row = slot.closest('.song-row');
          if (row) row.classList.toggle('revealed');
        }
      }
    });
  });

  // Şarkılar: her .thing-slot-song için HTML5 ses, data-start’tan başlat, seek; tek çalma
  document.querySelectorAll('.thing-slot-song').forEach(function (songSlot) {
    var songAudio = songSlot.querySelector('.song-audio');
    var songToggle = songSlot.querySelector('.song-play-toggle');
    var songWaveform = songSlot.querySelector('.song-waveform');
    var songBars = songWaveform ? songWaveform.querySelectorAll('.sw') : [];
    var startSec = songAudio ? parseInt(songAudio.getAttribute('data-start') || '0', 10) : 0;

    function loadWaveform(src, bars) {
      if (!src || !bars.length) return;
      fetch(src)
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) {
          var ctx = new (window.AudioContext || window.webkitAudioContext)();
          return ctx.decodeAudioData(buf);
        })
        .then(function (audioBuffer) {
          var ch = audioBuffer.getChannelData(0);
          var numBars = bars.length;
          var block = Math.floor(ch.length / numBars);
          var peaks = [];
          for (var i = 0; i < numBars; i++) {
            var start = i * block;
            var end = i === numBars - 1 ? ch.length : (i + 1) * block;
            var max = 0;
            for (var j = start; j < end; j++) {
              var v = Math.abs(ch[j]);
              if (v > max) max = v;
            }
            peaks.push(max);
          }
          var peakMax = Math.max.apply(null, peaks);
          if (peakMax === 0) peakMax = 1;
          for (var k = 0; k < numBars; k++) {
            var pct = Math.round((peaks[k] / peakMax) * 92 + 8);
            bars[k].style.height = pct + '%';
          }
        })
        .catch(function () {});
    }

    var srcEl = songAudio && songAudio.querySelector('source');
    var src = srcEl ? (srcEl.getAttribute('src') || srcEl.src) : '';
    loadWaveform(src, songBars);

    if (!songSlot || !songAudio || !songToggle || !songWaveform) return;

    songAudio.volume = 0.22;
    var started = false;
    var seeking = false;
    var wasPlayingBeforeSeek = false;

    function seekFromEvent(e) {
      var rect = songWaveform.getBoundingClientRect();
      var x = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX) - rect.left;
      var pct = Math.max(0, Math.min(1, x / rect.width));
      var dur = songAudio.duration;
      if (isFinite(dur) && dur > 0) {
        songAudio.currentTime = pct * dur;
        started = true;
      }
    }

    function startSeeking() {
      seeking = true;
      wasPlayingBeforeSeek = !songAudio.paused;
      songAudio.muted = true;
    }

    function endSeeking() {
      seeking = false;
      songAudio.muted = false;
      if (wasPlayingBeforeSeek) songAudio.play();
    }

    songToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (songAudio.paused) {
        document.querySelectorAll('.thing-slot-song').forEach(function (other) {
          var otherAudio = other.querySelector('.song-audio');
          var otherToggle = other.querySelector('.song-play-toggle');
          if (otherAudio && otherAudio !== songAudio) {
            otherAudio.pause();
            other.classList.remove('playing');
            if (otherToggle) otherToggle.classList.remove('playing');
          }
        });
        if (!started) {
          songAudio.currentTime = startSec;
          started = true;
        }
        songAudio.play();
        songSlot.classList.add('playing');
        songToggle.classList.add('playing');
      } else {
        songAudio.pause();
        songSlot.classList.remove('playing');
        songToggle.classList.remove('playing');
      }
    });

    songWaveform.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      startSeeking();
      seekFromEvent(e);
    });

    songWaveform.addEventListener('touchstart', function (e) {
      e.stopPropagation();
      startSeeking();
      seekFromEvent(e);
    }, { passive: true });

    document.addEventListener('mousemove', function (e) {
      if (seeking) seekFromEvent(e);
    });

    document.addEventListener('mouseup', function () {
      if (seeking) endSeeking();
    });

    document.addEventListener('touchmove', function (e) {
      if (seeking && e.touches.length) seekFromEvent(e);
    }, { passive: true });

    document.addEventListener('touchend', function () {
      if (seeking) endSeeking();
    }, { passive: true });

    songWaveform.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    songWaveform.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var dur = songAudio.duration;
      if (!isFinite(dur)) return;
      var step = e.key === 'ArrowLeft' ? -5 : 5;
      songAudio.currentTime = Math.max(0, Math.min(dur, songAudio.currentTime + step));
      started = true;
    });

    songAudio.addEventListener('ended', function () {
      songSlot.classList.remove('playing');
      songToggle.classList.remove('playing');
    });
  });

  // Kutlama overlay (tüm site: kalpler + havai fişek + yazı)
  var celebrationEl = document.getElementById('celebration');
  var celebrationHearts = document.getElementById('celebrationHearts');
  var celebrationFireworks = document.getElementById('celebrationFireworks');
  var celebrationText = document.getElementById('celebrationText');
  var celebrationTimeout = null;

  function getMessageForOpenCount(count) {
    var messages = {
      1: 'BİZZ',
      2: 'BİZZ',
      3: 'BUNLAR DA BİZZ',
      4: 'BUNLAR ZATEN BİZZ',
      5: 'YİNE BİZZ',
      6: 'BİZZZ',
      7: 'BİZZİKO',
      8: 'BİZBİZBİZBİZ',
      9: 'ÇOK BİZZ',
      10: 'AŞŞIRI BİZZ',
      11: 'HEPSİ BİZZZZ'
    };
    return messages[count] || 'BİZZ';
  }

  var celebrationPhoto = document.getElementById('celebrationPhoto');

  function runCelebration(message, wrap) {
    if (!celebrationEl || !celebrationHearts || !celebrationFireworks || !celebrationText) return;
    if (celebrationTimeout) clearTimeout(celebrationTimeout);
    celebrationHearts.innerHTML = '';
    celebrationFireworks.innerHTML = '';
    celebrationText.classList.remove('show');
    celebrationText.textContent = '';
    celebrationText.offsetHeight;
    celebrationText.textContent = message || 'BİZZ';
    celebrationText.classList.add('show');
    if (celebrationPhoto) {
      celebrationPhoto.innerHTML = '';
      var decorImg = wrap && wrap.querySelector('.hero-decor');
      if (decorImg && decorImg.src) {
        var photoImg = document.createElement('img');
        photoImg.src = decorImg.src;
        photoImg.alt = decorImg.alt || '';
        photoImg.setAttribute('aria-hidden', 'true');
        celebrationPhoto.appendChild(photoImg);
      }
    }

    var i;
    var totalHearts = 48;
    for (i = 0; i < totalHearts; i++) {
      var heart = document.createElement('span');
      heart.className = 'celebration-heart';
      heart.textContent = '♥';
      if (i % 3 === 0) {
        heart.classList.add('heart-left');
        heart.style.top = (20 + Math.random() * 60) + '%';
        heart.style.animationDelay = (Math.random() * 0.35) + 's';
      } else if (i % 3 === 1) {
        heart.classList.add('heart-right');
        heart.style.top = (20 + Math.random() * 60) + '%';
        heart.style.animationDelay = (Math.random() * 0.35) + 's';
      } else {
        heart.style.left = (30 + Math.random() * 40) + '%';
        heart.style.top = (75 + Math.random() * 20) + '%';
        heart.style.animationDelay = (Math.random() * 0.25) + 's';
      }
      celebrationHearts.appendChild(heart);
    }
    for (i = 0; i < 10; i++) {
      var fw = document.createElement('div');
      fw.className = 'celebration-firework';
      fw.style.left = (10 + Math.random() * 80) + '%';
      fw.style.top = (15 + Math.random() * 65) + '%';
      fw.style.animationDelay = (Math.random() * 0.3) + 's';
      celebrationFireworks.appendChild(fw);
    }

    celebrationEl.classList.add('active');
    celebrationEl.setAttribute('aria-hidden', 'false');
    celebrationTimeout = setTimeout(function () {
      celebrationEl.classList.remove('active');
      celebrationEl.setAttribute('aria-hidden', 'true');
      celebrationText.classList.remove('show');
      if (celebrationPhoto) celebrationPhoto.innerHTML = '';
      celebrationTimeout = null;
    }, 1800);
  }

  // Hediye kutuları: sadece kapalıyken tıklanır; açılınca kutu gizlenir, tekrar tıklanamaz
  var openCount = 0;
  var wraps = document.querySelectorAll('.hero-gift-wrap');
  wraps.forEach(function (wrap) {
    var box = wrap.querySelector('.gift-box');
    if (!box) return;

    box.addEventListener('click', function (e) {
      e.stopPropagation();
      if (wrap.classList.contains('opened')) return;
      openCount += 1;
      wrap.classList.add('opened');
      runCelebration(getMessageForOpenCount(openCount), wrap);
    });

    box.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        box.click();
      }
    });
  });

  // Bizim anılarımız: BAK BURDA NE VAR kapağına basınca resim görünsün
  document.querySelectorAll('.memory-wrap').forEach(function (wrap) {
    var cover = wrap.querySelector('.memory-cover');
    if (!cover) return;
    cover.addEventListener('click', function () {
      wrap.classList.add('revealed');
    });
    cover.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrap.classList.add('revealed');
      }
    });
  });
})();

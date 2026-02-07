(function () {
  'use strict';

  // İlk birlikte olduğunuz gün (yıl, ay 0-indexed, gün)
  var startDate = new Date(2024, 1, 8); // 8 Şubat 2024

  function getDaysTogether() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    var diff = today - startDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  var daysEl = document.getElementById('days');
  if (daysEl) {
    daysEl.textContent = getDaysTogether();
  }

  var messageBtn = document.getElementById('messageBtn');
  var messageBox = document.getElementById('messageBox');
  if (messageBtn && messageBox) {
    messageBtn.addEventListener('click', function () {
      messageBox.classList.remove('hidden');
      messageBtn.textContent = 'Mesaj açık';
      messageBtn.disabled = true;
    });
  }

  // Kutlama overlay (tüm site: kalpler + havai fişek + yazı)
  var celebrationEl = document.getElementById('celebration');
  var celebrationHearts = document.getElementById('celebrationHearts');
  var celebrationFireworks = document.getElementById('celebrationFireworks');
  var celebrationText = document.getElementById('celebrationText');
  var celebrationTimeout = null;

  function getMessageForOpenCount(count) {
    if (count >= 1 && count <= 4) return 'BİZZ';
    if (count >= 5 && count <= 7) return 'BUNLAR DA BİZZ';
    if (count === 8) return 'BUNLAR ZATEN BİZZ';
    if (count >= 9) return 'HEPSİ BİZZ';
    return 'BİZZ';
  }

  var celebrationPhoto = document.getElementById('celebrationPhoto');

  function runCelebration(message, wrap) {
    if (!celebrationEl || !celebrationHearts || !celebrationFireworks || !celebrationText) return;
    if (celebrationTimeout) clearTimeout(celebrationTimeout);
    celebrationHearts.innerHTML = '';
    celebrationFireworks.innerHTML = '';
    celebrationText.classList.remove('show');
    celebrationText.textContent = message || 'BİZZ';
    celebrationText.offsetHeight;
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

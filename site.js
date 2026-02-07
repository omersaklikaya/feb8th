(function () {
  'use strict';

  var CUP_WIDTH = 220;
  var GAP = 42;
  var STEP = CUP_WIDTH + GAP;
  var BOARD_OFFSET = 14; /* Orta bardak = board ortası */
  var SHUFFLE_COUNT = 5;
  var SWAP_DURATION_MS = 1400;
  var BALL_FLOAT_SIZE = 55;
  var LIFT_MS = 400;
  var BALL_UNDER_MS = 400;   /* top bardak altına yukarı girer */
  var CUP_DOWN_MS = 350;
  var BALL_UNDER_CUP_BOTTOM = 65; /* kalkan bardak altında topun bottom değeri */

  var board = document.getElementById('gameBoard');
  var cups = document.querySelectorAll('.cup');
  var ballFloat = document.getElementById('ballFloat');
  var instructionEl = document.getElementById('gateInstruction');
  var scoreEl = document.getElementById('score');
  var feedbackEl = document.getElementById('feedback');
  var reshuffleBtn = document.getElementById('reshuffleBtn');
  var redirectOverlay = document.getElementById('redirectOverlay');

  var order = [0, 1, 2];
  var ballCupIndex = -1;
  var streak = 0;
  var phase = 'choose'; // 'choose' | 'placing' | 'shuffling' | 'guess'

  function setInstruction(text) {
    if (instructionEl) instructionEl.textContent = text;
  }

  function setScore() {
    if (scoreEl) scoreEl.textContent = 'Doğru: ' + streak + ' / 3';
  }

  function setBall(cupIndex) {
    cups.forEach(function (c, i) {
      c.classList.toggle('has-ball', i === cupIndex);
    });
    ballCupIndex = cupIndex;
  }

  function setReveal(cupIndex) {
    cups.forEach(function (c, i) {
      c.classList.toggle('reveal', i === cupIndex);
    });
  }

  function clearReveal() {
    cups.forEach(function (c) {
      c.classList.remove('reveal');
    });
  }

  function showBallFloat(show) {
    if (!ballFloat) return;
    if (show) {
      ballFloat.classList.remove('hidden');
      ballFloat.style.left = 'calc(50% + 8px)';
      ballFloat.style.bottom = '-180px';
      ballFloat.style.top = 'auto';
      ballFloat.style.marginLeft = '-' + (BALL_FLOAT_SIZE / 2) + 'px';
    } else {
      ballFloat.classList.add('hidden');
    }
  }

  function showReshuffleBtn(show) {
    if (!reshuffleBtn) return;
    if (show) reshuffleBtn.classList.remove('hidden');
    else reshuffleBtn.classList.add('hidden');
  }

  function getCupPositionIndex(cupIndex) {
    return order.indexOf(cupIndex);
  }

  function applyPositions() {
    cups.forEach(function (cup, k) {
      var pos = getCupPositionIndex(k);
      var translateX = (pos - k) * STEP;
      var tx = translateX + 'px';
      cup.style.setProperty('--cup-tx', tx);
      /* transform sadece CSS'te (--cup-tx ile); .lifted havaya kalkması inline ile ezilmesin */
    });
  }

  function swapOrder(i, j) {
    var t = order[i];
    order[i] = order[j];
    order[j] = t;
  }

  function shuffleThenResolve(done) {
    if (!board || cups.length !== 3) {
      if (done) done();
      return;
    }
    board.classList.add('shuffling');
    cups.forEach(function (c) {
      c.classList.add('shuffling');
    });
    var count = 0;
    function doSwap() {
      if (count >= SHUFFLE_COUNT) {
        board.classList.remove('shuffling');
        cups.forEach(function (c) {
          c.classList.remove('shuffling');
        });
        if (done) done();
        return;
      }
      var a = Math.floor(Math.random() * 3);
      var b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
      if (a > b) { var t = a; a = b; b = t; }
      swapOrder(a, b);
      applyPositions();
      count++;
      setTimeout(doSwap, SWAP_DURATION_MS);
    }
    doSwap();
  }

  function placeBallUnderCup(cupIndex, done) {
    if (!ballFloat || !cups[cupIndex]) {
      if (done) done();
      return;
    }
    var cup = cups[cupIndex];
    setInstruction('Top yerleşiyor…');

    cup.classList.add('lifted');
    ballFloat.style.transition = 'left ' + (BALL_UNDER_MS / 1000) + 's ease, bottom ' + (BALL_UNDER_MS / 1000) + 's ease';

    setTimeout(function () {
      var leftPx = BOARD_OFFSET + cupIndex * STEP + CUP_WIDTH / 2 - BALL_FLOAT_SIZE / 2;
      ballFloat.style.marginLeft = '0';
      ballFloat.style.left = leftPx + 'px';
      ballFloat.style.bottom = BALL_UNDER_CUP_BOTTOM + 'px';
    }, LIFT_MS);

    setTimeout(function () {
      cup.classList.remove('lifted');
      /* Bardak inerken top hemen gizlensin (saliselik) */
      ballFloat.style.transition = 'opacity 0.1s ease';
      showBallFloat(false);
    }, LIFT_MS + BALL_UNDER_MS);

    setTimeout(function () {
      setBall(cupIndex);
      if (done) done();
    }, LIFT_MS + BALL_UNDER_MS + CUP_DOWN_MS);
  }

  function startShuffle() {
    setInstruction('Bardaklar karışıyor…');
    phase = 'shuffling';
    board.classList.add('shuffling');
    cups.forEach(function (c) { c.classList.add('shuffling'); });
    shuffleThenResolve(function () {
      board.classList.remove('shuffling');
      cups.forEach(function (c) { c.classList.remove('shuffling'); });
      phase = 'guess';
      setInstruction('Top hangi bardakta? Seç.');
    });
  }

  function startRound() {
    phase = 'choose';
    ballCupIndex = -1;
    setBall(-1);
    clearReveal();
    order = [0, 1, 2];
    applyPositions();
    showReshuffleBtn(false);
    showBallFloat(true);
    setInstruction('Topu koyacağın bardağı seç.');
    setScore();
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.classList.remove('wrong');
    }
  }

  function goToGuess() {
    phase = 'guess';
    setInstruction('Top hangi bardakta? Seç.');
    showReshuffleBtn(false);
  }

  function showRedirect() {
    if (redirectOverlay) {
      redirectOverlay.classList.add('visible');
      redirectOverlay.setAttribute('aria-hidden', 'false');
    }
    setTimeout(function () {
      window.location.href = 'main.html';
    }, 2000);
  }

  function onCupClick(e) {
    var cup = e.currentTarget;
    var index = parseInt(cup.getAttribute('data-index'), 10);

    if (phase === 'choose') {
      phase = 'placing';
      placeBallUnderCup(index, function () {
        startShuffle();
      });
      return;
    }

    if (phase !== 'guess') return;

    if (index !== ballCupIndex) {
      streak = 0;
      setScore();
      if (feedbackEl) {
        feedbackEl.textContent = 'Yanlış. Tekrar dene.';
        feedbackEl.classList.add('wrong');
      }
      setTimeout(function () {
        clearReveal();
        startRound();
      }, 1800);
      return;
    }

    streak++;
    setScore();
    if (feedbackEl) {
      feedbackEl.textContent = 'Doğru +1!';
      feedbackEl.classList.remove('wrong');
    }

    if (streak >= 3) {
      showRedirect();
      return;
    }

    showReshuffleBtn(true);
  }

  function onReshuffleClick() {
    if (phase !== 'guess' || ballCupIndex < 0) return;
    showReshuffleBtn(false);
    setInstruction('Bardaklar karışıyor…');
    if (feedbackEl) feedbackEl.textContent = '';
    phase = 'shuffling';
    board.classList.add('shuffling');
    cups.forEach(function (c) { c.classList.add('shuffling'); });
    shuffleThenResolve(function () {
      board.classList.remove('shuffling');
      cups.forEach(function (c) { c.classList.remove('shuffling'); });
      goToGuess();
    });
  }

  cups.forEach(function (cup) {
    cup.addEventListener('click', onCupClick);
    cup.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cup.click();
      }
    });
  });
  if (reshuffleBtn) reshuffleBtn.addEventListener('click', onReshuffleClick);

  startRound();
})();

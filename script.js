(function () {
  const rowsEl = document.getElementById('rows');
  const addRowBtn = document.getElementById('addRow');
  const gpaValueEl = document.getElementById('gpaValue');
  const avgValueEl = document.getElementById('avgValue');
  const creditValueEl = document.getElementById('creditValue');
  const letterGradeEl = document.getElementById('letterGrade');

  // score threshold -> { letter, point }
  const GRADE_SCALE = [
    { min: 80, letter: 'A',  point: 4.0 },
    { min: 75, letter: 'B+', point: 3.5 },
    { min: 70, letter: 'B',  point: 3.0 },
    { min: 65, letter: 'C+', point: 2.5 },
    { min: 60, letter: 'C',  point: 2.0 },
    { min: 55, letter: 'D+', point: 1.5 },
    { min: 50, letter: 'D',  point: 1.0 },
    { min: -Infinity, letter: 'F', point: 0.0 },
  ];

  function gradeFromScore(score) {
    if (score === null || Number.isNaN(score)) return null;
    return GRADE_SCALE.find(g => score >= g.min);
  }

  function overallLetter(gpa, hasRows) {
    if (!hasRows) return '–';
    const scaled = gpa; // gpa already on 0-4 scale, map back to nearest letter band
    let best = GRADE_SCALE[GRADE_SCALE.length - 1];
    for (const g of GRADE_SCALE) {
      if (scaled >= g.point - 0.001) { best = g; break; }
    }
    return best.letter;
  }

  function createRow(prefill) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <input type="text" name="name" placeholder="ชื่อวิชา เช่น แคลคูลัส 1" />
      <input type="number" name="credit" placeholder="3" min="0" step="0.5" />
      <input type="number" name="score" placeholder="0-100" min="0" max="100" step="1" />
      <span class="row__grade">–</span>
      <button type="button" class="row__remove" aria-label="ลบรายวิชา">
        <svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
    `;

    const nameInput = row.querySelector('[name="name"]');
    const creditInput = row.querySelector('[name="credit"]');
    const scoreInput = row.querySelector('[name="score"]');
    const gradeSpan = row.querySelector('.row__grade');
    const removeBtn = row.querySelector('.row__remove');

    if (prefill) {
      nameInput.value = prefill.name || '';
      creditInput.value = prefill.credit ?? '';
      scoreInput.value = prefill.score ?? '';
    }

    function updateGradeLabel() {
      const score = scoreInput.value === '' ? null : Math.max(0, Math.min(100, Number(scoreInput.value)));
      const g = gradeFromScore(score);
      gradeSpan.textContent = g ? g.letter : '–';
      recalculate();
    }

    creditInput.addEventListener('input', recalculate);
    scoreInput.addEventListener('input', updateGradeLabel);
    nameInput.addEventListener('input', recalculate);
    removeBtn.addEventListener('click', () => {
      row.remove();
      recalculate();
    });

    rowsEl.appendChild(row);
    return row;
  }

  function recalculate() {
    const rows = Array.from(rowsEl.querySelectorAll('.row'));
    let totalCredits = 0;
    let totalPoints = 0;
    let totalWeightedScore = 0;
    let countedRows = 0;

    rows.forEach(row => {
      const credit = Number(row.querySelector('[name="credit"]').value);
      const scoreRaw = row.querySelector('[name="score"]').value;
      const score = scoreRaw === '' ? null : Math.max(0, Math.min(100, Number(scoreRaw)));

      if (!credit || credit <= 0 || score === null || Number.isNaN(score)) return;

      const g = gradeFromScore(score);
      totalCredits += credit;
      totalPoints += credit * g.point;
      totalWeightedScore += credit * score;
      countedRows += 1;
    });

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const avgScore = totalCredits > 0 ? totalWeightedScore / totalCredits : 0;

    gpaValueEl.textContent = gpa.toFixed(2);
    avgValueEl.textContent = avgScore.toFixed(1);
    creditValueEl.textContent = totalCredits % 1 === 0 ? totalCredits.toString() : totalCredits.toFixed(1);
    letterGradeEl.textContent = overallLetter(gpa, countedRows > 0);
  }

  addRowBtn.addEventListener('click', () => createRow());

  // seed with a couple of example rows to show the shape of the tool
  createRow({ name: 'คณิตศาสตร์พื้นฐาน', credit: 3, score: 82 });
  createRow({ name: 'ภาษาอังกฤษ', credit: 2, score: 74 });
  createRow();

  recalculate();
})();
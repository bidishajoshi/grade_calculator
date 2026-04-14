/**
 * Grade Calculator — app.js
 * Modular, well-commented JavaScript for calculating student grades.
 */

// ─── State ────────────────────────────────────────────────────────────────────
const students = [];   // Array of all calculated student records
let activeStudent = 0; // Index of the currently displayed student

// ─── Initialisation ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildSubjects(); // Render default subject rows on page load
});

// ─── Tab Navigation ───────────────────────────────────────────────────────────
/**
 * Switch between the "Input" and "Results" tabs.
 * @param {string} tab - 'input' or 'results'
 */
function showTab(tab) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'input') || (i === 1 && tab === 'results'));
  });
  document.getElementById('tab-input').style.display = tab === 'input' ? 'block' : 'none';
  document.getElementById('tab-results').style.display = tab === 'results' ? 'block' : 'none';
  if (tab === 'results') renderResults();
}

// ─── Subject Row Management ────────────────────────────────────────────────────
/**
 * Build subject rows to match the "Number of subjects" input.
 */
function buildSubjects() {
  const n = parseInt(document.getElementById('num-subjects').value) || 4;
  const container = document.getElementById('subjects-container');
  const existing = container.querySelectorAll('.subject-row').length;

  if (n > existing) {
    for (let i = existing; i < n; i++) addSubjectRow(i + 1);
  } else {
    const rows = container.querySelectorAll('.subject-row');
    for (let i = n; i < existing; i++) rows[i].remove();
  }
}

/**
 * Append a single subject row to the subjects container.
 * @param {number|null} num - Display number for placeholder text
 */
function addSubjectRow(num) {
  const container = document.getElementById('subjects-container');
  const n = num || container.querySelectorAll('.subject-row').length + 1;

  const row = document.createElement('div');
  row.className = 'subject-row';
  row.innerHTML = `
    <input type="text" placeholder="Subject ${n}" value="Subject ${n}" style="width:100%;">
    <input type="number" min="0" max="100" placeholder="75" style="width:100%;" oninput="validateMarkInput(this)">
    <input type="number" min="1" max="100" value="100" style="width:100%;">
    <button class="btn-remove" onclick="removeRow(this)" title="Remove subject">×</button>
  `;
  container.appendChild(row);
  document.getElementById('num-subjects').value = container.querySelectorAll('.subject-row').length;
}

/**
 * Remove a subject row when the × button is clicked.
 * @param {HTMLElement} btn - The remove button element
 */
function removeRow(btn) {
  const container = document.getElementById('subjects-container');
  if (container.querySelectorAll('.subject-row').length <= 1) return; // Keep at least 1
  btn.closest('.subject-row').remove();
  document.getElementById('num-subjects').value = container.querySelectorAll('.subject-row').length;
}

/**
 * Live-validate a marks input field, highlighting it red if invalid.
 * @param {HTMLInputElement} el - The marks input element
 */
function validateMarkInput(el) {
  const v = parseFloat(el.value);
  const maxEl = el.closest('.subject-row').querySelector('input:nth-child(3)');
  const max = parseFloat(maxEl.value) || 100;
  el.classList.toggle('invalid', isNaN(v) || v < 0 || v > max);
}

// ─── Grade Logic ───────────────────────────────────────────────────────────────
/**
 * Return the letter grade for a given percentage.
 * @param {number} pct - Percentage (0–100)
 * @returns {string} Letter grade A/B/C/D/F
 */
function getGrade(pct) {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

/**
 * Return the GPA (4.0 scale) for a given percentage.
 * @param {number} pct - Percentage (0–100)
 * @returns {number} GPA value
 */
function getGPA(pct) {
  if (pct >= 90) return 4.0;
  if (pct >= 80) return 3.0;
  if (pct >= 70) return 2.0;
  if (pct >= 60) return 1.0;
  return 0.0;
}

/**
 * Return CSS fill class for a progress bar based on percentage.
 * @param {number} pct
 * @returns {string} CSS class name
 */
function fillClass(pct) {
  if (pct >= 70) return 'fill-high';
  if (pct >= 60) return 'fill-mid';
  return 'fill-low';
}

// ─── Calculation ───────────────────────────────────────────────────────────────
/**
 * Read form inputs, validate them, compute grades and save a student record.
 */
function calculate() {
  const name = document.getElementById('student-name').value.trim();
  if (!name) { showError('Please enter a student name.'); return; }

  const rows = document.querySelectorAll('#subjects-container .subject-row');
  if (!rows.length) { showError('Add at least one subject.'); return; }

  const subjects = [];
  let allValid = true;

  rows.forEach((row, i) => {
    const inputs = row.querySelectorAll('input');
    const subName  = inputs[0].value.trim() || `Subject ${i + 1}`;
    const marks    = parseFloat(inputs[1].value);
    const maxMarks = parseFloat(inputs[2].value) || 100;

    if (isNaN(marks) || marks < 0 || marks > maxMarks) {
      allValid = false;
      inputs[1].classList.add('invalid');
      return;
    }

    inputs[1].classList.remove('invalid');
    const pct = (marks / maxMarks) * 100;
    subjects.push({ name: subName, marks, maxMarks, pct, grade: getGrade(pct), gpa: getGPA(pct) });
  });

  if (!allValid) { showError('Please fix the highlighted marks (must be 0 – max marks).'); return; }
  showError('');

  // Aggregate totals
  const totalObtained = subjects.reduce((s, x) => s + x.marks, 0);
  const totalMax      = subjects.reduce((s, x) => s + x.maxMarks, 0);
  const overallPct    = (totalObtained / totalMax) * 100;
  const avgGPA        = subjects.reduce((s, x) => s + x.gpa, 0) / subjects.length;

  // A student FAILS if any subject is below 40%
  const pass = subjects.every(s => s.pct >= 40);

  const record = {
    name,
    subjects,
    totalObtained,
    totalMax,
    overallPct,
    avgGPA,
    pass,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  students.unshift(record); // newest first
  activeStudent = 0;

  document.getElementById('results-count').textContent = `(${students.length})`;
  showTab('results');
}

// ─── Rendering ────────────────────────────────────────────────────────────────
/**
 * Render the student chips list and the active student's result sheet.
 */
function renderResults() {
  if (!students.length) {
    document.getElementById('students-list').innerHTML = '';
    document.getElementById('result-display').innerHTML =
      '<div class="empty-state">No results yet. Go to the Input tab to add students.</div>';
    return;
  }

  // Student selector chips
  document.getElementById('students-list').innerHTML =
    students.map((s, i) =>
      `<span class="student-chip${i === activeStudent ? ' active' : ''}" onclick="selectStudent(${i})">${s.name}</span>`
    ).join('');

  const s = students[activeStudent];

  // Build subject rows HTML
  const subjectRows = s.subjects.map(sub => `
    <tr>
      <td>${sub.name}</td>
      <td>${sub.marks} / ${sub.maxMarks}</td>
      <td>
        ${sub.pct.toFixed(1)}%
        <div class="progress-bar">
          <div class="progress-fill ${fillClass(sub.pct)}" style="width:${sub.pct.toFixed(1)}%"></div>
        </div>
      </td>
      <td><span class="badge badge-${sub.grade}">${sub.grade}</span></td>
      <td>${sub.gpa.toFixed(1)}</td>
    </tr>
  `).join('');

  document.getElementById('result-display').innerHTML = `
    <div class="result-sheet">
      <div class="result-header">
        <div class="student-name-display">${s.name}</div>
        <div class="result-meta">Generated ${s.date} &nbsp;·&nbsp; ${s.subjects.length} subject${s.subjects.length !== 1 ? 's' : ''}</div>
      </div>

      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Total</div>
          <div class="metric-value">${s.totalObtained.toFixed(0)} / ${s.totalMax}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Percentage</div>
          <div class="metric-value">${s.overallPct.toFixed(1)}%</div>
        </div>
        <div class="metric">
          <div class="metric-label">GPA (4.0)</div>
          <div class="metric-value">${s.avgGPA.toFixed(2)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Grade</div>
          <div class="metric-value">${getGrade(s.overallPct)}</div>
        </div>
      </div>

      <table class="subject-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
            <th>Percentage</th>
            <th>Grade</th>
            <th>GPA</th>
          </tr>
        </thead>
        <tbody>${subjectRows}</tbody>
      </table>

      <div class="result-footer">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span class="pass-badge ${s.pass ? 'pass' : 'fail'}">${s.pass ? '✓ Pass' : '✗ Fail'}</span>
          ${!s.pass ? '<span style="font-size:12px;color:#6b6a64;">One or more subjects below 40%</span>' : ''}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn-sm" onclick="exportText()">Export .txt</button>
          <button class="btn btn-sm btn-danger" onclick="removeStudent(${activeStudent})">Remove</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Switch the active student in the results view.
 * @param {number} i - Index of the student to display
 */
function selectStudent(i) {
  activeStudent = i;
  renderResults();
}

/**
 * Remove a student record and refresh the results view.
 * @param {number} i - Index to remove
 */
function removeStudent(i) {
  students.splice(i, 1);
  activeStudent = Math.min(activeStudent, students.length - 1);
  document.getElementById('results-count').textContent = students.length ? `(${students.length})` : '';
  renderResults();
}

// ─── Utilities ────────────────────────────────────────────────────────────────
/**
 * Display or clear the form-level error message.
 * @param {string} msg - Error text (empty string clears it)
 */
function showError(msg) {
  document.getElementById('form-error').textContent = msg;
}

/**
 * Reset the input form to its default state.
 */
function clearForm() {
  document.getElementById('student-name').value = '';
  document.getElementById('subjects-container').innerHTML = '';
  document.getElementById('num-subjects').value = 4;
  showError('');
  buildSubjects();
}

// ─── Export ───────────────────────────────────────────────────────────────────
/**
 * Export the active student's result sheet as a formatted plain-text file.
 */
function exportText() {
  const s = students[activeStudent];
  const sep = '='.repeat(52);
  const thin = '-'.repeat(52);

  const lines = [
    sep,
    '            STUDENT GRADE RESULT SHEET',
    sep,
    `Student Name : ${s.name}`,
    `Date         : ${s.date}`,
    `Subjects     : ${s.subjects.length}`,
    thin,
    'SUBJECT-WISE BREAKDOWN',
    thin,
    'Subject             Marks        %       Grade  GPA',
    thin,
    ...s.subjects.map(sub =>
      `${sub.name.padEnd(20)}${(sub.marks + '/' + sub.maxMarks).padEnd(13)}${sub.pct.toFixed(1).padEnd(8)}${sub.grade.padEnd(7)}${sub.gpa.toFixed(1)}`
    ),
    thin,
    `Total Marks  : ${s.totalObtained} / ${s.totalMax}`,
    `Percentage   : ${s.overallPct.toFixed(2)}%`,
    `GPA (4.0)    : ${s.avgGPA.toFixed(2)}`,
    `Final Grade  : ${getGrade(s.overallPct)}`,
    `Result       : ${s.pass ? 'PASS ✓' : 'FAIL ✗'}`,
    sep,
    s.pass
      ? 'Congratulations! Keep up the great work.'
      : 'Note: One or more subjects scored below 40%.',
    sep,
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${s.name.replace(/\s+/g, '_')}_result.txt`;
  a.click();
}

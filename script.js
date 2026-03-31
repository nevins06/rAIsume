// ============================================================
// AI Resume Generator — Frontend Logic
// ============================================================

// ── CONFIG ──────────────────────────────────────────────────
// Change this to your n8n webhook URL after importing the workflow
const WEBHOOK_URL = 'http://localhost:5678/webhook/generate-resume';

// ── STATE ───────────────────────────────────────────────────
const skills = [];
let projectCount = 0;
let experienceCount = 0;

// ── DOM REFS ────────────────────────────────────────────────
const form = document.getElementById('resumeForm');
const submitBtn = document.getElementById('submitBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');
const skillInput = document.getElementById('skillInput');
const skillsWrapper = document.getElementById('skillsWrapper');
const projectsList = document.getElementById('projectsList');
const experienceList = document.getElementById('experienceList');

// ── SKILLS TAG INPUT ────────────────────────────────────────
skillInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addSkill(skillInput.value);
  }
  // Backspace removes last tag when input is empty
  if (e.key === 'Backspace' && skillInput.value === '' && skills.length > 0) {
    removeSkill(skills.length - 1);
  }
});

skillsWrapper.addEventListener('click', () => {
  skillInput.focus();
});

function addSkill(value) {
  const cleaned = value.trim().replace(/,/g, '');
  if (!cleaned) return;
  if (skills.includes(cleaned)) {
    showToast('Skill already added', 'error');
    skillInput.value = '';
    return;
  }
  skills.push(cleaned);
  renderSkills();
  skillInput.value = '';
}

function removeSkill(index) {
  skills.splice(index, 1);
  renderSkills();
}

function renderSkills() {
  // Remove existing tags (keep the input)
  skillsWrapper.querySelectorAll('.skill-tag').forEach(el => el.remove());

  skills.forEach((skill, i) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.innerHTML = `
      ${escapeHTML(skill)}
      <button type="button" class="skill-tag__remove" data-index="${i}" title="Remove">×</button>
    `;
    skillsWrapper.insertBefore(tag, skillInput);
  });

  // Bind remove buttons
  skillsWrapper.querySelectorAll('.skill-tag__remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeSkill(parseInt(btn.dataset.index));
    });
  });
}

// ── DYNAMIC PROJECTS ────────────────────────────────────────
document.getElementById('addProjectBtn').addEventListener('click', () => addProject());

// Add one project by default
addProject();

function addProject() {
  projectCount++;
  const id = projectCount;
  const item = document.createElement('div');
  item.className = 'dynamic-list__item';
  item.id = `project-${id}`;
  item.innerHTML = `
    <div class="dynamic-list__fields">
      <input class="form-input" type="text" name="projectName_${id}" placeholder="Project Name" required>
      <textarea class="form-input" name="projectDesc_${id}" placeholder="Brief description — what it does, tech used…" rows="2" style="resize:vertical;min-height:60px" required></textarea>
      <input class="form-input" type="url" name="projectRepo_${id}" placeholder="GitHub Repo URL (e.g. https://github.com/…)">
    </div>
    <button type="button" class="btn-remove" onclick="removeProject(${id})" title="Remove project">×</button>
  `;
  projectsList.appendChild(item);
}

function removeProject(id) {
  const el = document.getElementById(`project-${id}`);
  if (!el) return;
  el.classList.add('dynamic-list__item--removing');
  setTimeout(() => el.remove(), 250);
}
// Make globally accessible for inline onclick
window.removeProject = removeProject;

// ── DYNAMIC EXPERIENCE ──────────────────────────────────────
document.getElementById('addExperienceBtn').addEventListener('click', () => addExperience());

function addExperience() {
  experienceCount++;
  const id = experienceCount;
  const item = document.createElement('div');
  item.className = 'dynamic-list__item';
  item.id = `experience-${id}`;
  item.innerHTML = `
    <div class="dynamic-list__fields">
      <div class="dynamic-list__row">
        <input class="form-input" type="text" name="expTitle_${id}" placeholder="Job Title / Role">
        <input class="form-input" type="text" name="expCompany_${id}" placeholder="Company Name">
      </div>
      <div class="dynamic-list__row">
        <input class="form-input" type="text" name="expDuration_${id}" placeholder="Duration (e.g. Jun 2024 – Aug 2024)">
        <input class="form-input" type="text" name="expLocation_${id}" placeholder="Location (e.g. Remote)">
      </div>
      <textarea class="form-input" name="expDesc_${id}" placeholder="Key responsibilities and achievements…" rows="2" style="resize:vertical;min-height:60px"></textarea>
    </div>
    <button type="button" class="btn-remove" onclick="removeExperience(${id})" title="Remove experience">×</button>
  `;
  experienceList.appendChild(item);
}

function removeExperience(id) {
  const el = document.getElementById(`experience-${id}`);
  if (!el) return;
  el.classList.add('dynamic-list__item--removing');
  setTimeout(() => el.remove(), 250);
}
window.removeExperience = removeExperience;

// ── FORM SUBMISSION ─────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate skills
  if (skills.length === 0) {
    showToast('Please add at least one skill', 'error');
    skillInput.focus();
    return;
  }

  // Validate at least one project
  const projectItems = projectsList.querySelectorAll('.dynamic-list__item');
  if (projectItems.length === 0) {
    showToast('Please add at least one project', 'error');
    return;
  }

  // Collect all form data
  const payload = collectFormData();

  // Start loading
  showLoading(true);

  try {
    // Animate loading steps
    animateLoadingSteps();

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    // Get the binary file
    const blob = await response.blob();

    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.name.replace(/\s+/g, '_')}_Resume.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    showLoading(false);
    showToast('✅ Resume downloaded successfully!', 'success');

  } catch (err) {
    console.error('Submission error:', err);
    showLoading(false);
    showToast(`❌ Error: ${err.message}`, 'error');
  }
});

// ── DATA COLLECTION ─────────────────────────────────────────
function collectFormData() {
  // Personal info
  const data = {
    name: val('name'),
    email: val('email'),
    phone: val('phone'),
    city: val('city'),
    github: val('github'),
    linkedin: val('linkedin'),

    // Education
    school: val('school'),
    college: val('college'),
    collegeYear: val('collegeYear'),
    twelfthPercentage: val('twelfthPercentage'),
    cgpa: val('cgpa'),

    // Languages
    languages: val('languages'),

    // Skills (array)
    skills: [...skills],

    // Job Description
    jobDescription: val('jobDescription'),
  };

  // Projects (array of objects)
  data.projects = [];
  projectsList.querySelectorAll('.dynamic-list__item').forEach(item => {
    const inputs = item.querySelectorAll('input, textarea');
    if (inputs.length >= 2) {
      data.projects.push({
        name: inputs[0].value.trim(),
        description: inputs[1].value.trim(),
        repoLink: inputs[2] ? inputs[2].value.trim() : '',
      });
    }
  });

  // Experience (array of objects)
  data.experience = [];
  experienceList.querySelectorAll('.dynamic-list__item').forEach(item => {
    const inputs = item.querySelectorAll('input, textarea');
    if (inputs.length >= 1) {
      data.experience.push({
        title: inputs[0] ? inputs[0].value.trim() : '',
        company: inputs[1] ? inputs[1].value.trim() : '',
        duration: inputs[2] ? inputs[2].value.trim() : '',
        location: inputs[3] ? inputs[3].value.trim() : '',
        description: inputs[4] ? inputs[4].value.trim() : '',
      });
    }
  });

  return data;
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ── LOADING STATE ───────────────────────────────────────────
function showLoading(show) {
  if (show) {
    loadingOverlay.classList.add('active');
    submitBtn.disabled = true;
    // Reset steps
    document.querySelectorAll('.loading-step').forEach(step => {
      step.classList.remove('active', 'done');
      step.querySelector('.loading-step__icon').textContent = '○';
    });
    const first = document.getElementById('step1');
    first.classList.add('active');
    first.querySelector('.loading-step__icon').textContent = '◉';
  } else {
    loadingOverlay.classList.remove('active');
    submitBtn.disabled = false;
  }
}

function animateLoadingSteps() {
  const stepIds = ['step1', 'step2', 'step3', 'step4'];
  const delays = [0, 3000, 7000, 12000]; // ms

  stepIds.forEach((id, i) => {
    // Activate step
    setTimeout(() => {
      const step = document.getElementById(id);
      if (!step) return;

      // Mark previous as done
      if (i > 0) {
        const prev = document.getElementById(stepIds[i - 1]);
        prev.classList.remove('active');
        prev.classList.add('done');
        prev.querySelector('.loading-step__icon').textContent = '✓';
      }

      step.classList.add('active');
      step.querySelector('.loading-step__icon').textContent = '◉';
    }, delays[i]);
  });
}

// ── TOAST ───────────────────────────────────────────────────
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast toast--${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ── UTILITIES ───────────────────────────────────────────────
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

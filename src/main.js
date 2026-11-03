// Formspree endpoint comes from the VITE_FORMSPREE_ENDPOINT env var (see .env.example / README).
const ENDPOINT = (import.meta.env.VITE_FORMSPREE_ENDPOINT || '').trim();
const MIN_TESTIMONIAL = 20;
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const $ = (id) => document.getElementById(id);
const form = $('review-form');
const submitBtn = $('submit');
const formError = $('form-error');
let submitting = false;

$('year').textContent = new Date().getFullYear();

/* ---------- Star rating ---------- */
const starLabels = [...document.querySelectorAll('#stars label')];
const starInputs = [...document.querySelectorAll('#stars input')];
const ratingText = $('rating-text');
const currentRating = () => Number(starInputs.find((i) => i.checked)?.value || 0);

function paintStars(n) {
  starLabels.forEach((l, i) => l.classList.toggle('is-on', i < n));
}
function syncStars() {
  const r = currentRating();
  paintStars(r);
  ratingText.textContent = r ? `${r} of 5 – ${RATING_LABELS[r]}` : '';
}
starInputs.forEach((i) => i.addEventListener('change', () => { syncStars(); clearError('rating'); }));
starLabels.forEach((l, i) => {
  l.addEventListener('mouseenter', () => paintStars(i + 1));
  l.addEventListener('mouseleave', syncStars);
});

/* ---------- Validation ---------- */
function setError(key, msg) {
  $(`${key}-error`).textContent = msg;
  const el = key === 'rating' ? document.querySelector('.rating') : $(key);
  if (key === 'rating') el.classList.add('is-invalid-group');
  else { el.classList.add('is-invalid'); el.setAttribute('aria-invalid', 'true'); }
}
function clearError(key) {
  $(`${key}-error`).textContent = '';
  const el = key === 'rating' ? document.querySelector('.rating') : $(key);
  if (key === 'rating') el.classList.remove('is-invalid-group');
  else { el.classList.remove('is-invalid'); el.removeAttribute('aria-invalid'); }
}

function validate() {
  const v = readValues();
  const errors = {};
  if (!v.name) errors.name = 'Please enter your name.';
  if (!v.business_name) errors.business_name = 'Please enter your business name.';
  if (!v.email) errors.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(v.email)) errors.email = 'Please enter a valid email address, like john@example.com.';
  if (!v.rating) errors.rating = 'Please select a star rating.';
  if (!v.testimonial) errors.testimonial = 'Please tell us about your experience.';
  else if (v.testimonial.length < MIN_TESTIMONIAL)
    errors.testimonial = `Please write at least ${MIN_TESTIMONIAL} characters (${v.testimonial.length} so far).`;
  return errors;
}

function readValues() {
  return {
    name: $('name').value.trim(),
    business_name: $('business_name').value.trim(),
    email: $('email').value.trim(),
    rating: currentRating(),
    testimonial: $('testimonial').value.trim(),
    business_results: $('business_results').value.trim(),
    permission: $('permission').checked,
  };
}

['name', 'business_name', 'email', 'testimonial'].forEach((k) => {
  $(k).addEventListener('input', () => { if ($(k).classList.contains('is-invalid')) clearError(k); });
});

/* ---------- Submit ---------- */
function showBanner(msg) { formError.textContent = msg; formError.hidden = false; }
function hideBanner() { formError.hidden = true; formError.textContent = ''; }

function setLoading(on) {
  submitting = on;
  submitBtn.disabled = on;
  submitBtn.classList.toggle('is-loading', on);
  submitBtn.querySelector('.btn__label').textContent = on ? 'Submitting…' : 'Submit My Review';
  submitBtn.setAttribute('aria-busy', String(on));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (submitting) return; // prevent duplicate submissions
  hideBanner();

  ['name', 'business_name', 'email', 'testimonial', 'rating'].forEach(clearError);
  const errors = validate();
  const keys = Object.keys(errors);
  if (keys.length) {
    keys.forEach((k) => setError(k, errors[k]));
    const first = keys[0] === 'rating' ? starInputs[0] : $(keys[0]);
    (first.closest('.field') || first).scrollIntoView({ block: 'center', behavior: 'smooth' });
    first.focus({ preventScroll: true });
    return;
  }

  if (!ENDPOINT) {
    showBanner('This form is not connected yet (missing Formspree endpoint). Please contact Arclo directly. Your answers have been kept.');
    return;
  }

  const v = readValues();
  const payload = {
    name: v.name,
    business_name: v.business_name,
    email: v.email,
    rating: `${v.rating}`,
    testimonial: v.testimonial,
    business_results: v.business_results || '(none provided)',
    permission_to_publish: v.permission ? 'Yes' : 'No',
    publish_status: v.permission ? 'APPROVED for public use (pending owner review)' : 'NOT APPROVED for public use – private feedback only',
    submitted_at: new Date().toISOString(),
    _subject: `New Arclo review: ${v.rating}/5 from ${v.business_name}`,
    _gotcha: form.elements._gotcha.value,
  };

  setLoading(true);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      $('form-view').hidden = true;
      const s = $('success-view');
      s.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      s.focus();
      return;
    }
    let msg = 'Something went wrong and your review was not sent. Please try again in a moment.';
    try {
      const data = await res.json();
      if (data?.errors?.length) msg = data.errors.map((x) => x.message).join(' ');
    } catch { /* non-JSON error body */ }
    showBanner(msg + ' Your answers have been kept.');
  } catch {
    showBanner('We couldn’t reach the server. Please check your connection and try again. Your answers have been kept.');
  } finally {
    setLoading(false);
  }
});

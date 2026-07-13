// Password Strength Validation & Indicator

class PasswordStrengthValidator {
  constructor() {
    this.requirements = {
      length: { regex: /.{8,}/, name: '8+ characters' },
      uppercase: { regex: /[A-Z]/, name: '1 uppercase letter' },
      lowercase: { regex: /[a-z]/, name: '1 lowercase letter' },
      special: { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, name: '1 special character' },
    };
  }

  // Check if password meets all requirements
  isValid(password) {
    return Object.values(this.requirements).every(req => req.regex.test(password));
  }

  // Get validation status for each requirement
  getStatus(password) {
    const status = {};
    for (const [key, req] of Object.entries(this.requirements)) {
      status[key] = req.regex.test(password);
    }
    return status;
  }

  // Calculate password strength (0-100)
  calculateStrength(password) {
    if (!password) return 0;
    
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
    
    return Math.min(score, 100);
  }

  // Get strength level (Weak, Medium, Strong)
  getStrengthLevel(score) {
    if (score < 40) return { level: 'Weak', color: 'red', display: '🔴 Weak' };
    if (score < 70) return { level: 'Medium', color: 'orange', display: '🟠 Medium' };
    return { level: 'Strong', color: 'green', display: '🟢 Strong' };
  }

  // Get full strength info
  getStrengthInfo(password) {
    const score = this.calculateStrength(password);
    const strength = this.getStrengthLevel(score);
    return { score, ...strength };
  }
}

// Initialize validator
const passwordValidator = new PasswordStrengthValidator();

// Update password strength indicator in real-time
function updatePasswordStrength(inputSelector, indicatorSelector) {
  const input = document.querySelector(inputSelector);
  const indicator = document.querySelector(indicatorSelector);
  
  if (!input || !indicator) return;

  input.addEventListener('input', () => {
    const password = input.value;
    const info = passwordValidator.getStrengthInfo(password);
    
    // Update strength meter
    const strengthMeter = indicator.querySelector('.strength-meter');
    if (strengthMeter) {
      strengthMeter.style.width = info.score + '%';
      strengthMeter.className = `strength-meter bg-${info.color}-500 h-2 rounded-full transition-all duration-300`;
    }

    // Update strength text
    const strengthText = indicator.querySelector('.strength-text');
    if (strengthText) {
      strengthText.textContent = info.display;
      strengthText.className = `strength-text text-${info.color}-500 font-semibold mt-2`;
    }

    // Update requirements
    const status = passwordValidator.getStatus(password);
    updateRequirements(indicator, status);
  });
}

// Update requirement checklist
function updateRequirements(container, status) {
  const checklist = container.querySelector('.requirements-checklist');
  if (!checklist) return;

  checklist.innerHTML = `
    <div class="text-sm mt-4 space-y-2">
      <div class="flex items-center gap-2 ${status.length ? 'text-green-500' : 'text-zinc-400'}">
        <i class="fa ${status.length ? 'fa-check' : 'fa-times'}"></i>
        <span>At least 8 characters</span>
      </div>
      <div class="flex items-center gap-2 ${status.uppercase ? 'text-green-500' : 'text-zinc-400'}">
        <i class="fa ${status.uppercase ? 'fa-check' : 'fa-times'}"></i>
        <span>At least 1 uppercase letter</span>
      </div>
      <div class="flex items-center gap-2 ${status.lowercase ? 'text-green-500' : 'text-zinc-400'}">
        <i class="fa ${status.lowercase ? 'fa-check' : 'fa-times'}"></i>
        <span>At least 1 lowercase letter</span>
      </div>
      <div class="flex items-center gap-2 ${status.special ? 'text-green-500' : 'text-zinc-400'}">
        <i class="fa ${status.special ? 'fa-check' : 'fa-times'}"></i>
        <span>At least 1 special character</span>
      </div>
    </div>
  `;
}

// Validate password match
function validatePasswordMatch(passwordSelector, confirmSelector) {
  const password = document.querySelector(passwordSelector);
  const confirm = document.querySelector(confirmSelector);
  
  if (!password || !confirm) return true;

  const match = password.value === confirm.value && password.value.length > 0;
  
  if (confirm.value) {
    if (match) {
      confirm.classList.remove('border-red-500');
      confirm.classList.add('border-green-500');
    } else {
      confirm.classList.remove('border-green-500');
      confirm.classList.add('border-red-500');
    }
  }
  
  return match;
}

// Initialize all password strength indicators on page
function initializeAllPasswordStrengthIndicators() {
  const passwordInputs = document.querySelectorAll('[data-password-strength="true"]');
  passwordInputs.forEach((input) => {
    const indicatorId = input.getAttribute('data-strength-indicator');
    if (indicatorId) {
      updatePasswordStrength(`[data-password-strength="true"][data-strength-indicator="${indicatorId}"]`, `#${indicatorId}`);
    }
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PasswordStrengthValidator, passwordValidator };
}

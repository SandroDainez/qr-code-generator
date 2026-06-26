// QRCraft - JS Engine for Premium QR Code Generator

// Standard SVG Base64 Logos for center embedding
const LOGO_SVGS = {
  link: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%233b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  whats: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310b981"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  wifi: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%233b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20" stroke-width="3"></line></svg>`,
  pix: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M50 8L92 50L50 92L8 50Z" stroke="%2332bcad" stroke-width="6" stroke-linejoin="round"/><path d="M50 20L80 50L50 80L20 50Z" fill="%2332bcad"/><path d="M50 30L70 50L50 70L30 50Z" fill="white"/></svg>`,
  email: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`
};

// Global State
let currentTab = 'link';
let qrCodeInstance = null;
let customLogoDataUrl = null;
let customLogoName = '';
let debounceTimeout = null;
let history = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  // Init Icons
  lucide.createIcons();
  
  // Load local settings
  loadTheme();
  loadHistory();

  // Initialize QR Styling object
  initQR();

  // Set Event Listeners
  setupTabEvents();
  setupCustomizationEvents();
  setupExportEvents();
  setupInputWatchers();
  setupCardFlashlightGlow();

  // Generate initial QR
  generateQR();
});

// Theme Management
function loadTheme() {
  const savedTheme = localStorage.getItem('qr-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeToggleBtn = document.getElementById('theme-toggle');
  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('qr-theme', target);
  });
}

// Cards Flashlight Glow Effect (From reference Finex layout)
function setupCardFlashlightGlow() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// Tabs Switching
function setupTabEvents() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle Tab Active Classes
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Toggle Content Panels
      const targetTab = tab.getAttribute('data-tab');
      currentTab = targetTab;
      
      const contents = document.querySelectorAll('.tab-content');
      contents.forEach(c => c.classList.remove('active'));
      
      const targetContent = document.getElementById(`content-${targetTab}`);
      if (targetContent) targetContent.classList.add('active');

      // Trigger QR Regeneration
      triggerUpdate();
    });
  });
}

// Watch inputs to auto-regenerate on changes (debounce)
function setupInputWatchers() {
  const inputs = document.querySelectorAll(
    'input[type="text"], input[type="url"], input[type="tel"], input[type="email"], input[type="number"], input[type="password"], textarea, select'
  );
  
  inputs.forEach(input => {
    input.addEventListener('input', triggerUpdate);
    input.addEventListener('change', triggerUpdate);
  });
}

function triggerUpdate() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    generateQR();
  }, 200);
}

// Initialize QR Styling Engine
function initQR() {
  qrCodeInstance = new QRCodeStyling({
    width: 512,
    height: 512,
    type: 'canvas',
    data: 'https://exemplo.com.br',
    dotsOptions: {
      color: '#ffffff',
      type: 'square'
    },
    backgroundOptions: {
      color: '#030303'
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      hideBackgroundDots: true,
      imageSize: 0.15,
      margin: 6
    }
  });

  const outputContainer = document.getElementById('qr-output');
  outputContainer.innerHTML = '';
  qrCodeInstance.append(outputContainer);
}

// Parse Form Content to String Payload
function getQRContentAndLabel() {
  let content = '';
  let label = '';

  switch (currentTab) {
    case 'link':
      const link = document.getElementById('in-link').value.trim();
      content = link || 'https://exemplo.com.br';
      label = link ? getDomainName(link) : 'Link da Web';
      break;

    case 'whats':
      const num = document.getElementById('in-whats-num').value.replace(/\D/g, '');
      const msg = document.getElementById('in-whats-msg').value.trim();
      if (num) {
        let cleanNum = num;
        // Auto-prefix country code 55 for Brazil if not specified but DDD is present
        if (cleanNum.length === 10 || cleanNum.length === 11) {
          cleanNum = '55' + cleanNum;
        }
        content = `https://wa.me/${cleanNum}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
        label = `WhatsApp: +${cleanNum}`;
      } else {
        content = 'https://wa.me/5511999999999';
        label = 'WhatsApp Exemplo';
      }
      break;

    case 'wifi':
      const ssid = document.getElementById('in-wifi-ssid').value.trim();
      const pass = document.getElementById('in-wifi-pass').value.trim();
      const sec = document.getElementById('in-wifi-sec').value;
      if (ssid) {
        // Escaping ssid and pass
        const escSSID = escapeWifiString(ssid);
        const escPass = escapeWifiString(pass);
        content = `WIFI:T:${sec};S:${escSSID};P:${sec === 'nopass' ? '' : escPass};;`;
        label = `Wi-Fi: ${ssid}`;
      } else {
        content = 'WIFI:T:WPA;S:RedeExemplo;P:senha123;;';
        label = 'Wi-Fi Exemplo';
      }
      break;

    case 'pix':
      const key = document.getElementById('in-pix-key').value.trim();
      const name = document.getElementById('in-pix-name').value.trim();
      const city = document.getElementById('in-pix-city').value.trim();
      const amount = document.getElementById('in-pix-amount').value;
      const desc = document.getElementById('in-pix-desc').value.trim();
      
      if (key) {
        content = generatePixPayload(key, name, city, amount, desc);
        label = `PIX: ${name || 'Recebedor'}${amount ? ' - R$ ' + parseFloat(amount).toFixed(2) : ''}`;
      } else {
        content = generatePixPayload('12345678901', 'JOSE DA SILVA', 'SAO PAULO', '10.00', 'EXEMPLO');
        label = 'PIX Exemplo';
      }
      break;

    case 'email':
      const to = document.getElementById('in-email-to').value.trim();
      const sub = document.getElementById('in-email-sub').value.trim();
      const body = document.getElementById('in-email-body').value.trim();
      if (to) {
        content = `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
        label = `E-mail: ${to}`;
      } else {
        content = 'mailto:contato@exemplo.com';
        label = 'E-mail Exemplo';
      }
      break;

    case 'vcard':
      const first = document.getElementById('in-vc-first').value.trim();
      const last = document.getElementById('in-vc-last').value.trim();
      const phone = document.getElementById('in-vc-phone').value.trim();
      const email = document.getElementById('in-vc-email').value.trim();
      const org = document.getElementById('in-vc-org').value.trim();
      const url = document.getElementById('in-vc-url').value.trim();
      
      if (first || last || phone) {
        content = generateVCard(first, last, phone, email, org, url);
        label = `Contato: ${first} ${last}`.trim();
      } else {
        content = generateVCard('João', 'Silva', '+5511999999999', 'joao@silva.com', 'Empresa S/A', 'https://exemplo.com');
        label = 'Contato Exemplo';
      }
      break;

    case 'text':
      const text = document.getElementById('in-text').value.trim();
      content = text || 'QRCraft';
      label = text ? (text.length > 20 ? text.substring(0, 17) + '...' : text) : 'Texto Livre';
      break;
  }

  return { content, label };
}

// Generate the QR Code with complete styling parameters
function generateQR() {
  if (!qrCodeInstance) return;

  const { content, label } = getQRContentAndLabel();

  // Get Customization Settings
  const size = parseInt(document.getElementById('qr-size').value) || 512;
  const errorLevel = document.getElementById('qr-error-level').value || 'H';
  
  // Colors options
  const colorMode = document.querySelector('input[name="color-mode"]:checked').value;
  const isTransparent = document.getElementById('color-bg-trans').checked;
  const bgColor = isTransparent ? 'transparent' : document.getElementById('color-bg').value;
  
  let dotsColorOptions = {};
  if (colorMode === 'solid') {
    dotsColorOptions = {
      color: document.getElementById('color-solid').value,
      type: 'solid'
    };
  } else {
    const color1 = document.getElementById('color-grad-1').value;
    const color2 = document.getElementById('color-grad-2').value;
    const gradType = document.getElementById('color-grad-type').value;
    const angle = parseInt(document.getElementById('color-grad-angle').value);
    
    dotsColorOptions = {
      gradient: {
        type: gradType,
        rotation: (angle * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: color1 },
          { offset: 1, color: color2 }
        ]
      }
    };
  }

  // Dots shape
  const dotsType = document.getElementById('style-dots').value;

  // Corner Square (Outer Eye) options
  const styleEyeOuter = document.getElementById('style-eye-outer').value;
  const customEyes = document.getElementById('custom-eyes-toggle').checked;
  let cornersSquareOptions = {
    type: styleEyeOuter
  };

  // Corner Dot (Inner Eye) options
  const styleEyeInner = document.getElementById('style-eye-inner').value;
  let cornersDotOptions = {
    type: styleEyeInner
  };

  if (customEyes) {
    cornersSquareOptions.color = document.getElementById('color-eye-outer').value;
    cornersDotOptions.color = document.getElementById('color-eye-inner').value;
  } else {
    // If custom colors are disabled, inherit from dotsColorOptions
    if (colorMode === 'solid') {
      cornersSquareOptions.color = document.getElementById('color-solid').value;
      cornersDotOptions.color = document.getElementById('color-solid').value;
    } else {
      // Allow library to inherit gradient naturally or clear color
      delete cornersSquareOptions.color;
      delete cornersDotOptions.color;
    }
  }

  // Logo Settings
  const checkedLogoInput = document.querySelector('input[name="logo-preset"]:checked');
  const logoPreset = checkedLogoInput ? checkedLogoInput.value : (customLogoDataUrl ? 'custom' : 'none');
  let logoUrl = null;

  if (logoPreset === 'custom') {
    logoUrl = customLogoDataUrl;
  } else if (logoPreset !== 'none') {
    logoUrl = LOGO_SVGS[logoPreset];
  }

  const logoSize = parseFloat(document.getElementById('logo-size').value) || 0.15;
  const logoMargin = parseInt(document.getElementById('logo-margin').value) || 6;
  const logoHideDots = document.getElementById('logo-hide-dots').checked;

  // Prepare full Options Config
  const options = {
    width: size,
    height: size,
    data: content,
    qrOptions: {
      errorCorrectionLevel: errorLevel
    },
    dotsOptions: {
      ...dotsColorOptions,
      type: dotsType
    },
    backgroundOptions: {
      color: bgColor
    },
    cornersSquareOptions: cornersSquareOptions,
    cornersDotOptions: cornersDotOptions,
    imageOptions: {
      hideBackgroundDots: logoHideDots,
      imageSize: logoSize,
      margin: logoMargin,
      crossOrigin: 'anonymous'
    }
  };

  if (logoUrl) {
    options.image = logoUrl;
  } else {
    options.image = '';
  }

  // Update QR code canvas
  qrCodeInstance.update(options);

  // Show/Hide Payload raw copy area (specifically for PIX/vCard/Link)
  const rawPayloadContainer = document.getElementById('raw-payload-container');
  const rawPayloadText = document.getElementById('raw-payload-text');
  const payloadTypeLabel = document.getElementById('payload-type-label');

  const hasPixKey = document.getElementById('in-pix-key').value.trim() !== '';
  const hasLink = document.getElementById('in-link').value.trim() !== '';

  if (currentTab === 'pix' && hasPixKey) {
    rawPayloadContainer.classList.remove('hidden');
    rawPayloadText.innerText = content;
    payloadTypeLabel.innerText = 'PIX Copia e Cola';
  } else if (currentTab === 'vcard' && content.startsWith('BEGIN:VCARD')) {
    rawPayloadContainer.classList.remove('hidden');
    rawPayloadText.innerText = content;
    payloadTypeLabel.innerText = 'Código vCard';
  } else if (currentTab === 'link' && hasLink) {
    rawPayloadContainer.classList.remove('hidden');
    rawPayloadText.innerText = content;
    payloadTypeLabel.innerText = 'URL Raw';
  } else {
    rawPayloadContainer.classList.add('hidden');
  }
}

// Setup advanced visual controls (accordion, color pickers, upload logo)
function setupCustomizationEvents() {
  // Accordion Expand/Collapse
  const customHeader = document.querySelector('.custom-accordion-header');
  const customCard = document.querySelector('.card-customization');
  customHeader.addEventListener('click', () => {
    customCard.classList.toggle('open');
  });

  // Color Mode Toggle (Solid vs Gradient)
  const colorModeRadios = document.querySelectorAll('input[name="color-mode"]');
  const solidControls = document.getElementById('solid-color-controls');
  const gradientControls = document.getElementById('gradient-color-controls');
  
  colorModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'solid') {
        solidControls.classList.remove('hidden');
        gradientControls.classList.add('hidden');
      } else {
        solidControls.classList.add('hidden');
        gradientControls.classList.remove('hidden');
      }
      triggerUpdate();
    });
  });

  // Eye custom colors toggle
  const customEyesCheckbox = document.getElementById('custom-eyes-toggle');
  const customEyesControls = document.getElementById('custom-eyes-controls');
  customEyesCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      customEyesControls.classList.remove('hidden');
    } else {
      customEyesControls.classList.add('hidden');
    }
    triggerUpdate();
  });

  // Sliders value feedback displays
  setupSliderFeedback('color-grad-angle', 'val-grad-angle', '°');
  setupSliderFeedback('logo-size', 'val-logo-size', '%', (val) => Math.round(val * 100));
  setupSliderFeedback('logo-margin', 'val-logo-margin', 'px');

  // Double bind color pickers and text hex boxes
  bindColorPicker('color-solid', 'color-solid-hex');
  bindColorPicker('color-grad-1', 'color-grad-1-hex');
  bindColorPicker('color-grad-2', 'color-grad-2-hex');
  bindColorPicker('color-bg', 'color-bg-hex');
  bindColorPicker('color-eye-outer', 'color-eye-outer-hex');
  bindColorPicker('color-eye-inner', 'color-eye-inner-hex');

  // Logo preset button clicks
  const logoPresetLabels = document.querySelectorAll('.logo-preset-btn');
  const logoSettingsControls = document.getElementById('logo-settings-controls');
  
  logoPresetLabels.forEach(label => {
    const input = label.querySelector('input');
    input.addEventListener('change', (e) => {
      // Toggle selected class on labels
      logoPresetLabels.forEach(l => l.classList.remove('active'));
      label.classList.add('active');

      if (e.target.value !== 'none') {
        logoSettingsControls.classList.remove('hidden');
      } else {
        logoSettingsControls.classList.add('hidden');
      }
      triggerUpdate();
    });
  });

  // Logo Custom File Upload
  const logoUploadInput = document.getElementById('logo-upload');
  const logoFileName = document.getElementById('logo-file-name');
  const logoRemoveBtn = document.getElementById('logo-remove-btn');
  
  logoUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    customLogoName = file.name;
    logoFileName.innerText = file.name;
    logoRemoveBtn.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = (event) => {
      customLogoDataUrl = event.target.result;
      
      const radioCustom = document.createElement('input');
      radioCustom.type = 'radio';
      radioCustom.name = 'logo-preset';
      radioCustom.value = 'custom';
      radioCustom.checked = true;
      
      logoPresetLabels.forEach(l => l.classList.remove('active'));
      logoSettingsControls.classList.remove('hidden');
      
      logoPresetLabels.forEach(l => {
        const rad = l.querySelector('input');
        rad.checked = false;
      });

      triggerUpdate();
    };
    reader.readAsDataURL(file);
  });

  // Logo Remove Button
  logoRemoveBtn.addEventListener('click', () => {
    logoUploadInput.value = '';
    customLogoDataUrl = null;
    customLogoName = '';
    logoFileName.innerText = 'Nenhuma imagem';
    logoRemoveBtn.classList.add('hidden');

    // Revert to none preset
    const radioNone = document.querySelector('input[name="logo-preset"][value="none"]');
    if (radioNone) {
      radioNone.checked = true;
      radioNone.closest('.logo-preset-btn').classList.add('active');
    }
    logoSettingsControls.classList.add('hidden');
    triggerUpdate();
  });

  // Setup Presets Buttons click events
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyDesignPreset(btn.getAttribute('data-preset'));
    });
  });
}

// Helpers for interactive Visual controls
function setupSliderFeedback(sliderId, valueId, unit, transformFn) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(valueId);
  if (!slider || !display) return;

  slider.addEventListener('input', (e) => {
    const rawVal = e.target.value;
    const finalVal = transformFn ? transformFn(rawVal) : rawVal;
    display.innerText = `${finalVal}${unit}`;
    triggerUpdate();
  });
}

function bindColorPicker(pickerId, hexInputId) {
  const picker = document.getElementById(pickerId);
  const hexInput = document.getElementById(hexInputId);
  if (!picker || !hexInput) return;

  picker.addEventListener('input', (e) => {
    hexInput.value = e.target.value.toUpperCase();
    triggerUpdate();
  });

  hexInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (val.charAt(0) !== '#') val = '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      picker.value = val;
      triggerUpdate();
    }
  });
}

// Apply quick styling presets - adapted for deep black theme
function applyDesignPreset(presetName) {
  if (presetName === 'custom') {
    document.querySelector('.card-customization').classList.add('open');
    return;
  }

  const setRadio = (name, val) => {
    const rad = document.querySelector(`input[name="${name}"][value="${val}"]`);
    if (rad) {
      rad.checked = true;
      rad.dispatchEvent(new Event('change'));
    }
  };

  const setSelect = (id, val) => {
    const sel = document.getElementById(id);
    if (sel) {
      sel.value = val;
      sel.dispatchEvent(new Event('change'));
    }
  };

  const setColor = (pickerId, hexId, hexVal) => {
    const picker = document.getElementById(pickerId);
    const hex = document.getElementById(hexId);
    if (picker) picker.value = hexVal;
    if (hex) hex.value = hexVal.toUpperCase();
  };

  const setCheckbox = (id, checked) => {
    const cb = document.getElementById(id);
    if (cb) {
      cb.checked = checked;
      cb.dispatchEvent(new Event('change'));
    }
  };

  setRadio('logo-preset', 'none');
  const logoRemoveBtn = document.getElementById('logo-remove-btn');
  if (logoRemoveBtn) logoRemoveBtn.click(); // Reset upload

  switch (presetName) {
    case 'classic':
      setRadio('color-mode', 'solid');
      setColor('color-solid', 'color-solid-hex', '#ffffff');
      setColor('color-bg', 'color-bg-hex', '#030303');
      setCheckbox('color-bg-trans', false);
      setCheckbox('custom-eyes-toggle', false);
      setSelect('style-dots', 'square');
      setSelect('style-eye-outer', 'square');
      setSelect('style-eye-inner', 'square');
      break;

    case 'rounded-ocean':
      setRadio('color-mode', 'gradient');
      setColor('color-grad-1', 'color-grad-1-hex', '#3b82f6');
      setColor('color-grad-2', 'color-grad-2-hex', '#8b5cf6');
      setSelect('color-grad-type', 'linear');
      document.getElementById('color-grad-angle').value = 45;
      document.getElementById('val-grad-angle').innerText = '45°';
      setColor('color-bg', 'color-bg-hex', '#030303');
      setCheckbox('color-bg-trans', false);
      setCheckbox('custom-eyes-toggle', false);
      setSelect('style-dots', 'rounded');
      setSelect('style-eye-outer', 'rounded');
      setSelect('style-eye-inner', 'dot');
      break;

    case 'neon-purple':
      setRadio('color-mode', 'gradient');
      setColor('color-grad-1', 'color-grad-1-hex', '#a855f7');
      setColor('color-grad-2', 'color-grad-2-hex', '#f43f5e');
      setSelect('color-grad-type', 'linear');
      document.getElementById('color-grad-angle').value = 45;
      document.getElementById('val-grad-angle').innerText = '45°';
      setColor('color-bg', 'color-bg-hex', '#030303');
      setCheckbox('color-bg-trans', false);
      setCheckbox('custom-eyes-toggle', false);
      setSelect('style-dots', 'extra-rounded');
      setSelect('style-eye-outer', 'extra-rounded');
      setSelect('style-eye-inner', 'dot');
      break;

    case 'gold-dark':
      setRadio('color-mode', 'solid');
      setColor('color-solid', 'color-solid-hex', '#eab308');
      setColor('color-bg', 'color-bg-hex', '#030303');
      setCheckbox('color-bg-trans', false);
      setCheckbox('custom-eyes-toggle', true);
      setColor('color-eye-outer', 'color-eye-outer-hex', '#facc15');
      setColor('color-eye-inner', 'color-eye-inner-hex', '#eab308');
      setSelect('style-dots', 'classy-rounded');
      setSelect('style-eye-outer', 'rounded');
      setSelect('style-eye-inner', 'square');
      break;

    case 'emerald-mint':
      setRadio('color-mode', 'gradient');
      setColor('color-grad-1', 'color-grad-1-hex', '#10b981');
      setColor('color-grad-2', 'color-grad-2-hex', '#047857');
      setSelect('color-grad-type', 'linear');
      document.getElementById('color-grad-angle').value = 135;
      document.getElementById('val-grad-angle').innerText = '135°';
      setColor('color-bg', 'color-bg-hex', '#030303');
      setCheckbox('color-bg-trans', false);
      setCheckbox('custom-eyes-toggle', false);
      setSelect('style-dots', 'rounded');
      setSelect('style-eye-outer', 'extra-rounded');
      setSelect('style-eye-inner', 'dot');
      break;
  }

  const presetLabels = document.querySelectorAll('.logo-preset-btn');
  const activePresetRadio = document.querySelector('input[name="logo-preset"]:checked');
  if (activePresetRadio) {
    presetLabels.forEach(l => l.classList.remove('active'));
    activePresetRadio.closest('.logo-preset-btn').classList.add('active');
  }

  triggerUpdate();
}

// Setup Download / Copy / Share features
function setupExportEvents() {
  // Download PNG
  document.getElementById('btn-download-png').addEventListener('click', () => {
    const { label } = getQRContentAndLabel();
    const filename = sanitizeFilename(label || 'qrcode');
    qrCodeInstance.download({ name: filename, extension: 'png' });
    saveToHistory();
  });

  // Download for printing: high-resolution, print-safe PNG (black on white).
  // PNG always opens as an image (unlike SVG, which many apps open as code),
  // prints sharp and scans reliably.
  document.getElementById('btn-download-svg').addEventListener('click', async () => {
    const { label } = getQRContentAndLabel();
    const filename = sanitizeFilename(label || 'qrcode') + '_impressao';
    try {
      await downloadPrintPNG(filename);
      saveToHistory();
    } catch (e) {
      console.error(e);
      // Fallback to the regular PNG download if anything goes wrong
      qrCodeInstance.download({ name: filename, extension: 'png' });
    }
  });

  // Copy Image to Clipboard
  document.getElementById('btn-copy-img').addEventListener('click', () => {
    const canvas = document.querySelector('#qr-output canvas');
    if (!canvas) {
      alert('QR Code não está pronto para ser copiado.');
      return;
    }

    try {
      canvas.toBlob(blob => {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]).then(() => {
          showToast('Imagem copiada para a área de transferência!');
          saveToHistory();
        }).catch(err => {
          console.error(err);
          alert('Erro ao copiar imagem. Tente fazer o download.');
        });
      });
    } catch (e) {
      console.error(e);
      alert('Este navegador não suporta cópia direta de canvas. Faça o download da imagem.');
    }
  });

  // Copy raw text codes (PIX payload / vCard string)
  document.getElementById('btn-copy-text').addEventListener('click', () => {
    const text = document.getElementById('raw-payload-text').innerText;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Código copiado com sucesso!');
      }).catch(err => {
        console.error(err);
        alert('Erro ao copiar texto.');
      });
    }
  });

  // Share QR Code
  document.getElementById('btn-share').addEventListener('click', () => {
    const canvas = document.querySelector('#qr-output canvas');
    if (!canvas) return;

    if (navigator.share && navigator.canShare) {
      canvas.toBlob(blob => {
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'QR Code Personalizado',
            text: 'Gerado com QRCraft!'
          })
          .then(() => {
            showToast('QR Code compartilhado!');
            saveToHistory();
          })
          .catch(err => {
            if (err.name !== 'AbortError') console.error(err);
          });
        } else {
          alert('Este dispositivo não suporta compartilhamento de arquivos.');
        }
      });
    } else {
      alert('Compartilhamento não suportado neste navegador. Use os botões Copiar ou Download.');
    }
  });

  // Clear History
  document.getElementById('btn-clear-history').addEventListener('click', () => {
    if (confirm('Deseja limpar todo o histórico de QR Codes salvos?')) {
      history = [];
      localStorage.setItem('qr-history', JSON.stringify(history));
      renderHistory();
    }
  });
}

// History Management
function saveToHistory() {
  const { content, label } = getQRContentAndLabel();
  if (!content || content === 'https://exemplo.com.br' || content === 'PIX' || content === 'WIFI:S:;;') return;

  if (history.length > 0 && history[0].value === content) return;

  const canvas = document.querySelector('#qr-output canvas');
  const thumbUrl = canvas ? canvas.toDataURL('image/png', 0.5) : '';

  const historyItem = {
    id: Date.now(),
    title: label,
    type: currentTab,
    value: content,
    thumb: thumbUrl,
    date: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    visuals: getVisualConfig()
  };

  history.unshift(historyItem);
  if (history.length > 10) {
    history.pop();
  }

  localStorage.setItem('qr-history', JSON.stringify(history));
  renderHistory();
}

function loadHistory() {
  const saved = localStorage.getItem('qr-history');
  if (saved) {
    try {
      history = JSON.parse(saved);
      renderHistory();
    } catch (e) {
      console.error('Erro ao ler histórico local:', e);
      history = [];
    }
  }
}

function renderHistory() {
  const container = document.getElementById('history-list');
  if (history.length === 0) {
    container.innerHTML = `
      <div class="history-empty">
        <i data-lucide="history"></i>
        <p>Nenhum QR Code salvo.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = history.map(item => {
    let typeIcon = 'link';
    switch (item.type) {
      case 'whats': typeIcon = 'phone'; break;
      case 'wifi': typeIcon = 'wifi'; break;
      case 'pix': typeIcon = 'banknote'; break;
      case 'email': typeIcon = 'mail'; break;
      case 'vcard': typeIcon = 'contact-2'; break;
      case 'text': typeIcon = 'align-left'; break;
    }

    return `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-thumb">
          <img src="${item.thumb || ''}" alt="QR Thumbnail">
        </div>
        <div class="history-item-info">
          <div class="history-item-title">${item.title}</div>
          <div class="history-item-type">
            <i data-lucide="${typeIcon}"></i>
            <span>${item.date}</span>
          </div>
        </div>
        <div class="history-item-actions">
          <button class="btn-icon btn-restore" title="Recarregar este QR">
            <i data-lucide="refresh-cw"></i>
          </button>
          <button class="btn-icon btn-delete-item" title="Remover">
            <i data-lucide="x"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();

  container.querySelectorAll('.history-item').forEach(itemEl => {
    const id = parseInt(itemEl.getAttribute('data-id'));
    const itemData = history.find(h => h.id === id);

    itemEl.querySelector('.btn-restore').addEventListener('click', (e) => {
      e.stopPropagation();
      restoreQRState(itemData);
    });

    itemEl.querySelector('.btn-delete-item').addEventListener('click', (e) => {
      e.stopPropagation();
      history = history.filter(h => h.id !== id);
      localStorage.setItem('qr-history', JSON.stringify(history));
      renderHistory();
    });
  });
}

// Get the visual inputs configuration to save in history
function getVisualConfig() {
  return {
    colorMode: document.querySelector('input[name="color-mode"]:checked').value,
    solidColor: document.getElementById('color-solid').value,
    grad1: document.getElementById('color-grad-1').value,
    grad2: document.getElementById('color-grad-2').value,
    gradType: document.getElementById('color-grad-type').value,
    gradAngle: document.getElementById('color-grad-angle').value,
    bgColor: document.getElementById('color-bg').value,
    bgTrans: document.getElementById('color-bg-trans').checked,
    customEyes: document.getElementById('custom-eyes-toggle').checked,
    eyeOuterColor: document.getElementById('color-eye-outer').value,
    eyeInnerColor: document.getElementById('color-eye-inner').value,
    styleDots: document.getElementById('style-dots').value,
    styleEyeOuter: document.getElementById('style-eye-outer').value,
    styleEyeInner: document.getElementById('style-eye-inner').value,
    logoPreset: document.querySelector('input[name="logo-preset"]:checked').value,
    logoSize: document.getElementById('logo-size').value,
    logoMargin: document.getElementById('logo-margin').value,
    logoHideDots: document.getElementById('logo-hide-dots').checked,
    customLogoDataUrl: customLogoDataUrl,
    customLogoName: customLogoName
  };
}

// Restore form and visual fields from saved history config
function restoreQRState(item) {
  if (!item) return;

  const tabBtn = document.querySelector(`.tab-btn[data-tab="${item.type}"]`);
  if (tabBtn) tabBtn.click();

  switch (item.type) {
    case 'link':
      document.getElementById('in-link').value = item.value;
      break;

    case 'whats':
      try {
        const urlObj = new URL(item.value);
        const number = urlObj.pathname.replace('/', '');
        const message = urlObj.searchParams.get('text') || '';
        document.getElementById('in-whats-num').value = number;
        document.getElementById('in-whats-msg').value = decodeURIComponent(message);
      } catch (e) {
        document.getElementById('in-whats-num').value = '';
        document.getElementById('in-whats-msg').value = '';
      }
      break;

    case 'wifi':
      const match = item.value.match(/WIFI:T:(.*?);S:(.*?);P:(.*?);;/);
      if (match) {
        document.getElementById('in-wifi-sec').value = match[1];
        document.getElementById('in-wifi-ssid').value = unescapeWifiString(match[2]);
        document.getElementById('in-wifi-pass').value = unescapeWifiString(match[3]);
      }
      break;

    case 'pix':
      document.getElementById('in-pix-key').value = extractPixField(item.value, '26', '01');
      document.getElementById('in-pix-name').value = extractPixField(item.value, '59');
      document.getElementById('in-pix-city').value = extractPixField(item.value, '60');
      document.getElementById('in-pix-amount').value = extractPixField(item.value, '54');
      document.getElementById('in-pix-desc').value = extractPixField(item.value, '62', '05');
      break;

    case 'email':
      try {
        const mailStr = item.value.replace('mailto:', '');
        const parts = mailStr.split('?');
        document.getElementById('in-email-to').value = parts[0];
        if (parts[1]) {
          const params = new URLSearchParams(parts[1]);
          document.getElementById('in-email-sub').value = params.get('subject') || '';
          document.getElementById('in-email-body').value = params.get('body') || '';
        }
      } catch (e) {
        document.getElementById('in-email-to').value = '';
      }
      break;

    case 'vcard':
      const lines = item.value.split('\n');
      let first = '', last = '', phone = '', email = '', org = '', url = '';
      lines.forEach(line => {
        if (line.startsWith('N:')) {
          const nParts = line.replace('N:', '').split(';');
          last = nParts[0] || '';
          first = nParts[1] || '';
        } else if (line.startsWith('TEL;')) {
          phone = line.substring(line.indexOf(':') + 1).trim();
        } else if (line.startsWith('EMAIL;')) {
          email = line.substring(line.indexOf(':') + 1).trim();
        } else if (line.startsWith('ORG:')) {
          org = line.replace('ORG:', '').trim();
        } else if (line.startsWith('URL:')) {
          url = line.replace('URL:', '').trim();
        }
      });
      document.getElementById('in-vc-first').value = first;
      document.getElementById('in-vc-last').value = last;
      document.getElementById('in-vc-phone').value = phone;
      document.getElementById('in-vc-email').value = email;
      document.getElementById('in-vc-org').value = org;
      document.getElementById('in-vc-url').value = url;
      break;

    case 'text':
      document.getElementById('in-text').value = item.value;
      break;
  }

  if (item.visuals) {
    const v = item.visuals;
    
    const rad = document.querySelector(`input[name="color-mode"][value="${v.colorMode}"]`);
    if (rad) {
      rad.checked = true;
      rad.dispatchEvent(new Event('change'));
    }

    document.getElementById('color-solid').value = v.solidColor;
    document.getElementById('color-solid-hex').value = v.solidColor.toUpperCase();
    document.getElementById('color-grad-1').value = v.grad1;
    document.getElementById('color-grad-1-hex').value = v.grad1.toUpperCase();
    document.getElementById('color-grad-2').value = v.grad2;
    document.getElementById('color-grad-2-hex').value = v.grad2.toUpperCase();
    document.getElementById('color-grad-type').value = v.gradType;
    document.getElementById('color-grad-angle').value = v.gradAngle;
    document.getElementById('val-grad-angle').innerText = `${v.gradAngle}°`;

    document.getElementById('color-bg').value = v.bgColor;
    document.getElementById('color-bg-hex').value = v.bgColor.toUpperCase();
    document.getElementById('color-bg-trans').checked = v.bgTrans;

    document.getElementById('custom-eyes-toggle').checked = v.customEyes;
    document.getElementById('custom-eyes-toggle').dispatchEvent(new Event('change'));
    document.getElementById('color-eye-outer').value = v.eyeOuterColor;
    document.getElementById('color-eye-outer-hex').value = v.eyeOuterColor.toUpperCase();
    document.getElementById('color-eye-inner').value = v.eyeInnerColor;
    document.getElementById('color-eye-inner-hex').value = v.eyeInnerColor.toUpperCase();
    
    document.getElementById('style-dots').value = v.styleDots;
    document.getElementById('style-eye-outer').value = v.styleEyeOuter;
    document.getElementById('style-eye-inner').value = v.styleEyeInner;

    customLogoDataUrl = v.customLogoDataUrl;
    customLogoName = v.customLogoName;

    const logoSettingControls = document.getElementById('logo-settings-controls');
    const logoFileName = document.getElementById('logo-file-name');
    const logoRemoveBtn = document.getElementById('logo-remove-btn');

    if (v.logoPreset === 'custom' && customLogoDataUrl) {
      logoFileName.innerText = customLogoName;
      logoRemoveBtn.classList.remove('hidden');
      logoSettingControls.classList.remove('hidden');

      const presetLabels = document.querySelectorAll('.logo-preset-btn');
      presetLabels.forEach(l => {
        l.classList.remove('active');
        l.querySelector('input').checked = false;
      });
    } else {
      const radioLogo = document.querySelector(`input[name="logo-preset"][value="${v.logoPreset}"]`);
      if (radioLogo) {
        radioLogo.checked = true;
        const lbl = radioLogo.closest('.logo-preset-btn');
        const presetLabels = document.querySelectorAll('.logo-preset-btn');
        presetLabels.forEach(l => l.classList.remove('active'));
        if (lbl) lbl.classList.add('active');
      }

      logoFileName.innerText = 'Nenhuma imagem';
      logoRemoveBtn.classList.add('hidden');

      if (v.logoPreset !== 'none') {
        logoSettingControls.classList.remove('hidden');
      } else {
        logoSettingControls.classList.add('hidden');
      }
    }

    document.getElementById('logo-size').value = v.logoSize;
    document.getElementById('val-logo-size').innerText = `${Math.round(v.logoSize * 100)}%`;
    document.getElementById('logo-margin').value = v.logoMargin;
    document.getElementById('val-logo-margin').innerText = `${v.logoMargin}px`;
    document.getElementById('logo-hide-dots').checked = v.logoHideDots;

    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.preset-btn[data-preset="custom"]').classList.add('active');
  }

  showToast('QR Code e configurações restaurados!');
  triggerUpdate();
}

// Download a PRINT-SAFE PNG: high resolution, always dark modules on a white
// background, regardless of the on-screen theme. A printed QR must be
// dark-on-light to be visible on paper and to scan reliably. PNG is used (not
// SVG) because a PNG always opens as an image — SVG files get opened as code
// by many apps, which confuses non-technical users.
async function downloadPrintPNG(filename) {
  const PRINT_DARK = '#000000';
  const PRINT_LIGHT = '#ffffff';
  const PRINT_SIZE = 2048; // sharp enough for posters, stickers, flyers

  // Clone the current QR options and force print-safe colors (no gradients).
  const opts = JSON.parse(JSON.stringify(qrCodeInstance._options));
  opts.type = 'canvas';
  opts.width = PRINT_SIZE;
  opts.height = PRINT_SIZE;

  opts.dotsOptions = { type: (opts.dotsOptions && opts.dotsOptions.type) || 'square', color: PRINT_DARK };
  opts.cornersSquareOptions = { type: (opts.cornersSquareOptions && opts.cornersSquareOptions.type) || 'square', color: PRINT_DARK };
  opts.cornersDotOptions = { type: (opts.cornersDotOptions && opts.cornersDotOptions.type) || 'square', color: PRINT_DARK };
  opts.backgroundOptions = { ...(opts.backgroundOptions || {}), color: PRINT_LIGHT };

  const printQR = new QRCodeStyling(opts);
  await printQR.download({ name: filename, extension: 'png' });
}

// Utility: Clean names for file downloads
function sanitizeFilename(text) {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/gi, '_') // replace non-alphanumeric with _
    .replace(/_{2,}/g, '_') // collapse double underscores
    .substring(0, 30);
}

// Utility: Get domain name from link
function getDomainName(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch (e) {
    return 'Link';
  }
}

// Custom Toast Message
function showToast(message) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.style.position = 'fixed';
  toast.style.bottom = '2rem';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%) translateY(20px)';
  toast.style.backgroundColor = '#ffffff';
  toast.style.color = '#000000';
  toast.style.padding = '0.75rem 1.5rem';
  toast.style.borderRadius = 'var(--radius-md)';
  toast.style.fontSize = '0.825rem';
  toast.style.fontWeight = '600';
  toast.style.boxShadow = 'var(--shadow-xl)';
  toast.style.zIndex = '9999';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  
  toast.innerText = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Helper to escape characters for WiFi string
function escapeWifiString(val) {
  return val.replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/:/g, '\\:')
            .replace(/"/g, '\\"');
}

function unescapeWifiString(val) {
  return val.replace(/\\;/g, ';')
            .replace(/\\,/g, ',')
            .replace(/\\:/g, ':')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
}

// BR Code static PIX generator helpers
function formatTLV(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function crc16(payload) {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  let bytes = new TextEncoder().encode(payload);

  for (let byte of bytes) {
    crc ^= (byte << 8);
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ polynomial) : (crc << 1);
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function generatePixPayload(key, name, city, amount, txid) {
  name = removeAccents(name || "RECEBEDOR").toUpperCase().substring(0, 25);
  city = removeAccents(city || "SAO PAULO").toUpperCase().substring(0, 15);
  txid = removeAccents(txid || "***").toUpperCase().substring(0, 25);
  if (!txid) txid = "***";

  let cleanKey = key.trim();
  if (/^\d{11}$/.test(cleanKey)) {
    cleanKey = "+55" + cleanKey;
  }

  const parts = [];
  parts.push(formatTLV("00", "01"));
  
  const gui = formatTLV("00", "br.gov.bcb.pix");
  const keyField = formatTLV("01", cleanKey);
  const mInfo = gui + keyField;
  parts.push(formatTLV("26", mInfo));
  
  parts.push(formatTLV("52", "0000"));
  parts.push(formatTLV("53", "986"));
  
  if (amount) {
    const val = parseFloat(amount).toFixed(2);
    parts.push(formatTLV("54", val));
  }
  
  parts.push(formatTLV("58", "BR"));
  parts.push(formatTLV("59", name));
  parts.push(formatTLV("60", city));
  
  const refLabel = formatTLV("05", txid);
  parts.push(formatTLV("62", refLabel));
  
  const payloadBase = parts.join("");
  const payloadWithCRCPlaceholder = payloadBase + "6304";
  const crcVal = crc16(payloadWithCRCPlaceholder);
  
  return payloadWithCRCPlaceholder + crcVal;
}

// Standard vCard 3.0 String builder
function generateVCard(first, last, phone, email, org, url) {
  const parts = ["BEGIN:VCARD", "VERSION:3.0"];
  
  if (first || last) {
    parts.push(`N:${last || ""};${first || ""};;;`);
    parts.push(`FN:${first || ""} ${last || ""}`.trim());
  } else {
    parts.push("N:;;;;");
    parts.push("FN:Contato");
  }
  
  if (phone) parts.push(`TEL;TYPE=CELL,VOICE:${phone}`);
  if (email) parts.push(`EMAIL;TYPE=PREF,INTERNET:${email}`);
  if (org) parts.push(`ORG:${org}`);
  if (url) parts.push(`URL:${url}`);
  
  parts.push("END:VCARD");
  return parts.join("\r\n");
}

// Parser helper to extract PIX TLV field contents from payload (to load back in forms)
function extractPixField(payload, tag, subTag) {
  if (!payload || payload.length < 4) return '';
  
  let i = 0;
  while (i < payload.length) {
    const currentTag = payload.substring(i, i + 2);
    const length = parseInt(payload.substring(i + 2, i + 4));
    const value = payload.substring(i + 4, i + 4 + length);
    
    if (currentTag === tag) {
      if (subTag) {
        return extractPixField(value, subTag);
      }
      return value;
    }
    i += 4 + length;
  }
  return '';
}

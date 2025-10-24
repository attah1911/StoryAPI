import BaseView from '../../base/base-view.js';

class GuestStoryView extends BaseView {
  constructor() {
    super();
    this.onSubmit = null;
    this.onMapClick = null;
    this.selectedLocation = null;
  }

  getTemplate() {
    return `
      <section class="add-story-page">
        <div class="container">
          <div class="add-story-header">
            <h1>Share Your Story as Guest</h1>
            <p>No account needed! Share your coding journey with the Dicoding community</p>
          </div>

          <div class="add-story-content">
            <div class="add-story-form-container">
              <form id="guest-story-form" class="add-story-form">
                <div class="form-group">
                  <label for="description">Story Description *</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    rows="6"
                    placeholder="Share your story..."
                    maxlength="1000"
                    required
                  ></textarea>
                  <small class="char-count"><span id="char-count">0</span>/1000 characters</small>
                </div>

                <div class="form-group">
                  <label>Photo *</label>
                  <div class="photo-input-group">
                    <input 
                      type="file" 
                      id="photo" 
                      name="photo" 
                      accept="image/*"
                      style="display: none;"
                      required
                    />
                    <button type="button" id="choose-file-btn" class="btn btn-secondary">
                      📁 Choose File
                    </button>
                    <button type="button" id="camera-btn" class="btn btn-secondary">
                      📷 Use Camera
                    </button>
                  </div>
                  <small class="help-text">Max size: 1MB. Formats: JPG, PNG, GIF</small>
                  
                  <div id="photo-preview" class="photo-preview" style="display: none;">
                    <img id="preview-image" src="" alt="Photo preview for your story" />
                    <button type="button" id="remove-photo-btn" class="btn-remove" aria-label="Remove photo">✕</button>
                  </div>
                  <div id="photo-name" class="photo-name"></div>
                </div>

                <div id="camera-container" class="camera-container" style="display: none;" role="region" aria-label="Camera capture">
                  <video id="camera-stream" autoplay playsinline aria-label="Camera stream"></video>
                  <div class="camera-controls">
                    <button type="button" id="capture-btn" class="btn btn-primary" aria-label="Capture photo">📸 Capture</button>
                    <button type="button" id="close-camera-btn" class="btn btn-secondary" aria-label="Close camera">✕ Close</button>
                  </div>
                </div>

                <div class="form-group">
                  <label>Location *</label>
                  <div id="guest-story-map" class="add-story-map"></div>
                  <small class="help-text">Click on the map to select location</small>
                  <div id="selected-location" class="selected-location" style="display: none;">
                    <strong>Selected:</strong> 
                    <span id="location-coords"></span>
                    <button type="button" id="clear-location-btn" class="btn-link" aria-label="Clear selected location">Clear</button>
                  </div>
                </div>

                <div id="form-errors" class="form-errors" role="alert" aria-live="polite" style="display: none;"></div>
                <div id="form-success" class="form-success" role="alert" aria-live="polite" style="display: none;"></div>

                <div class="form-actions">
                  <button type="button" id="cancel-btn" class="btn btn-secondary" aria-label="Cancel and go back">
                    Cancel
                  </button>
                  <button type="submit" id="submit-btn" class="btn btn-primary">
                    Share Story
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindEvents() {
    const form = document.getElementById('guest-story-form');
    const description = document.getElementById('description');
    const charCount = document.getElementById('char-count');
    const photoInput = document.getElementById('photo');
    const chooseFileBtn = document.getElementById('choose-file-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const removePhotoBtn = document.getElementById('remove-photo-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const clearLocationBtn = document.getElementById('clear-location-btn');

    if (description && charCount) {
      description.addEventListener('input', () => {
        charCount.textContent = description.value.length;
      });
    }

    if (chooseFileBtn && photoInput) {
      chooseFileBtn.addEventListener('click', () => {
        photoInput.click();
      });

      photoInput.addEventListener('change', (e) => {
        this.handlePhotoSelect(e.target.files[0]);
      });
    }

    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', () => {
        this.removePhoto();
      });
    }

    if (cameraBtn) {
      cameraBtn.addEventListener('click', () => {
        if (this.onCameraCapture) {
          this.onCameraCapture();
        }
      });
    }

    if (clearLocationBtn) {
      clearLocationBtn.addEventListener('click', () => {
        this.clearLocation();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        window.history.back();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.onSubmit) {
          this.onSubmit(this.getFormData());
        }
      });
    }
  }

  handlePhotoSelect(file) {
    if (!file) return;

    const photoName = document.getElementById('photo-name');
    const photoPreview = document.getElementById('photo-preview');
    const previewImage = document.getElementById('preview-image');

    if (photoName) {
      photoName.textContent = `Selected: ${file.name}`;
    }

    if (file.type.startsWith('image/') && photoPreview && previewImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    const photoInput = document.getElementById('photo');
    const photoName = document.getElementById('photo-name');
    const photoPreview = document.getElementById('photo-preview');
    const previewImage = document.getElementById('preview-image');

    if (photoInput) photoInput.value = '';
    if (photoName) photoName.textContent = '';
    if (photoPreview) photoPreview.style.display = 'none';
    if (previewImage) previewImage.src = '';
  }

  setLocation(lat, lon) {
    this.selectedLocation = { lat, lon };
    
    const locationDiv = document.getElementById('selected-location');
    const coords = document.getElementById('location-coords');
    
    if (locationDiv && coords) {
      coords.textContent = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      locationDiv.style.display = 'block';
    }
  }

  clearLocation() {
    this.selectedLocation = null;
    const locationDiv = document.getElementById('selected-location');
    if (locationDiv) {
      locationDiv.style.display = 'none';
    }
    
    if (this.onMapClick) {
      this.onMapClick(null);
    }
  }

  getFormData() {
    const description = document.getElementById('description').value;
    const photoInput = document.getElementById('photo');
    const photo = photoInput.files[0];

    return {
      description,
      photo,
      lat: this.selectedLocation?.lat,
      lon: this.selectedLocation?.lon,
    };
  }

  showErrors(errors) {
    const errorsDiv = document.getElementById('form-errors');
    if (errorsDiv) {
      errorsDiv.innerHTML = `
        <strong>Please fix the following errors:</strong>
        <ul>
          ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
      `;
      errorsDiv.style.display = 'block';
      errorsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    this.hideSuccess();
  }

  hideErrors() {
    const errorsDiv = document.getElementById('form-errors');
    if (errorsDiv) {
      errorsDiv.style.display = 'none';
    }
  }

  showSuccess() {
    const successDiv = document.getElementById('form-success');
    if (successDiv) {
      successDiv.innerHTML = '<strong>✓ Success!</strong> Your story has been shared. Redirecting...';
      successDiv.style.display = 'block';
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    this.hideErrors();
  }

  hideSuccess() {
    const successDiv = document.getElementById('form-success');
    if (successDiv) {
      successDiv.style.display = 'none';
    }
  }

  setSubmitting(isSubmitting) {
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (submitBtn) {
      submitBtn.disabled = isSubmitting;
      submitBtn.textContent = isSubmitting ? 'Sharing...' : 'Share Story';
    }
    
    if (cancelBtn) {
      cancelBtn.disabled = isSubmitting;
    }
  }
}

export default GuestStoryView;


import BaseView from '../../base/base-view.js';
import L from 'leaflet';

class AddStoryView extends BaseView {
  constructor() {
    super();
    this.onSubmit = null;
    this.onMapClick = null;
    this.onCameraCapture = null;
    this.onCameraOpen = null;
    this.selectedLocation = null;
    this.map = null;
    this.marker = null;
  }

  getTemplate() {
    return `
      <section class="add-story-page">
        <div class="container">
          <div class="add-story-header">
            <h1>Share Your Story</h1>
            <p>Share your coding journey with the Dicoding community</p>
          </div>

          <div class="add-story-content">
            <div class="add-story-form-container">
              <form id="add-story-form" class="add-story-form">
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
                  <div id="add-story-map" class="add-story-map"></div>
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
    const form = document.getElementById('add-story-form');
    const description = document.getElementById('description');
    const charCount = document.getElementById('char-count');
    const photoInput = document.getElementById('photo');
    const chooseFileBtn = document.getElementById('choose-file-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const removePhotoBtn = document.getElementById('remove-photo-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const clearLocationBtn = document.getElementById('clear-location-btn');
    const captureBtn = document.getElementById('capture-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');

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

    if (cameraBtn && this.onCameraOpen) {
      cameraBtn.addEventListener('click', () => {
        this.onCameraOpen();
      });
    }

    if (captureBtn && this.onCameraCapture) {
      captureBtn.addEventListener('click', () => {
        this.onCameraCapture();
      });
    }

    if (closeCameraBtn) {
      closeCameraBtn.addEventListener('click', () => {
        this.closeCamera();
      });
    }

    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', () => {
        this.clearPhoto();
      });
    }

    if (clearLocationBtn) {
      clearLocationBtn.addEventListener('click', () => {
        this.clearLocation();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.navigateToStories();
      });
    }

    if (form && this.onSubmit) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.onSubmit();
      });
    }

    this.escapeKeyHandler = (e) => {
      if (e.key === 'Escape') {
        const cameraContainer = document.getElementById('camera-container');
        if (cameraContainer && cameraContainer.style.display !== 'none') {
          this.closeCamera();
        }
      }
    };

    document.addEventListener('keydown', this.escapeKeyHandler);
  }

  handlePhotoSelect(file) {
    if (!file) return;

    const preview = document.getElementById('photo-preview');
    const previewImage = document.getElementById('preview-image');
    const photoName = document.getElementById('photo-name');

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      preview.style.display = 'block';
      photoName.textContent = `Selected: ${file.name}`;
    };
    reader.readAsDataURL(file);
  }

  clearPhoto() {
    const photoInput = document.getElementById('photo');
    const preview = document.getElementById('photo-preview');
    const photoName = document.getElementById('photo-name');

    photoInput.value = '';
    preview.style.display = 'none';
    photoName.textContent = '';
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
  }

  hideErrors() {
    const errorsDiv = document.getElementById('form-errors');
    if (errorsDiv) {
      errorsDiv.style.display = 'none';
    }
  }

  showSuccess(message) {
    const successDiv = document.getElementById('form-success');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  setSubmitting(isSubmitting) {
    const submitBtn = document.getElementById('submit-btn');
    const form = document.getElementById('add-story-form');
    
    if (submitBtn) {
      submitBtn.disabled = isSubmitting;
      submitBtn.textContent = isSubmitting ? '📤 Sharing...' : 'Share Story';
    }

    if (form) {
      const inputs = form.querySelectorAll('input, textarea, button');
      inputs.forEach(input => {
        if (input.id !== 'submit-btn') {
          input.disabled = isSubmitting;
        }
      });
    }
  }

  initMap() {
    const mapContainer = document.getElementById('add-story-map');
    if (!mapContainer) return;

    this.map = L.map('add-story-map').setView([-2.5489, 118.0149], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on('click', (e) => {
      if (this.onMapClick) {
        this.onMapClick(e.latlng);
      }
    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  addMapMarker(lat, lng) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAyNCAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMEMxOC42MjcgMCAyNCA1LjM3MyAyNCAxMmMwIDkuNjI3LTEyIDI0LTEyIDI0UzAgMjEuNjI3IDAgMTJDMCA1LjM3MyA1LjM3MyAwIDEyIDB6IiBmaWxsPSIjZmYwMDAwIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
        iconSize: [32, 45],
        iconAnchor: [16, 45],
        popupAnchor: [0, -45],
      }),
    }).addTo(this.map);

    this.marker.bindPopup('Selected location').openPopup();
    this.setLocation(lat, lng);
  }

  removeMapMarker() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  async openCamera() {
    const cameraContainer = document.getElementById('camera-container');
    const video = document.getElementById('camera-stream');

    if (!cameraContainer || !video) return null;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        } 
      });

      video.srcObject = mediaStream;
      cameraContainer.style.display = 'block';
      cameraContainer.scrollIntoView({ behavior: 'smooth' });

      return mediaStream;

    } catch (error) {
      this.showErrors([`Camera error: ${error.message}`]);
      return null;
    }
  }

  closeCamera() {
    const cameraContainer = document.getElementById('camera-container');
    const video = document.getElementById('camera-stream');

    if (cameraContainer) {
      cameraContainer.style.display = 'none';
    }

    if (video && video.srcObject) {
      const stream = video.srcObject;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }

  getCameraStream() {
    const video = document.getElementById('camera-stream');
    return video;
  }

  updatePhotoInput(file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    const photoInput = document.getElementById('photo');
    photoInput.files = dataTransfer.files;

    this.handlePhotoSelect(file);
  }

  navigateToStories() {
    window.location.hash = '#/stories';
  }

  cleanupEventListeners() {
    if (this.escapeKeyHandler) {
      document.removeEventListener('keydown', this.escapeKeyHandler);
    }
  }
}

export default AddStoryView;


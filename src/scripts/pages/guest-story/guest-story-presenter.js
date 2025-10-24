import BasePresenter from '../../base/base-presenter.js';
import GuestStoryModel from './guest-story-model.js';
import GuestStoryView from './guest-story-view.js';
import L from 'leaflet';

class GuestStoryPresenter extends BasePresenter {
  constructor() {
    const model = new GuestStoryModel();
    const view = new GuestStoryView();
    
    super(model, view);
    this.map = null;
    this.marker = null;
    this.mediaStream = null;
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    this.initMap();
    this.setupCamera();
    
    this.view.onSubmit = async () => {
      await this.handleSubmit();
    };

    this.view.onMapClick = (location) => {
      if (location === null) {
        this.clearMapSelection();
      }
    };

    this.view.onCameraCapture = () => {
      this.openCamera();
    };

    this.view.bindEvents();
  }

  initMap() {
    const mapContainer = document.getElementById('guest-story-map');
    if (!mapContainer) return;

    this.map = L.map('guest-story-map').setView([-2.5489, 118.0149], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on('click', (e) => {
      this.handleMapClick(e.latlng);
    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  handleMapClick(latlng) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([latlng.lat, latlng.lng], {
      icon: L.icon({
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAyNCAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMEMxOC42MjcgMCAyNCA1LjM3MyAyNCAxMmMwIDkuNjI3LTEyIDI0LTEyIDI0UzAgMjEuNjI3IDAgMTJDMCA1LjM3MyA1LjM3MyAwIDEyIDB6IiBmaWxsPSIjZmYwMDAwIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
        iconSize: [32, 45],
        iconAnchor: [16, 45],
        popupAnchor: [0, -45],
      }),
    }).addTo(this.map);

    this.marker.bindPopup('Selected location').openPopup();
    this.view.setLocation(latlng.lat, latlng.lng);
  }

  clearMapSelection() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }

  setupCamera() {
    const captureBtn = document.getElementById('capture-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');

    if (captureBtn) {
      captureBtn.addEventListener('click', () => {
        this.capturePhoto();
      });
    }

    if (closeCameraBtn) {
      closeCameraBtn.addEventListener('click', () => {
        this.closeCamera();
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

  async openCamera() {
    const cameraContainer = document.getElementById('camera-container');
    const video = document.getElementById('camera-stream');

    if (!cameraContainer || !video) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        } 
      });
      
      video.srcObject = this.mediaStream;
      cameraContainer.style.display = 'block';
    } catch (error) {
      this.view.showErrors([`Camera error: ${error.message}`]);
    }
  }

  capturePhoto() {
    const video = document.getElementById('camera-stream');
    const canvas = document.createElement('canvas');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const photoInput = document.getElementById('photo');
      photoInput.files = dataTransfer.files;
      
      this.view.handlePhotoSelect(file);
      this.closeCamera();
    }, 'image/jpeg', 0.9);
  }

  closeCamera() {
    this.stopMediaStream();
    
    const cameraContainer = document.getElementById('camera-container');
    if (cameraContainer) {
      cameraContainer.style.display = 'none';
    }
  }

  stopMediaStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
      
      const video = document.getElementById('camera-stream');
      if (video) {
        video.srcObject = null;
      }
    }
  }

  async handleSubmit() {
    const formData = this.view.getFormData();
    
    const validationErrors = this.model.validateStory(formData);
    
    if (validationErrors.length > 0) {
      this.view.showErrors(validationErrors);
      return;
    }

    this.view.hideErrors();
    this.view.setSubmitting(true);

    try {
      await this.model.createGuestStory(formData);
      
      this.view.showSuccess();
      this.view.setSubmitting(false);
      
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);
    } catch (error) {
      this.view.setSubmitting(false);
      this.view.showErrors([`Failed to share story: ${error.message}`]);
    }
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.closeCamera();
    
    if (this.escapeKeyHandler) {
      document.removeEventListener('keydown', this.escapeKeyHandler);
    }
  }
}

export default GuestStoryPresenter;


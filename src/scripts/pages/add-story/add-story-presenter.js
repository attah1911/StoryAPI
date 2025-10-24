import BasePresenter from '../../base/base-presenter.js';
import AddStoryModel from './add-story-model.js';
import AddStoryView from './add-story-view.js';
import IndexedDB from '../../utils/indexed-db.js';

class AddStoryPresenter extends BasePresenter {
  constructor() {
    const model = new AddStoryModel();
    const view = new AddStoryView();
    
    super(model, view);
    this.mediaStream = null;
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    this.view.initMap();
    
    this.view.onSubmit = async () => {
      await this.handleSubmit();
    };

    this.view.onMapClick = (latlng) => {
      if (latlng === null) {
        this.clearMapSelection();
      } else {
        this.handleMapClick(latlng);
      }
    };

    this.view.onCameraOpen = async () => {
      await this.openCamera();
    };

    this.view.onCameraCapture = () => {
      this.capturePhoto();
    };

    this.view.bindEvents();
  }

  handleMapClick(latlng) {
    this.view.addMapMarker(latlng.lat, latlng.lng);
  }

  clearMapSelection() {
    this.view.removeMapMarker();
  }

  async openCamera() {
    this.mediaStream = await this.view.openCamera();
  }

  capturePhoto() {
    const video = this.view.getCameraStream();
    const canvas = document.createElement('canvas');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      
      this.view.updatePhotoInput(file);
      this.view.closeCamera();
    }, 'image/jpeg', 0.9);
  }

  async handleSubmit() {
    this.view.hideErrors();

    const formData = this.view.getFormData();
    
    const validation = this.model.validateStory(formData);

    if (!validation.isValid) {
      this.view.showErrors(validation.errors);
      return;
    }

    this.view.setSubmitting(true);

    try {
      await this.model.createStory(formData);
      
      this.view.showSuccess('✓ Story shared successfully! Redirecting...');
      
      setTimeout(() => {
        this.view.navigateToStories();
      }, 1500);

    } catch (error) {
      if (!navigator.onLine || error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        try {
          await IndexedDB.addOfflineStory(formData);
          this.view.setSubmitting(false);
          this.view.showSuccess('📴 Saved offline! Will sync when online.');
          
          setTimeout(() => {
            this.view.navigateToStories();
          }, 2000);
        } catch (offlineError) {
          this.view.setSubmitting(false);
          this.view.showErrors([`Failed to save offline: ${offlineError.message}`]);
        }
      } else {
        this.view.setSubmitting(false);
        this.view.showErrors([`Failed to share story: ${error.message}`]);
      }
    }
  }

  destroy() {
    this.view.destroyMap();
    this.view.closeCamera();
    this.view.cleanupEventListeners();
  }
}

export default AddStoryPresenter;


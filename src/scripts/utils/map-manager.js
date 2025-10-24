import L from 'leaflet';

class MapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markers = [];
    this.markerLayer = null;
    this.onMarkerClick = null;
    this.onMapMove = null;
  }

  initMap(center = [-2.5489, 118.0149], zoom = 5) {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(this.containerId).setView(center, zoom);

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri',
      maxZoom: 19,
    });

    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap contributors',
      maxZoom: 17,
    });

    osmLayer.addTo(this.map);

    const baseMaps = {
      'Street Map': osmLayer,
      'Satellite': satelliteLayer,
      'Terrain': terrainLayer,
    };

    L.control.layers(baseMaps).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    if (this.onMapMove) {
      this.map.on('moveend', () => {
        const bounds = this.map.getBounds();
        this.onMapMove(bounds);
      });
    }

    return this.map;
  }

  addMarkers(stories) {
    this.clearMarkers();

    stories.forEach((story, index) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon], {
          icon: this.createCustomIcon(),
        });

        const popupContent = `
          <div class="marker-popup">
            <img src="${story.photoUrl}" alt="Story photo by ${story.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${story.name}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${this.truncateText(story.description, 100)}</p>
            <small style="color: #999;">${new Date(story.createdAt).toLocaleDateString()}</small>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (this.onMarkerClick) {
            this.onMarkerClick(story, index);
          }
        });

        this.markerLayer.addLayer(marker);
        this.markers.push({ marker, story, index });
      }
    });
  }

  createCustomIcon() {
    return L.icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAyNCAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMEMxOC42MjcgMCAyNCA1LjM3MyAyNCAxMmMwIDkuNjI3LTEyIDI0LTEyIDI0UzAgMjEuNjI3IDAgMTJDMCA1LjM3MyA1LjM3MyAwIDEyIDB6IiBmaWxsPSIjNDA0MGZmIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
      iconSize: [32, 45],
      iconAnchor: [16, 45],
      popupAnchor: [0, -45],
    });
  }

  highlightMarker(index) {
    this.markers.forEach((item, i) => {
      if (i === index) {
        const marker = item.marker;
        const story = item.story;
        
        marker.setIcon(L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAyNCAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMEMxOC42MjcgMCAyNCA1LjM3MyAyNCAxMmMwIDkuNjI3LTEyIDI0LTEyIDI0UzAgMjEuNjI3IDAgMTJDMCA1LjM3MyA1LjM3MyAwIDEyIDB6IiBmaWxsPSIjZmYwMDAwIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
          iconSize: [38, 54],
          iconAnchor: [19, 54],
          popupAnchor: [0, -54],
        }));
        
        this.map.setView([story.lat, story.lon], this.map.getZoom(), {
          animate: true,
          duration: 0.5,
        });
        
        marker.openPopup();
      } else {
        item.marker.setIcon(this.createCustomIcon());
        item.marker.closePopup();
      }
    });
  }

  clearMarkers() {
    this.markerLayer.clearLayers();
    this.markers = [];
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

export default MapManager;


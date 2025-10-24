import BaseModel from '../../base/base-model.js';
import StoryService from '../../services/story-service.js';

class StoryDetailModel extends BaseModel {
  constructor() {
    super();
    this.story = null;
  }

  async fetchData(storyId) {
    const response = await StoryService.getStoryDetail(storyId);
    this.story = response.story;
    return this.story;
  }

  getStory() {
    return this.story;
  }
}

export default StoryDetailModel;


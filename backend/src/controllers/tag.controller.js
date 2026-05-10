const tagService = require('../services/tag.service');

class TagController {
  async getTags(req, res) {
    try {
      const { workspaceId } = req.user;
      const tags = await tagService.getTags(workspaceId);
      res.ok(200, tags);
    } catch (error) {
      res.handleError(error);
    }
  }
}

module.exports = new TagController();

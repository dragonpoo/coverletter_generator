import {Router} from 'express';
import ToolController from './tool_controller';
const router = Router({ mergeParams: true });
router.post('/tools/gpt', ToolController.generateCoverletter);
router.post('/tools/models', ToolController.getModels);

export default router

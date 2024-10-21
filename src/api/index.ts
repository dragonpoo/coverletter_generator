import {Router} from 'express';
import ToolController from './tool_controller';
const router = Router({ mergeParams: true });
router.post('/tools/gpt', ToolController.generateCoverletter);
router.post('/tools/models', ToolController.getModels);
router.post('/tools/generate/name', ToolController.generateName);

export default router
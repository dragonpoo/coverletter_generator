import {Router} from 'express';
import bidderController from './bidder_controller';
import creatorController from './creator_controller';
import emailController from './email_controller';
const router = Router();
router.get('/bidder/check', bidderController.check);
router.get('/bidder/start', bidderController.start);
router.get('/bidder/stop', bidderController.stop);

router.get('/creator/check', creatorController.check);
router.get('/creator/start', creatorController.start);
router.get('/creator/stop', creatorController.stop);

router.get('/email/check', emailController.check);
router.get('/email/start', emailController.start);
router.get('/email/stop', emailController.stop);

export default router;
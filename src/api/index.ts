import {Router} from 'express';
import ServiceRouter from './service/index';
import ScreenshotController from './screenshot_controller';
import OSController from './os_controller';
import RoleController from './role_controller';
import SettingController from './setting_controller';
import ToolController from './tool_controller';
import CandidateController from './candidate_controller';
import AccountController from './account_controller';
import BidController from './bid_controller';
import JobsController from './job_controller';
import FileController from './file_controller';
import upload from '../middleware/multer';
import { UPStore } from '../store';
import { measureEnd, measureStart } from '../utils';
const router = Router({ mergeParams: true });
router.use('/service', ServiceRouter);
router.get('/screenshot/account/:email/:width?/:height?', ScreenshotController.account);
router.get('/screenshot/creator//:width?/:height?', ScreenshotController.creator);
router.get('/screenshot/bidder//:width?/:height?', ScreenshotController.bidder);
router.get('/screenshot/email//:width?/:height?', ScreenshotController.email);
router.get('/os/stats', OSController.getStats);
router.get('/os/dbstats/:table/:grouplen/:column?', OSController.getDBStats);

router.get('/candidate', CandidateController.getCandidates);
router.get('/candidate/generate/:email', CandidateController.generateCandidates);
router.post('/candidate/clear', CandidateController.clearCandidates);
router.get('/account', AccountController.getAccounts);
router.post('/account/suspend/:id', AccountController.suspendAccounts);
router.post('/account/empty/:id', AccountController.emptyAccounts);
router.get('/bid', BidController.getBids);
router.get('/job', JobsController.getJobs);
router.get('/role', RoleController.getRoles);
router.post('/role/enable/:id/:enabled', RoleController.enableRole);
router.get('/setting', SettingController.getSetting);
router.post('/setting', SettingController.saveSetting);
router.post('/tools/gpt', ToolController.generateCoverletter);
router.post('/tools/models', ToolController.getModels);
router.post('/tools/generate/name', ToolController.generateName);
router.get('/tools/job/:id', ToolController.getJobById);
router.get('/tools/profile/:id', ToolController.getProfileById);

router.post('/file', upload.single('file'), FileController.uploadFile);
router.post('/file/enable/:id/:enabled', FileController.enableFile);
router.get('/file', FileController.getFiles);
router.delete('/file/:id', FileController.deleteFile);

router.get('/admin/store', (req: any, res: any) => {
    res.json(UPStore);
})
router.get('/admin/measure/start/:type', (req: any, res: any) => {
    measureStart(req.cookies.email, req.params.type);
    res.json(UPStore);
})
router.get('/admin/measure/end/:type', (req: any, res: any) => {
    measureEnd(req.cookies.email, req.params.type);
    res.json(UPStore);
})
export default router
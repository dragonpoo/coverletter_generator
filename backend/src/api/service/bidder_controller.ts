import { startBidderService, stopBidderService } from "../../job_seeker_service";
import { UPStore } from "../../store";
const check = async (req: any, res: any) => {
    res.json({enabled: !!UPStore.bidderService(req.cookies.email).enabled});
}
const start = async (req: any, res: any) => {
    startBidderService(req.cookies.email);
    res.send(true);
}
const stop =  async (req: any, res: any) => {
    stopBidderService(req.cookies.email);
    res.send(true);
}

export default {check, start, stop}
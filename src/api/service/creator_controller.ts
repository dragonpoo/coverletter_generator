import { startCreatorService, stopCreatorService } from "../../account_creator";
import { UPStore } from "../../store";

const check = async (req: any, res: any) => {
    res.json({enabled: !!UPStore.creatorService(req.cookies.email).enabled});
}
const start = async (req: any, res: any) => {
    startCreatorService(req.cookies.email);
    res.send(true);
}
const stop = async (req: any, res: any) => {
    stopCreatorService(req.cookies.email);
    res.send(true);
}

export default {check,start,stop}
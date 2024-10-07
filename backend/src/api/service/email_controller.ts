import { startEmailService, stopEmailChecker } from "../../email_checker";
import { UPStore } from "../../store";

const check = async (req: any, res: any) => {
    res.json({enabled: !!UPStore.emailService(req.cookies.email).enabled});
}
const start = async (req: any, res: any) => {
    startEmailService(req.cookies.email);
    res.send(true);
}
const stop = async (req: any, res: any) => {
    stopEmailChecker(req.cookies.email);
    res.send(true);
}

export default {check, start, stop}
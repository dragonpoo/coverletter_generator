import { generateEmailList } from '../utils';
import { AppDataSource } from '../data-source';
import { Candidate } from '../entity/Candidate';
const getCandidates = async (req: any, res: any) => {
    const [candidates, count] = await AppDataSource.manager.findAndCount(Candidate, {where: {owner_email: req.cookies.email}});
    res.send({candidates, count});
}
const generateCandidates = async (req: any, res: any) => {
    const baseEmail = req.params.email;
    const list = generateEmailList(baseEmail);
    //{email: email, owner_email: req.cookies.email}
    const candidates = list.map(email => {
        const candidate = new Candidate()
        candidate.email = email;
        candidate.owner_email = req.cookies.email;
        return candidate;
    });
    const ret = await AppDataSource.manager.getRepository(Candidate).save(candidates);
    res.send(ret);
}
const clearCandidates = async (req: any, res: any) => {
    //{email: email, owner_email: req.cookies.email}
    const ret = await AppDataSource.manager.getRepository(Candidate).delete({});
    res.send(ret);
}
export default {getCandidates, generateCandidates, clearCandidates}
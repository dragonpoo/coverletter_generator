import { AppDataSource } from '../data-source';
import { Job } from '../entity/Job';
const getJobs = async (req: any, res: any) => {
  let qwhere:any = {owner_email: req.cookies.email};
  const jobs = await AppDataSource.manager.find(Job, {where: qwhere, select: {skills: true}});
  res.json(jobs);
}

export default {getJobs}
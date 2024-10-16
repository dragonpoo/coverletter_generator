import { getSignUpSocketByEmail } from '../store';
import { AppDataSource } from '../data-source';
import { Bid } from '../entity/Bid';
import { ILike } from 'typeorm';
import { Job } from '../entity/Job';
import { Account } from '../entity/Account';
const getBids = async (req: any, res: any) => {
  const keyword = req?.query?.keyword || '';
  let qwhere:any = [
    {
      letter: ILike(`%${keyword}%`), 
    }, 
    {
      email: ILike(`%${keyword}%`), 
    },
  ];
  const [data, count] = await AppDataSource.getRepository(Bid).findAndCount({where: qwhere, order: {created_at: 'DESC'}, skip: req.query.start, take: req.query.end - req.query.start});
  for(const bid of data) {
    bid.jobobj = await AppDataSource.getRepository(Job).findOne({where: {id : bid.job}}) || new Job;
    bid.emailobj = await AppDataSource.getRepository(Account).findOne({where: {email : bid.email}}) || new Account;
  }
  res.send({data, count});
}

export default {getBids}
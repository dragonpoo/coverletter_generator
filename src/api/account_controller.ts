import { getSignUpSocketByEmail } from '../store';
import { AppDataSource } from '../data-source';
import { Account } from '../entity/Account';
import { ILike } from 'typeorm';
import { Settings } from '../settings';
const getAccounts = async (req: any, res: any) => {
  const keyword = req?.query?.keyword || '';
  const messagedonly = req.query.messagedonly;
  let qwhere:any = [
    {
      status: ILike(`%${keyword}%`), 
      owner_email: req.cookies.email,
    }, 
    {
      email: ILike(`%${keyword}%`), 
      owner_email: req.cookies.email,
    }, 
    {
      json: {
        lastname: ILike(`%${keyword}%`)
      },
      owner_email: req.cookies.email,
    },
    {
      json: {
        firstname: ILike(`%${keyword}%`)
      },
      owner_email: req.cookies.email,
    },
    {
      json: {
        role: ILike(`%${keyword}%`)
      },
      owner_email: req.cookies.email,
    },
  ];
  if(messagedonly == 'true') qwhere.map((q: any) => {q.gotmessaged = true});
  const [data, count] = await AppDataSource.getRepository(Account).findAndCount({where: qwhere, order: {status: 'ASC', created_at: 'DESC'}, skip: req.query.start, take: req.query.end - req.query.start});
  data.map(account => {
    const sock = getSignUpSocketByEmail(account.email);
    account.running = !!sock;
  });
  res.send({data, count});
}

const suspendAccounts = async (req: any, res: any) => {
  const account = await AppDataSource.getRepository(Account).findOneBy({id: req.params.id});
  if(account) {
    account.status = Settings.Constants.STATUS_ACTION_REQUIRED;
    await AppDataSource.getRepository(Account).save(account);
    res.send(account);
  } else {
    res.send({})
  }
}

const emptyAccounts = async (req: any, res: any) => {
  const account = await AppDataSource.getRepository(Account).findOneBy({id: req.params.id});
  if(account) {
    account.status = Settings.Constants.STATUS_OUT_OF_CONNECT;
    await AppDataSource.getRepository(Account).save(account);
    res.send(account);
  } else {
    res.send({})
  }
}

export default {getAccounts, suspendAccounts, emptyAccounts}
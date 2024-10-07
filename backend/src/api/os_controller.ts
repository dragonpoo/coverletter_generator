import os = require('os-utils');
import { Settings } from '../settings';
import { AppDataSource } from '../data-source';
import { Bid } from '../entity/Bid';
import { Account } from '../entity/Account';
import { Job } from '../entity/Job';
import { EntityTarget, In } from 'typeorm';
import moment = require('moment');
const getStats = async (req: any, res: any) => {
    const cpuUsage = await new Promise((resolve, reject) => {
      os.cpuUsage(function(v: any){
        resolve(v);
      });
    });
    const freeMem = os.freememPercentage();

    const bidcount = await AppDataSource.manager.count(Bid);
    const messaged = await AppDataSource.manager.countBy(Account, {gotmessaged: true});
    const accountcount = await AppDataSource.manager.countBy(Account, {status: In([Settings.Constants.STATUS_ACTION_REQUIRED, Settings.Constants.STATUS_COMPLETED, Settings.Constants.STATUS_OUT_OF_CONNECT])});
    const candicount = await AppDataSource.manager.countBy(Account, {status: Settings.Constants.STATUS_COMPLETED});
    const projectcount = await AppDataSource.manager.count(Job);
  
    res.send({freeMem: freeMem, cpuUsage: cpuUsage, bidcount, messaged, accountcount, candicount, projectcount});
}
const getDBStats = async (req: any, res: any) => {
  const column = req.params.column || 'created_at';
  let tablemodel:EntityTarget<any> = Account;
  if(req.params.table == 'bid') tablemodel = Bid;
  if(req.params.table == 'jobs') tablemodel = Job;
  let arr = await AppDataSource.getRepository(tablemodel).createQueryBuilder("tbl").select('tbl.' + column).getMany();
  let resp: any = {};
  for(const item of arr) {
    if(!item[column]) continue;
    const key = moment(item[column]).format("YYYY-MM-DD").substring(0, req.params.grouplen);
    if(resp[key]) resp[key]++;
    else resp[key] = 1;
  }
  res.send(resp);
}
export default {getStats, getDBStats}
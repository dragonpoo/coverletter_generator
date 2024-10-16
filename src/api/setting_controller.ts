import { getSignUpSocketByEmail } from '../store';
import { AppDataSource } from '../data-source';
import { Bid } from '../entity/Bid';
import { ILike } from 'typeorm';
import { Job } from '../entity/Job';
import { Setting } from '../entity/Setting';
const getSetting = async (req: any, res: any) => {
  let qwhere:any = {
    owner_email: req.cookies.email, 
  };
  const settings = await AppDataSource.getRepository(Setting).find({where: qwhere});
  res.send(settings);
}

const saveSetting = async (req: any, res: any) => {
  const {value} = req.body;
  let qwhere:any = {
    owner_email: req.cookies.email, 
  };
  const setting = await AppDataSource.getRepository(Setting).findOne({where: qwhere});
  if(setting) {
    setting.value = value;
    await AppDataSource.getRepository(Setting).save(setting);
    res.send({setting});
  } else {
    const newsetting = new Setting();
    newsetting.value = value;
    newsetting.owner_email = req.cookies.email;
    await AppDataSource.getRepository(Setting).save(newsetting);
    res.send({setting});
  }
}

export default {getSetting, saveSetting}
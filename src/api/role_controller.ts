import { AppDataSource } from '../data-source';
import { Role } from '../entity/Role';
import { Settings } from '../settings';
import { getAccountByRole } from '../utils';
  
const getRoles = async (req: any, res: any) => {
    const roles = await AppDataSource.manager.findBy(Role, {owner_email: req.cookies.email});
    for(let role of roles) {
        const ac = await getAccountByRole(role.id);
        role.account_created = ac.length;
        role.account_messaged = ac.filter(a=>a.gotmessaged).length;
        role.account_live = ac.filter(a=>a.status == Settings.Constants.STATUS_COMPLETED).length;
    }
    res.send(roles);
}

const enableRole = async (req: any, res: any) => {
    const role = await AppDataSource.getRepository(Role).findOneBy({id: req.params.id});
    if(role) {
        role.enabled = req.params.enabled == 'true';
        await AppDataSource.getRepository(Role).save(role);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
}

export default {getRoles, enableRole}
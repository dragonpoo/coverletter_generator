import { AppDataSource } from '../data-source';
import { Account } from '../entity/Account';
import { File } from '../entity/File';
const uploadFile = async (req: any, res: any) => {
  // Handle the uploaded file
  const file = new File();
  file.filename = req.file.filename;
  file.owner_email = req.cookies.email;
  await file.save();

  res.json({ uploaded: file, success: true });
}
const getFiles = async (req: any, res: any) => {
  const files = await AppDataSource.manager.find(File, {where: {owner_email: req.cookies.email}});
    for(let file of files) {
      const ac = await AppDataSource.manager.find(Account, {where: {avatar: file.id}, select: {gotmessaged: true}});      
      file.account_created = ac.length;
      file.account_messaged = ac.filter(a=>a.gotmessaged).length;
    };
    res.json(files);
}
const deleteFile = async (req: any, res: any) => {
  await AppDataSource.manager.delete(File, {id: req.params.id});
  res.json({ success: true });
}
const enableFile = async (req: any, res: any) => {
  const file = await AppDataSource.getRepository(File).findOneBy({id: req.params.id});
  if(file) {
    file.enabled = req.params.enabled == 'true';
    await AppDataSource.getRepository(File).save(file);
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
}

export default { uploadFile, getFiles, deleteFile, enableFile }
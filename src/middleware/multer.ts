import multer = require('multer')
// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, './uploads/avatar/');
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create the multer instance
const upload = multer({ storage: storage });

export default upload
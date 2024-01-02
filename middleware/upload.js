const multer = require('multer')

// Set up storage for uploaded files
const partyStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.env.EVENT_MEDIA_ROOT);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.env.PROFILE_MEDIA_ROOT);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
// Create the multer instance
const partyUpload = multer({ storage: partyStorage }).array('pictures', 6);
const profileUpload = multer({ storage: profileStorage }).single('picture');

module.exports = { partyUpload, profileUpload }
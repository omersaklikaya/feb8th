const fs = require('fs');
const path = require('path');

const ASSETS = path.join('C:', 'Users', 'Omer', '.cursor', 'projects', 'c-Users-Omer-Desktop-yildonumu-feb8th', 'assets');
const PREFIX = 'c__Users_Omer_AppData_Roaming_Cursor_User_workspaceStorage_56f174d2eaee5116079d525c47b6f332_images_';
const DEST = path.join(__dirname, '..', 'images', 'hero-decor');

const files = [
  'bf8d2acfb04d480ead7b3cea363f2909-removebg-preview-889fccb5-497c-4837-b8b8-4d67e87e35f5.png',
  '33e6b04c359639e6b17951036737a1f2-removebg-preview__4_-removebg-preview-d49044ea-0f51-47cc-8376-06ffbad1c7d9.png',
  '76af21919133efda9521964cbbfb6791-removebg-preview-633d3259-f7c2-43d2-8ec1-670d1da58011.png',
  'c320e5d9c71c31edbadc32209108df6c-removebg-preview-ea509c1a-9226-4f21-9972-e16eb13350f9.png',
  '14a05e5546665126c9b1a9308376f1fa-removebg-preview-ccf0943a-fe78-4cd2-93e0-22a34ab4c82c.png',
  'ef8bb42dd767355321660fb08928bc3d-removebg-preview-6e889dd9-ba4b-4c51-a8af-4cd3cb3ac7dc.png',
  '95207dbe9753f73bdbfd7ee25129bd75-removebg-preview-cebd7868-bcda-49be-be90-ef3a614406ea.png',
  'f1938509ba8ba6165382a839978cdd7f-removebg-preview-ce6a6942-4e0d-4b6e-8de1-59b1a8e9b952.png',
  '79572693dabe4582a289c59c24295737-removebg-preview-b4f60915-06e4-4f36-b60c-33ad4558e9ed.png',
  'b37d87762895683805ae2cdd29647bab-removebg-preview-0dc9d61b-9462-4a6c-ad76-89d15190bb30.png',
  '5ebf05aeed0f07876cb3a41ee6208fc7-removebg-preview-a9682095-9387-45a6-9eec-1a4f504d364a.png'
];

for (let i = 0; i < files.length; i++) {
  const src = path.join(ASSETS, PREFIX + files[i]);
  const dest = path.join(DEST, `hero-${i + 1}.png`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`hero-${i + 1}.png`);
  } else {
    console.warn('Bulunamadı:', src);
  }
}
console.log('Bitti.');

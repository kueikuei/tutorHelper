const express = require('express');
const app = express();
app.get('/setRichmenu',(req, res) => {
    console.log('req',req.query.id)
  res.send('Hello World!');
});
app.listen(3000, () => {
  console.log('Listening on port 3000...');
});
//偵測連線，並傳入一個callback function
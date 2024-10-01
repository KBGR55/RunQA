var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/privado/:external', function(req, res, next) {
  require('dotenv').config();
  const llave=req.params.external;
  const env=process.env.KEY_SQ;
  if(llave === env){
    var models=require('./../models');
    models.sequelize.sync().then(()=>{
      console.log('Se ha conectado la bd');
      res.send('OK!');
    }).catch(err=>{
      console.log(err,"Hubo un error");
      res.send("Error");
    })
  }else{
    res.send("Llave incorrecta!");
  }
});
module.exports = router;
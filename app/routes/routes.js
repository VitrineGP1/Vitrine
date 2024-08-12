var express = require("express");
var router = express.Router();


router.get("/", function (req, res) {
    res.render("pages/index", {resultado:null, valores:{salario:""}})
});

router.post("/calcular-reajuste", function (req, res) {

    let salario = Number(req.body.salario);

    if(salario <= 1400){
        var percentual = "15";
        var aumento = salario * 0.15;
    }else if(salario <= 4500){
        var percentual = "10";
        var aumento = salario * 0.1;
    }else if(salario <= 10000){
        var percentual = "7,5";
        var aumento = salario * 0.075;
    }else{
        var percentual = "5";
        var aumento = salario * 0.05;
    }
    let novoSalario = salario + aumento;

    let ObjJson = {"salario":salario, "percentual":percentual,
                    "aumento":aumento,"novosalario":novoSalario};

    res.render("pages/index", {resultado:ObjJson,valores:{salario:req.body.salario}})                    

});



module.exports = router;
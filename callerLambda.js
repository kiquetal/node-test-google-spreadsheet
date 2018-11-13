var toLambda=require("./toLambda")

toLambda.handler("event",null,function(err,res){
    console.log("LLEGANDO DE LA LLAMADA");
    if (err)
    {
        console.log("HUBO ERROR EN LA LLAMADA" + JSON.stringify(err));
    }
    else
    {
        console.log("FINALIZADO EXITOSAMENTE " + JSON.stringify(res))
    }

});
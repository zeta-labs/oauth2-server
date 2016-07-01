var express = require('express');
var cors = require('cors');
var http = require('http');
var bodyParser = require('body-parser');
var oauthserver = require('node-oauth2-server');
var routes = require('./routes_pg.js');
// var routes = require('./routes_mongo.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var request = require('request');

//MIDDLEWARES
app.use(cors());
app.use(cookieParser());
app.use(session({secret: 'FFKPSDFKPWFKPW24324-09cd'}));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

//OAUTH Model configurations
app.oauth = oauthserver({
    model: require('./model_pg.js'),
    // model: require('./model_mongo.js'),
    grants: ['password', 'authorization_code'],
    debug: true,
    accessTokenLifetime: 60 * 60 * 24,
    clientIdRegex: '^[A-Za-z0-9-_\^]{5,36}$'
});

// ROUTES
app.get('/:view?', function(req, res){
  var teste = req.params.view || 'index';
  res.sendFile('/' + teste + '.html', { root: __dirname+'/views' },function(error){
    if(error){
      res.sendStatus(404);
    }
  });
});

app.all('/oauth/token', app.oauth.grant());
app.post('/user'  , routes.user);
app.post('/client', routes.client);
app.post('/login' , routes.login);

app.get('/api/users/me', app.oauth.authorise(), function(req,res) {
    res.json({
    "uri": "http://zetainfo.dyndns.info:5000/api/v1",
    "port": process.argv[2] || 9999,
    "data": {
      "id": 18,
      "username": "rafael",
      "email": null,
      "token": "488ce17d-3e31-4563-8907-eff771b8735a",
      "profile": {
        "codfuncionario": 18,
        "nome": "RAFAEL MUHLENHOFF",
        "nomecompleto": "RAFAEL MUHLENHOFF",
        "tipologradouro": "R",
        "pessoa": "F",
        "endereco": "Aristides Franca",
        "complemento": "589",
        "complemento2": null,
        "bairro": "Cidade Jardim",
        "cep": 83035170,
        "cidade": "Sao Jose dos Pinhais",
        "uf": "PR",
        "pais": "BRASIL",
        "tipologradourocob": "Al",
        "endcobranca": null,
        "complementocobranca": null,
        "complementocobranca2": null,
        "bairrocobranca": null,
        "cidadecobranca": null,
        "ufcobranca": null,
        "cepcobranca": 0,
        "paiscobranca": null,
        "tipologradouroent": "Al",
        "endentrega": null,
        "complementoentrega": null,
        "complementoentrega2": null,
        "bairroentrega": null,
        "cidadeentrega": null,
        "ufentrega": null,
        "cepentrega": 0,
        "paisentrega": null,
        "datanasc": 66382,
        "ierg": "6353718-7",
        "rgtipo": null,
        "rgdataemissao": 0,
        "cpf_cgc": "00771213921",
        "comissao": 0,
        "comissaoservicos": 0,
        "situacao": "N",
        "dataadmissao": 75671,
        "datacadastramento": 74364,
        "dependentes": 1,
        "codqualificacao": 0,
        "codsituacao": 0,
        "codtipo": 1,
        "carteiratrabalho": "0077996-00010",
        "pis": "12678637532",
        "remuneracao": 2000,
        "inscmunicipal": null,
        "estadocivil": 22,
        "nacionalidade": null,
        "natural": "Curitiba",
        "contabancaria": " C/P: 013 001213260",
        "ultimavenda": 76813,
        "razaosocial": null,
        "cgc": null,
        "registroprefeitura": null,
        "entidaderelacionada1": 0,
        "entidaderelacionada2": 0,
        "entidaderelacionada3": 0,
        "campo1": "0767110306-04",
        "campo2": "15007229111-8",
        "campo3": null,
        "auxiliar1": 41,
        "auxiliar2": 49,
        "auxiliar3": 0,
        "tag": 0,
        "turno1entrada": 0,
        "turno1saida": 0,
        "turno2entrada": 0,
        "turno2saida": 0,
        "turno3entrada": 0,
        "turno3saida": 0,
        "codigobarras": null,
        "sexo": "M",
        "numeroregistro": null,
        "fone": "(41) 3283-4645",
        "fax": null,
        "codincluidor": 2,
        "incluidor": "ELAINE",
        "codalterador": 101,
        "alterador": "ANELISE",
        "codigoagencia": "0406",
        "codigobanco": null,
        "nomebanco": null,
        "nometitularconta": null,
        "incarqremessa": null,
        "campo4": null,
        "campo5": null,
        "campo6": null,
        "cbo": 0,
        "insalubridade": 0,
        "bonificacao": 0,
        "cepestrangeiro": "0",
        "datademissao": 0,
        "datapgmtrescisao": 0,
        "valorrescisao": 0,
        "valorgrfc": 0,
        "motivodemissao": null,
        "quebracontrato": 0,
        "sindicato": 0,
        "aviso": 0,
        "assinaturadigital": null,
        "nomepai": "Armiro Muhlenhoff",
        "nomemae": "Zita Perbiche Muhlenhoff",
        "setor": "Administrativo",
        "funcao": "Comprador",
        "docmilitar": "0",
        "numerohabilitacao": "0",
        "categoriahabilitacao": null,
        "salariocomplementar": 300,
        "codfilial": 1,
        "codregrafunc": 0,
        "observacoescnh": null,
        "codsetor": 1,
        "codfuncao": 13,
        "codlocalidadeibge": 4125506,
        "codufibge": 41,
        "codpaisibge": 1058,
        "metasprodutos": 0,
        "metasservicos": 0,
        "ultimomov": 0,
        "tipodocultimomov": null,
        "numerodocultimomov": null,
        "profissao": null,
        "codprofissao": 1,
        "codtabelapreco": 0,
        "codcadastroaprovado": 0,
        "limicred": 0,
        "saldodev": 0,
        "codtabelapreco2": 0,
        "desctabelapreco": null,
        "desctabelapreco2": null,
        "percentualmargemlucro": 0,
        "rgufemissao": null,
        "titulozona": null,
        "tituloeleitor": "0",
        "docmilitarserie": null,
        "docmilitarcategoria": null,
        "carttrabalhoserie": null,
        "carttrabalhodtemissao": 0,
        "carttrabalhoufemissao": null,
        "dataexphabilitacao": 0,
        "datanascconjuge": 0,
        "nomefilhos": "Guilherme Muhlenhoff",
        "aceitaviajar": 0,
        "estadialitoral": null,
        "estadiainterior": null,
        "instrucao": "4",
        "completo": 0,
        "curso": null,
        "conhorassemanais": 0,
        "conhorasdiarias": 0,
        "conaux1": null,
        "condeschorario": null,
        "conproduto": null,
        "conaux2": null,
        "condatacontrato": 0,
        "carro": 0,
        "moto": 0,
        "titulosecao": null,
        "nomefilial": "Foggiatto Lataria e Pintura Ltda",
        "codtabprecoservico": 0,
        "suframa": null,
        "rntc": 0,
        "emailusuario": null,
        "emailendereco": null,
        "emailservidor": null,
        "emailporta": 0,
        "emailnome": null,
        "emailsenha": null,
        "emailautenticacaosmtp": 1,
        "dataultimaatualizacao": null,
        "horaultimaatualizacao": "00:00:00",
        "codmigracao": null,
        "dataprimeiraadmissao": 0,
        "periculosidade": 0,
        "listarentregaitensos": 0,
        "cpfcnpjresponsavelcontabanco": null,
        "validatitularconta": 0,
        "horasvendidasmetamedia": 0,
        "observacoes": "A partir de Março/2016 passou a receber Ajuda de custo R$ 70.",
        "alerta": null,
        "atividades": null,
        "habiliades": null,
        "experiencias": null
      },
      "system": {
        "type": "zw15"
      },
      "organizations": [{
        "id": 1,
        "code": "01 SJ - Lataria Foggiatto",
        "profile": {
          "codigo": 1,
          "razaosocial": "Foggiatto Lataria e Pintura Ltda",
          "padrao": 1,
          "matriz": 0,
          "nomefantasia": "Foggiatto Lataria e Pintura",
          "endereco": "Cap.Benjamim Claudino Ferreira",
          "numero": "1811",
          "complemento": null,
          "bairro": "Centro",
          "cep": "83005390",
          "cidade": "São José dos Pinhais",
          "uf": "PR",
          "cnpj": "01298240000187",
          "inscest": "9011482284",
          "inscmun": null,
          "fone": "33821828",
          "fax": "32821521",
          "sigla": null,
          "site": null,
          "email": null,
          "compraslinha1": "Foggiatto",
          "compraslinha2": "CNPJ: 01.298.240/0001-87 - Insc.Est.: 9011482284",
          "compraslinha3": "Rua Cap.Benjamim Claudino Ferreira, 1811",
          "compraslinha4": "Centro - São José dos Pinhais/PR",
          "compraslinha5": "Fone: (41) 3382-1828 Fax: (41) 3523-7501",
          "vendaslinha1": "Foggiatto",
          "vendaslinha2": "CNPJ: 01.298.240/0001-87 - Insc.Est.: 9011482284",
          "vendaslinha3": "Rua Cap.Benjamim Claudino Ferreira, 1811",
          "vendaslinha4": "Centro - São José dos Pinhais/PR",
          "vendaslinha5": "Fone: (41) 3382-1828 Fax: (41) 3523-7501",
          "fluxolinha1": "Foggiatto",
          "fluxolinha2": "01.298.240/0001-87",
          "fluxolinha3": "Centro - São José dos Pinhais/PR",
          "fluxolinha4": "Rua Cap.Benjamim Claudino Ferreira, 1811",
          "fluxolinha5": "Fone: (41) 3382-1828 Fax: (41) 3523-7501",
          "logodados": "D:\\ZetaMec\\Logo_Fog.jpg",
          "logocompras": "F:\\Zetamec\\Logo_Fog.jpg",
          "logovendas": "F:\\Zetamec\\Logo_Fog.jpg",
          "logofluxo": "F:\\Zetamec\\Logo_Fog.jpg",
          "imgfundovendas": null,
          "impressora": null,
          "cnae": "4520001",
          "cnpjcertificado": "01298240000187",
          "papelparede": "D:\\ZetaMec\\logoBaseMECCT.jpg",
          "papelparedelayout": 3,
          "regimetributario": 1,
          "incentivadorcultural": 0,
          "optantesimplesnacional": 4,
          "regimeespecialtributacao": 1,
          "codmunicipio": 4106902,
          "tipologradouro": "Rua",
          "codigosuframa": null,
          "codigonaturezajuridica": "0",
          "pais": "Brasil",
          "codpaisibge": "1058",
          "inscmunst": null,
          "listadeemails": "fernando@grupofoggiatto.com.br|fiscal1@ecmcontabilidade.com|eliasneves2006@gmail.com",
          "rntrc": null,
          "habilitaspedfiscal": 0,
          "habilitaefdcontribuicoes": 0,
          "codigobasecalculocredito": 0,
          "regimeespecialtributacaogeral": 1,
          "emailusuario": "envionfe@grupofoggiatto.com.br",
          "emailendereco": "envionfe@grupofoggiatto.com.br",
          "emailnome": "Foggiatto Lataria e Pintura",
          "emailservidor": "email-ssl.com.br",
          "emailporta": 465,
          "emailsenha": "envionfe2015",
          "codufibge": "41",
          "emailautenticacaossl": 1,
          "percentualsimplesnacional": 0,
          "percentualcreditoicmssimplesnacional": 0
        }
      }, {
        "id": 3,
        "code": "03 SJ - Centro Auto",
        "profile": {
          "codigo": 3,
          "razaosocial": "CENTRO AUTOMOTIVO FOGGIATTO LTDA",
          "padrao": 0,
          "matriz": 0,
          "nomefantasia": "Foggiatto Lataria e Pintura",
          "endereco": "Cap.Benjamim Claudino Ferreira",
          "numero": "1814",
          "complemento": null,
          "bairro": "Centro",
          "cep": "83005-390",
          "cidade": "São José Pinhais",
          "uf": "PR",
          "cnpj": "07396152000102",
          "inscest": "9033988173",
          "inscmun": null,
          "fone": null,
          "fax": null,
          "sigla": null,
          "site": null,
          "email": null,
          "compraslinha1": null,
          "compraslinha2": null,
          "compraslinha3": null,
          "compraslinha4": null,
          "compraslinha5": null,
          "vendaslinha1": null,
          "vendaslinha2": null,
          "vendaslinha3": null,
          "vendaslinha4": null,
          "vendaslinha5": null,
          "fluxolinha1": null,
          "fluxolinha2": null,
          "fluxolinha3": null,
          "fluxolinha4": null,
          "fluxolinha5": null,
          "logodados": "D:\\ZetaMec\\Logo_Fog.jpg",
          "logocompras": null,
          "logovendas": null,
          "logofluxo": null,
          "imgfundovendas": null,
          "impressora": null,
          "cnae": "4530703",
          "cnpjcertificado": "07396152000102",
          "papelparede": null,
          "papelparedelayout": 0,
          "regimetributario": 3,
          "incentivadorcultural": 0,
          "optantesimplesnacional": 0,
          "regimeespecialtributacao": 1,
          "codmunicipio": 4125506,
          "tipologradouro": "Rua",
          "codigosuframa": null,
          "codigonaturezajuridica": "1",
          "pais": "Brasil",
          "codpaisibge": "1058",
          "inscmunst": null,
          "listadeemails": "fiscal1@ecmcontabilidade.com|fernando@grupofoggiatto.com.br|eliasneves2006@gmail.com",
          "rntrc": null,
          "habilitaspedfiscal": 0,
          "habilitaefdcontribuicoes": 0,
          "codigobasecalculocredito": 0,
          "regimeespecialtributacaogeral": 1,
          "emailusuario": "envionfe@grupofoggiatto.com.br",
          "emailendereco": "envionfe@grupofoggiatto.com.br",
          "emailnome": "Foggiatto Lataria e Pintura",
          "emailservidor": "email-ssl.com.br",
          "emailporta": 465,
          "emailsenha": "envionfe2015",
          "codufibge": "41",
          "emailautenticacaossl": 1,
          "percentualsimplesnacional": 0,
          "percentualcreditoicmssimplesnacional": 0
        }
      }]
    }
  });
});

app.get('/oauth/authorize', function (req, res, next) {
    if (!req.session.user) {
      var path        = '/login?redirect=' + req.path,
          clientId    = '&client_id='      + req.query.client_id,
          redirectUri = '&redirect_uri='   + req.query.redirect_uri;
      return res.redirect(path + clientId + redirectUri);
    }
    req.body.allow = 'yes';
    next();
  },app.oauth.authCodeGrant(function (req, next) {
    next(null, req.body.allow === 'yes', req.session.user, req.session.user);
    })
);

app.post('/oauth/authorize', function (req, res, next) {
    if (!req.session.user) {
      var clientId    = '/login?client_id=' + req.query.client_id,
          redirectUri = '&redirect_uri='    + req.query.redirect_uri;
      return res.redirect(clientId + redirectUri);
    }
    req.body.allow = 'yes';
    next();
  }, app.oauth.authCodeGrant(function (req, next) {
    next(null, req.body.allow === 'yes', req.session.user, req.session.user);
}));

app.all('/api/services/:id/*', app.oauth.authorise(), function(req,res) {

  var baseUri = 'http://zetainfo.dyndns.info:5001/api/v1';
  var url = baseUri + req.url.split(req.params.id)[1];

  var headers = req.headers;
  var bearer = headers.authorization.split(' ')[1];
  headers.authorization = 'Token token=37bdbddb-d295-439b-8074-a58a727ad20e';

  req.pipe(request({
    url: url,
    headers: headers
  })).pipe(res);
});

//SERVER
var server = http.createServer(app);

server.listen(process.argv[2] || 9999, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Web server listening at http://%s:%s', host, port);
});

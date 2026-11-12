(function(G){
const L=[
{n:'Principiante',d:1,t:420,p:.4,ms:300,e:1320,r:450,w:'Joga quase ao acaso e deixa peças penduradas.'},
{n:'Principiante avançado',d:1,t:300,p:.22,ms:300,e:1400,r:650,w:'Já pega peças de graça, mas erra bastante.'},
{n:'Médio iniciante',d:2,t:220,p:.12,ms:400,e:1500,r:850,w:'Vê ameaças simples e ainda comete deslizes.'},
{n:'Médio',d:2,t:150,p:.06,ms:500,e:1650,r:1050,w:'Joga de forma decente, com erros ocasionais.'},
{n:'Médio avançado',d:3,t:100,p:.03,ms:700,e:1800,r:1250,w:'Raramente perde peças sem motivo.'},
{n:'Difícil iniciante',d:4,t:60,p:0,ms:900,e:1950,r:1450,w:'Táticas curtas quase sempre corretas.'},
{n:'Difícil',d:5,t:30,p:0,ms:1000,e:2150,r:1700,w:'Joga firme e pune erros.'},
{n:'Difícil avançado',d:64,t:0,p:0,ms:1500,e:2400,r:2000,w:'Motor completo, sem a ajuda do Stockfish.'},
{n:'Impossível',d:64,t:0,p:0,ms:3000,e:0,r:2300,w:'Força máxima, com o Stockfish supervisionando.'}
];
G.XLevels=L;
if(typeof module!=='undefined')module.exports=L;
})(globalThis);

(function(G){
const O=[
{n:'Abertura Italiana',m:['e2e4','e7e5','g1f3','b8c6','f1c4'],w:'As brancas desenvolvem o bispo para c4, mirando o ponto fraco f7, e preparam o roque.'},
{n:'Ruy Lopez (Abertura Espanhola)',m:['e2e4','e7e5','g1f3','b8c6','f1b5'],w:'O bispo pressiona o cavalo que defende o peão de e5. É uma das aberturas mais estudadas do xadrez.'},
{n:'Abertura Escocesa',m:['e2e4','e7e5','g1f3','b8c6','d2d4'],w:'As brancas abrem o centro cedo para ganhar espaço e atividade.'},
{n:'Defesa Petrov',m:['e2e4','e7e5','g1f3','g8f6'],w:'As pretas contra-atacam o peão de e4 em vez de defender o de e5. É sólida e simétrica.'},
{n:'Gambito do Rei',m:['e2e4','e7e5','f2f4'],w:'As brancas oferecem um peão para dominar o centro e atacar rápido.'},
{n:'Defesa Siciliana',m:['e2e4','c7c5'],w:'As pretas disputam o centro com um peão de flanco e criam um jogo desequilibrado.'},
{n:'Defesa Francesa',m:['e2e4','e7e6','d2d4','d7d5'],w:'As pretas montam uma estrutura sólida e depois atacam o centro com ...c5.'},
{n:'Defesa Caro-Kann',m:['e2e4','c7c6','d2d4','d7d5'],w:'Muito sólida: o peão de c6 prepara ...d5 sem enfraquecer a posição.'},
{n:'Defesa Escandinava',m:['e2e4','d7d5'],w:'As pretas atacam o centro de imediato, forçando a troca de peões.'},
{n:'Gambito da Dama',m:['d2d4','d7d5','c2c4'],w:'As brancas oferecem um peão para ganhar o controle do centro. Se for aceito, elas recuperam depois.'},
{n:'Defesa Eslava',m:['d2d4','d7d5','c2c4','c7c6'],w:'As pretas protegem d5 com o peão de c6 e mantêm o centro firme.'},
{n:'Sistema Londres',m:['d2d4','d7d5','c1f4'],w:'Montagem simples e segura: bispo em f4, peões em e3 e c3 e cavalos desenvolvidos.'},
{n:'Defesa Índia do Rei',m:['d2d4','g8f6','c2c4','g7g6'],w:'As pretas deixam as brancas ocuparem o centro e depois o atacam com peões e peças.'},
{n:'Defesa Nimzo-Índia',m:['d2d4','g8f6','c2c4','e7e6','b1c3','f8b4'],w:'O bispo prende o cavalo de c3 e luta pelo controle da casa e4.'},
{n:'Abertura Inglesa',m:['c2c4'],w:'As brancas controlam d5 pelo flanco e mantêm o jogo flexível.'},
{n:'Abertura do Peão do Rei',m:['e2e4'],w:'O lance mais popular: ocupa o centro e abre caminho para bispo e dama.',g:1},
{n:'Abertura do Peão da Dama',m:['d2d4'],w:'Ocupa o centro com um peão protegido pela dama.',g:1},
{n:'Abertura Réti',m:['g1f3'],w:'O cavalo sai primeiro e as brancas decidem a estrutura de peões depois.',g:1}
];
G.XOpen=O;
if(typeof module!=='undefined')module.exports=O;
})(globalThis);

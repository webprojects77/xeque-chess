import chess,chess.engine,sys,json,os,multiprocessing as mp
OP=["e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6","e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6","e4 e6 d4 d5 Nc3 Nf6 Bg5 Be7","d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7","d4 Nf6 c4 g6 Nc3 Bg7 e4 d6","Nf3 d5 g3 Nf6 Bg2 e6 O-O Be7","c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5","e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4","e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5","d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4","e4 g6 d4 Bg7 Nc3 d6 Nf3 Nf6","e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5"]
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def eng(w):
    e=chess.engine.SimpleEngine.popen_uci(['node',ROOT+'/uci.js'])
    e.configure({'Weights':w})
    return e
def game(a):
    i,wo,wn,mt=a
    b=chess.Board()
    for s in OP[(i//2)%len(OP)].split():b.push_san(s)
    nw=(i%2==0)
    ew=eng(wn if nw else wo);eb=eng(wo if nw else wn)
    try:
        while not b.is_game_over(claim_draw=True) and b.ply()<300:
            e=ew if b.turn==chess.WHITE else eb
            r=e.play(b,chess.engine.Limit(time=mt))
            if r.move is None:break
            b.push(r.move)
    finally:
        ew.quit();eb.quit()
    w=0.5
    if b.is_game_over(claim_draw=True):
        res=b.result(claim_draw=True)
        w=1.0 if res=='1-0' else 0.0 if res=='0-1' else 0.5
    return w if nw else 1-w
if __name__=='__main__':
    wo,wn,n,mt=sys.argv[1],sys.argv[2],int(sys.argv[3]),float(sys.argv[4])
    with mp.Pool(max(1,min(4,mp.cpu_count()))) as p:
        r=p.map(game,[(i,wo,wn,mt) for i in range(n)],chunksize=1)
    v=sum(1 for x in r if x==1.0);d=sum(1 for x in r if x==0.5);l=sum(1 for x in r if x==0.0)
    print(json.dumps({"v":v,"e":d,"d":l,"score":sum(r)/len(r)}))

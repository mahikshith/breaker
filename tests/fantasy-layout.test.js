import test from 'node:test';
import assert from 'node:assert/strict';
import { playfield } from '../prototypes/fantasy/layout.js';
import { Bellforge } from '../src/fantasy/bellforge.js';
import { Tidewheel } from '../src/fantasy/tidewheel.js';

test('short previews, phones and rotated windows retain a full playable world', () => {
  for (const [vw,vh] of [[393,852],[412,915],[320,568],[1280,600],[900,400],[852,393],[1366,768]]) {
    const w=Math.min(vw,vh*.51428,520), layout=playfield(w,vh);
    assert.ok(layout.height>=700);
    assert.ok(layout.paddleY>=580);
    assert.ok(layout.height-layout.paddleY>=90);
    for(const Model of [Bellforge,Tidewheel]){
      const game=new Model(layout);
      game.launch();game.update(.05);
      assert.equal(game.state,'play');
    }
  }
});

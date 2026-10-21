import {db,DB_KEYS} from './db';

test('full reset removes all teams, shared tools and legacy data without restoring pending writes',()=>{
 jest.useFakeTimers();
 const keys=[...Object.values(DB_KEYS),'balkiz_chat_v1','prokordi_sessions_v1','prokordi_team2_classes','prokordi_fold_badge_v1','prokordi_packing_5days_v2','prokordi_collage_before_remove'];
 keys.forEach(key=>localStorage.setItem(key,JSON.stringify(['saved'])));
 localStorage.setItem('unrelated-app','keep');
 db.save('prokordi_team2_classes',['pending']);
 db.clearAll();
 jest.runOnlyPendingTimers();
 db.flush();
 keys.forEach(key=>expect(localStorage.getItem(key)).toBeNull());
 expect(db.load('prokordi_team2_classes',[])).toEqual([]);
 expect(localStorage.getItem('unrelated-app')).toBe('keep');
 localStorage.removeItem('unrelated-app');
 jest.useRealTimers();
});

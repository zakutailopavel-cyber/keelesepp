import { beforeEach } from 'vitest';
const api = vi.hoisted(() => ({ batches: [], collection: vi.fn((_db, name) => name), doc: vi.fn((...p) => p.join('/')), getDocs: vi.fn(), writeBatch: vi.fn() }));
vi.mock('firebase/firestore', () => api);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'db' }) }));
import { maintenanceService } from './maintenance.js';
beforeEach(() => { api.batches.length = 0; api.writeBatch.mockImplementation(() => { const batch = { update: vi.fn(), delete: vi.fn(), set: vi.fn(), commit: vi.fn().mockResolvedValue() }; api.batches.push(batch); return batch; }); });
it('commits an audit for every data chunk, including every affected identifier', async () => {
 const ids = Array.from({ length: 401 }, (_, i) => `m${i}`);
 await maintenanceService.deleteMessages(ids, { uid: 'admin' });
 expect(api.batches).toHaveLength(2);
 expect(api.batches[0].delete).toHaveBeenCalledTimes(400);
 expect(api.batches[0].set.mock.calls[0][1].meta.messageIds).toHaveLength(400);
 expect(api.batches[1].set.mock.calls[0][1].meta.messageIds).toEqual(['m400']);
});
it('does not commit data independently from its audit', async () => {
 await maintenanceService.closeHomework([{ id: 'h1' }], { uid: 'admin' });
 expect(api.batches).toHaveLength(1);
 expect(api.batches[0].update).toHaveBeenCalledOnce();
 expect(api.batches[0].set.mock.calls[0][1].type).toBe('maintenance.homework_closed');
 expect(api.batches[0].commit).toHaveBeenCalledOnce();
});

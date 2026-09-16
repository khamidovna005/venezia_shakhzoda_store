import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { date } from '../lib/format.js';

export default function Customers({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .users()
      .then((res) => setUsers(res.users))
      .catch((err) => toast(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.messageUser(target.telegramId, text);
      toast(`${target.firstName}ga xabar yuborildi ✓`);
      setTarget(null);
      setText('');
    } catch (err) {
      toast(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mijozlar</h1>
          <p>Jami {users.length} ta ro‘yxatdan o‘tgan foydalanuvchi</p>
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <div className="spinner" />
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="ico">👥</div>
            Mijozlar yo‘q
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ism</th>
                  <th>Telegram</th>
                  <th>Telefon</th>
                  <th>Til</th>
                  <th>Buyurtmalar</th>
                  <th>Ro‘yxatdan o‘tgan</th>
                  <th style={{ width: 50 }} />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="cell-main">
                      {u.firstName} {u.lastName || ''}
                    </td>
                    <td>
                      {u.username ? `@${u.username}` : '—'}
                      <div className="cell-sub">
                        <code>{u.telegramId}</code>
                      </div>
                    </td>
                    <td>{u.phone ? <a href={`tel:${u.phone}`}>{u.phone}</a> : '—'}</td>
                    <td>{u.language.toUpperCase()}</td>
                    <td>
                      <span className="badge grey">{u._count.orders}</span>
                    </td>
                    <td className="cell-sub">{date(u.createdAt)}</td>
                    <td>
                      <button className="icon-btn" title="Xabar yuborish" onClick={() => setTarget(u)}>
                        ✉️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {target && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setTarget(null)}>
          <form className="modal" style={{ maxWidth: 460 }} onSubmit={send}>
            <div className="modal-head">
              <h2>✉️ {target.firstName}ga xabar</h2>
              <button type="button" className="icon-btn" onClick={() => setTarget(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Xabar matni..."
                style={{ minHeight: 120 }}
              />
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setTarget(null)}>
                Bekor
              </button>
              <button type="submit" className="btn" disabled={sending}>
                {sending ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

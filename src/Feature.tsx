import { useMemo, useState } from "react";
import {
  MeshNameInput,
  useNamedPeer,
  usePerPeerValue,
  useSharedTimer,
  type MeshConfig,
  type YRoom,
} from "@baditaflorin/mesh-common";
export type Update = { yesterday: string; today: string; blocker: string; submittedAt: number };
type Props = { room: YRoom | null; config: MeshConfig };
export function isValidUpdate(value: unknown): value is Update {
  if (!value || typeof value !== "object") return false;
  const u = value as Record<string, unknown>;
  return (
    typeof u.yesterday === "string" &&
    (u.yesterday as string).trim().length > 1 &&
    typeof u.today === "string" &&
    (u.today as string).trim().length > 1 &&
    typeof u.blocker === "string" &&
    (u.blocker as string).length <= 160 &&
    typeof u.submittedAt === "number" &&
    Number.isFinite(u.submittedAt)
  );
}
export function Feature({ room, config }: Props) {
  const named = useNamedPeer(config, room),
    timer = useSharedTimer(room, "mesh-remote-retro-standup:timer", { durationMs: 60_000 }),
    updates = usePerPeerValue<Update | null>(room, "mesh-remote-retro-standup:updates", null),
    [y, setY] = useState(""),
    [t, setT] = useState(""),
    [b, setB] = useState("");
  const mine = isValidUpdate(updates.my) ? updates.my : null;
  const board = useMemo(
    () =>
      updates.entries
        .filter((entry): entry is [string, Update] => isValidUpdate(entry[1]))
        .sort((a, b) => a[1].submittedAt - b[1].submittedAt),
    [updates.entries],
  );
  const active = timer.state === "running";
  return (
    <main className="standup">
      <header>
        <p className="eyebrow">Remote retro standup</p>
        <h1>Clear updates. No standup drag.</h1>
        <div className="clock" aria-live="polite">
          <span>
            {active ? "time left" : timer.state === "finished" ? "round complete" : "ready"}
          </span>
          <strong>
            {active
              ? `${Math.ceil((timer.remainingMs ?? 0) / 1000)}s`
              : timer.state === "finished"
                ? "Done"
                : "60s"}
          </strong>
        </div>
      </header>
      <section className="grid">
        <section className="card">
          <p className="eyebrow">Your update</p>
          <MeshNameInput
            label="Display name"
            value={named.name}
            onChange={named.setName}
            placeholder="Your name"
            maxLength={32}
          />
          {!active ? (
            <button className="primary" onClick={() => timer.start(60_000)} disabled={!room}>
              {timer.state === "finished" ? "Start another round" : "Start one-minute timebox"}
            </button>
          ) : mine ? (
            <>
              <blockquote>
                <b>Yesterday</b> {mine.yesterday}
                <br />
                <b>Today</b> {mine.today}
                {mine.blocker && (
                  <>
                    <br />
                    <b>Blocker</b> {mine.blocker}
                  </>
                )}
              </blockquote>
              <p role="status">Your update is recorded once for this device.</p>
            </>
          ) : (
            <>
              <label htmlFor="y">Yesterday</label>
              <input id="y" value={y} onChange={(e) => setY(e.target.value)} />
              <label htmlFor="t">Today</label>
              <input id="t" value={t} onChange={(e) => setT(e.target.value)} />
              <label htmlFor="b">Blocker (optional)</label>
              <input id="b" value={b} onChange={(e) => setB(e.target.value.slice(0, 160))} />
              <button
                className="primary"
                disabled={!room || y.trim().length < 2 || t.trim().length < 2}
                onClick={() =>
                  updates.setMy({
                    yesterday: y.trim(),
                    today: t.trim(),
                    blocker: b.trim(),
                    submittedAt: Date.now(),
                  })
                }
              >
                Save my update
              </button>
            </>
          )}
        </section>
        <section className="card">
          <p className="eyebrow">Team board</p>
          <h2>{board.length} updates</h2>
          {board.length ? (
            <ol>
              {board.map(([id, u]) => (
                <li key={id}>
                  <strong>{named.nameOf(id) || `Peer ${id.slice(0, 5)}`}</strong>
                  <span>Yesterday — {u.yesterday}</span>
                  <span>Today — {u.today}</span>
                  {u.blocker && <span>Blocker — {u.blocker}</span>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty">Updates appear here as teammates finish.</p>
          )}
        </section>
      </section>
    </main>
  );
}

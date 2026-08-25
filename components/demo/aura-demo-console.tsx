"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createDemoRequestId,
  createDemoSession,
  DemoBrowserError,
  getDemoReservations,
  getDemoSession,
  postDemoChat,
  resetDemoSession,
} from "@/lib/aura-demo/browser-client";
import type {
  PublicDemoHandoff,
  PublicDemoMessage,
  PublicDemoReservation,
  PublicDemoSession,
} from "@/lib/aura-demo/contracts";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SupportedLocale } from "@/lib/i18n/locale";

type SessionState = "checking" | "required" | "active";
type PendingAction =
  | "session"
  | "chat"
  | "reservations"
  | "reset"
  | null;

const MAX_MESSAGE_CODEPOINTS = 1_000;
const BUTTON_RELOAD_ATTRIBUTES = { autoComplete: "off" } as Record<string, string>;

function formatTimestamp(value: string, locale: SupportedLocale): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatReservationDate(date: string, time: string, locale: SupportedLocale): string {
  const parsed = new Date(`${date}T${time}`);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function mutationMessage(
  operation: "created" | "updated" | "cancelled",
  copy: Dictionary["demo"],
): string {
  if (operation === "created") return copy.notices.created;
  if (operation === "updated") return copy.notices.updated;
  return copy.notices.cancelled;
}

export function AuraDemoConsole({ locale, copy }: Readonly<{ locale: SupportedLocale; copy: Dictionary["demo"] }>) {
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [session, setSession] = useState<PublicDemoSession | null>(null);
  const [messages, setMessages] = useState<PublicDemoMessage[]>([]);
  const [reservations, setReservations] = useState<PublicDemoReservation[]>([]);
  const [handoff, setHandoff] = useState<PublicDemoHandoff | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<string | null>(null);
  const [retryRequestId, setRetryRequestId] = useState<string | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const busyRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messageLength = Array.from(draft).length;

  const clearSession = useCallback(() => {
    setSessionState("required");
    setSession(null);
    setMessages([]);
    setReservations([]);
    setHandoff(null);
    setRetryRequestId(null);
    setResetArmed(false);
  }, []);

  const handleFailure = useCallback(
    (cause: unknown) => {
      const safeError =
        cause instanceof DemoBrowserError
          ? cause
          : new DemoBrowserError(
              0,
              "NETWORK_ERROR",
              copy.errors.network,
            );
      setError(safeError.message);
      setNotice(null);
      if (safeError.code === "SESSION_REQUIRED") {
        clearSession();
      }
      if (safeError.code === "RATE_LIMITED") {
        setRateLimit(
          safeError.retryAfterSeconds === null
            ? copy.errors.retrySoon
            : copy.errors.retrySeconds.replace("{seconds}", String(safeError.retryAfterSeconds)),
        );
      } else {
        setRateLimit(null);
      }
    },
    [clearSession, copy],
  );

  const refreshSnapshot = useCallback(async () => {
    const current = await getDemoSession(locale);
    setSessionState("active");
    setSession(current.session);
    setMessages(current.messages);
    setHandoff(current.handoff);
    const list = await getDemoReservations(locale);
    setReservations(list.reservations);
  }, [locale]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const current = await getDemoSession(locale);
        if (!active) return;
        setSessionState("active");
        setSession(current.session);
        setMessages(current.messages);
        setHandoff(current.handoff);
        const list = await getDemoReservations(locale);
        if (active) setReservations(list.reservations);
      } catch (cause) {
        if (active) handleFailure(cause);
      }
    })();
    return () => {
      active = false;
    };
  }, [handleFailure, locale]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
    });
  }, [messages]);

  async function runExclusive(
    action: Exclude<PendingAction, null>,
    task: () => Promise<void>,
  ) {
    if (busyRef.current) return;
    busyRef.current = true;
    setPending(action);
    setError(null);
    setRateLimit(null);
    try {
      await task();
    } catch (cause) {
      handleFailure(cause);
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  }

  function handleConnect() {
    void runExclusive("session", async () => {
      if (sessionState === "active") {
        await refreshSnapshot();
        setNotice(copy.notices.synced);
      } else {
        const created = await createDemoSession(locale);
        setSession(created.session);
        await refreshSnapshot();
        setNotice(copy.notices.activated);
      }
      setRetryRequestId(null);
    });
  }

  function handleRefreshReservations() {
    void runExclusive("reservations", async () => {
      const list = await getDemoReservations(locale);
      setReservations(list.reservations);
      setNotice(copy.notices.reservationsRefreshed);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (
      sessionState !== "active" ||
      message === "" ||
      Array.from(message).length > MAX_MESSAGE_CODEPOINTS
    ) {
      return;
    }
    void runExclusive("chat", async () => {
      const requestId = retryRequestId ?? createDemoRequestId(locale);
      try {
        const result = await postDemoChat(message, requestId, locale);
        setRetryRequestId(null);
        setDraft("");
        setMessages((current) => [...current, result.reply]);
        if (result.reservationMutation !== null) {
          setNotice(mutationMessage(result.reservationMutation.operation, copy));
        } else if (result.handoff !== null) {
          setNotice(copy.notices.handoff);
        } else {
          setNotice(copy.notices.response);
        }
        await refreshSnapshot();
      } catch (cause) {
        if (
          cause instanceof DemoBrowserError &&
          cause.code === "RATE_LIMITED"
        ) {
          setRetryRequestId(requestId);
        } else {
          setRetryRequestId(null);
        }
        throw cause;
      }
    });
  }

  function handleReset() {
    if (!resetArmed) {
      setResetArmed(true);
      setNotice(copy.notices.armReset);
      return;
    }
    void runExclusive("reset", async () => {
      const result = await resetDemoSession(locale);
      setSession(result.session);
      setMessages([]);
      setReservations([]);
      setHandoff(null);
      setDraft("");
      setRetryRequestId(null);
      setResetArmed(false);
      setNotice(copy.notices.reset);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section
        aria-labelledby="demo-chat-title"
        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/45 shadow-2xl shadow-slate-950/20"
      >
        <header className="flex flex-col gap-4 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              {copy.secureChannel}
            </p>
            <h2 id="demo-chat-title" className="mt-2 text-xl font-semibold text-white">
              {copy.conversation}
            </h2>
          </div>
          <div
            className="flex items-center gap-2 text-sm text-slate-300"
            aria-live="polite"
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                sessionState === "active"
                  ? "bg-cyan-300"
                  : sessionState === "checking"
                    ? "bg-amber-300"
                    : "bg-slate-500"
              }`}
              aria-hidden="true"
            />
            {sessionState === "active"
              ? copy.sessionActive
              : sessionState === "checking"
                ? copy.checkingSession
                : copy.sessionRequired}
          </div>
        </header>

        <div
          className="min-h-80 space-y-4 px-5 py-6 sm:min-h-[28rem] sm:px-7"
          aria-label={copy.historyLabel}
        >
          {sessionState === "checking" ? (
            <p className="text-sm leading-7 text-slate-400">{copy.loadingSession}</p>
          ) : sessionState === "required" ? (
            <div className="mx-auto max-w-md py-14 text-center">
              <h3 className="text-lg font-semibold text-white">{copy.startSessionTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {copy.sessionCookieHelp}
              </p>
              <button
                type="button"
                {...BUTTON_RELOAD_ATTRIBUTES}
                onClick={handleConnect}
                disabled={pending !== null}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending === "session" ? copy.connecting : copy.startSession}
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="mx-auto max-w-md py-14 text-center">
              <h3 className="text-lg font-semibold text-white">{copy.readyTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {copy.readyHelp}
              </p>
            </div>
          ) : (
            <ol className="space-y-4">
              {messages.map((message, index) => (
                <li
                  key={`${message.createdAt}-${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <article
                    className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                      message.role === "user"
                        ? "bg-cyan-300 text-slate-950"
                        : "border border-slate-700 bg-slate-950/65 text-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                    <p
                      className={`mt-2 text-xs ${
                        message.role === "user" ? "text-slate-700" : "text-slate-500"
                      }`}
                    >
                      {message.role === "user" ? copy.you : "AURA"} · {formatTimestamp(message.createdAt, locale)}
                    </p>
                  </article>
                </li>
              ))}
            </ol>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-800 bg-slate-950/45 px-5 py-5 sm:px-7">
          <div aria-live="polite" aria-atomic="true" className="mb-4 min-h-6 text-sm">
            {error !== null ? <p className="text-rose-300">{error}</p> : null}
            {rateLimit !== null ? <p className="mt-1 text-amber-300">{rateLimit}</p> : null}
            {error === null && notice !== null ? <p className="text-cyan-200">{notice}</p> : null}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <label htmlFor="aura-message" className="sr-only">
                {copy.messageLabel}
              </label>
              <input
                id="aura-message"
                name="message"
                type="text"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setRetryRequestId(null);
                  setRateLimit(null);
                }}
                disabled={sessionState !== "active" || pending !== null}
                maxLength={2_000}
                autoComplete="off"
                placeholder={copy.messagePlaceholder}
                aria-describedby="aura-message-help"
                className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p
                id="aura-message-help"
                className={`mt-2 text-xs ${messageLength > MAX_MESSAGE_CODEPOINTS ? "text-rose-300" : "text-slate-500"}`}
              >
                {messageLength}/{MAX_MESSAGE_CODEPOINTS} {copy.characters} · {copy.enterToSend}
              </p>
            </div>
            <button
            type="submit"
            {...BUTTON_RELOAD_ATTRIBUTES}
              disabled={
                sessionState !== "active" ||
                pending !== null ||
                draft.trim() === "" ||
                messageLength > MAX_MESSAGE_CODEPOINTS
              }
              className="min-h-12 rounded-xl bg-cyan-300 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending === "chat" ? copy.sending : copy.sendMessage}
            </button>
          </form>
        </div>
      </section>

      <aside className="space-y-6" aria-label={copy.controlsLabel}>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5">
          <h2 className="text-sm font-semibold text-white">{copy.sessionStatus}</h2>
          {session === null ? (
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {copy.noActiveSession}
            </p>
          ) : (
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">{copy.savedMessages}</dt>
                <dd className="mt-1 font-medium text-slate-200">{session.messageCount}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{copy.idleLimit}</dt>
                <dd className="mt-1 text-slate-300">{formatTimestamp(session.idleExpiresAt, locale)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{copy.absoluteLimit}</dt>
                <dd className="mt-1 text-slate-300">{formatTimestamp(session.absoluteExpiresAt, locale)}</dd>
              </div>
            </dl>
          )}
          <button
            type="button"
            {...BUTTON_RELOAD_ATTRIBUTES}
            onClick={handleConnect}
            disabled={pending !== null}
            className="mt-5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending === "session"
              ? copy.syncing
              : sessionState === "active"
                ? copy.sync
                : copy.startSession}
          </button>
        </section>

        {handoff !== null ? (
          <section className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-5">
            <h2 className="text-sm font-semibold text-amber-200">{copy.handoff}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{copy.handoffSummary}</p>
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white">{copy.reservations}</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
              {reservations.length}
            </span>
          </div>
          {reservations.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-slate-400">{copy.noReservations}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {reservations.map((reservation) => (
                <li
                  key={reservation.reservationReference}
                  className="rounded-xl border border-slate-800 bg-slate-950/55 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs text-cyan-200">
                      {reservation.reservationReference}
                    </p>
                    <span className="text-xs text-slate-400">{copy.status[reservation.status]}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {formatReservationDate(reservation.reservationDate, reservation.reservationTime, locale)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{reservation.partySize} {copy.people}</p>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            {...BUTTON_RELOAD_ATTRIBUTES}
            onClick={handleRefreshReservations}
            disabled={sessionState !== "active" || pending !== null}
            className="mt-5 min-h-11 w-full rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending === "reservations" ? copy.loading : copy.refreshReservations}
          </button>
        </section>

        <section className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5">
          <h2 className="text-sm font-semibold text-white">{copy.resetDemo}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {copy.resetHelp}
          </p>
          <button
            type="button"
            {...BUTTON_RELOAD_ATTRIBUTES}
            onClick={handleReset}
            disabled={sessionState !== "active" || pending !== null}
            className="mt-5 min-h-11 w-full rounded-xl border border-rose-300/30 px-4 text-sm font-semibold text-rose-200 transition hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending === "reset"
              ? copy.resetting
              : resetArmed
                ? copy.confirmReset
                : copy.resetData}
          </button>
          {resetArmed ? (
            <button
              type="button"
              {...BUTTON_RELOAD_ATTRIBUTES}
              onClick={() => {
                setResetArmed(false);
                setNotice(null);
              }}
              disabled={pending !== null}
              className="mt-2 min-h-10 w-full text-sm font-medium text-slate-400 hover:text-white disabled:opacity-50"
            >
              {copy.cancel}
            </button>
          ) : null}
        </section>
      </aside>
    </div>
  );
}

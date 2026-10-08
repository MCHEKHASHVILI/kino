# Notes

## Questions for backend

### Refund deadline on the order (`refundableUntil`)

_Added 2026-10-08, to ask on 2026-10-09 or 2026-10-10._

**Context:** the ticket card on the profile page (My tickets) shows
"Refundable until 14:30, Tue 15 Sep" under the Refund button, as in the design.

**Problem:** the `Order` resource (`GET /tickets`, `POST /orders`,
`POST /orders/{order}/refund`) only has `isRefundable`. There is no deadline, so the
client works it out as session start minus 2 hours. That 2 hour cutoff is a backend
rule, and the docs themselves say not to compute it on the client. If the backend
changes it, the text will be wrong.

**Ask:** add the deadline to the order, e.g.

```json
"refundableUntil": "2026-09-15T14:30:00+00:00"
```

null once refunded or when the session has passed. Also worth confirming which
timezone it is in: `session.startsAt` currently comes back as the hall time marked
UTC (`10:00` / `10:00+00:00`).

**Once it exists:**

- Remove `REFUND_CUTOFF_MS` from `src/components/ui/Tickets/TicketCard.vue` and build
  the note from `order.refundableUntil`.
- Add `refundableUntil: string | null` to `Order` in `src/types/Order.ts`.
- The button keeps using `isRefundable` only. A stale `true` already gets a 422,
  shows its message and refetches the tickets.

### Session start time zone (`startsAt`)

_Added 2026-10-08._

**Context:** session cards on the sessions page are disabled once the session has started,
by comparing `session.startsAt` with the current time.

**Problem:** `startsAt` comes back as the hall time marked UTC, e.g. `time: "10:00"` with
`startsAt: "2026-10-08T10:00:00+00:00"`. If 10:00 is Tbilisi time (UTC+4), the real start is
`06:00Z`, and the card is disabled four hours late.

**Ask:** is `startsAt` true UTC or Tbilisi time? Ideally it carries its real offset
(`+04:00`), or the session gets a flag like `hasStarted` so the client doesn't decide.

**Once answered:** adjust `hasStarted` in `src/components/ui/Sessions/SessionCard.vue`.

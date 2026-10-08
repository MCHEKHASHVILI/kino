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

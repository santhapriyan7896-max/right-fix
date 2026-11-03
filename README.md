# RightFix Labs website

Next.js 16 + Tailwind 4. Every page is pre-built static HTML.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Where things live

| What | File |
| --- | --- |
| Phone, address, hours, offer, pickup areas, GSTIN, Google rating | `src/data/site.ts` |
| Repairs: names, times, **prices**, warranty, FAQs | `src/data/services.ts` |
| Renewed phones in stock, grades, the 32 checks | `src/data/phones.ts` |
| Photos | `public/photos/` and `public/phones/` |

## Before going live (these are what build trust)

1. **Real photos.** Put these in `public/photos/`. They show up automatically, and until then each spot says which photo it needs:
   - `shop-front.jpg`: the shop from the street, sign readable
   - `team-bench.jpg`: technicians at the bench, faces visible
   - `workshop.jpg`: wide shot of the workshop
   - `counter.jpg`: the customer counter
   Do not use stock photos. People spot them, and they make the site look fake.
2. **Starting prices** in `src/data/services.ts` (`priceFrom`). Even "from ₹1,499" beats "call for price".
3. **Warranty length** per repair (`warranty`), e.g. `"90 days"`.
4. **Google reviews**: set `googleReviewsUrl` and `googleRating` in `site.ts`. The reviews section only appears once both are filled.
5. **GSTIN** and a **landmark** for the shop in `site.ts`.
6. **Phones in stock** in `src/data/phones.ts`, one entry per handset, with a photo of that exact phone.
   The sample cards only show during `npm run dev`, never on the live site.
7. **Logo**: `src/components/Logo.tsx` is a text wordmark. Swap in your logo file if you prefer.

## Old URLs

The old site's repair URLs (`/services/mobile-screen`, `/services/laptop-battery`, etc.) are kept.
Pages not rebuilt yet: `/parts`, `/track`, `/gallery`, `/locations`, `/capabilities`. Add redirects in
`next.config.ts` for any you drop, so Google links keep working.

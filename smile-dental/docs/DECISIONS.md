# Project Architectural & Design Decisions

> Rule: Keep decisions simple, 1-2 lines each.

1. **Monorepo Directory Layout**: Placed frontend directly within `smile-dental/` with Vite and standard directory layout so `npm run build` and `npm test` execute directly at the project root.
2. **Postgres Exclusion vs Serialized Locking**: Implemented appointment slot overlap prevention via an explicit `EXCLUDE` constraint with `tsrange` and `gist` alongside strict validation inside Postgres `book_appointment` and `reschedule_appointment` RPCs to guarantee zero double-bookings.
3. **Bilingual Chat State Machine**: Placed bilingual dictionary and conversational state transitions directly inside pure JavaScript Code nodes in n8n so chatbot operates deterministically even when LLM is unavailable or offline.
4. **Procedural 3D Tooth Fallback**: Built a custom Three.js procedural molar mesh using parametric curves and soft phong materials so the hero renders beautifully with zero external network dependencies while supporting drop-in `public/models/tooth.glb` if provided.
5. **Admin Access Control**: Used Supabase Auth email/password coupled with row-level security on the `admins` table to restrict administrative functions to verified clinic staff only.

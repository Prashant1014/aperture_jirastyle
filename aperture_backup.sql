--
-- PostgreSQL database dump
--

\restrict L8XqvPNpdR5MlSk4CSo45PThsmGdVm2w3CnfiU6bUgwy64i1AaU2hULqHcYG5bp

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'ASSIGNED',
    'SORT_AND_EDIT',
    'UPLOAD_DONE'
);


ALTER TYPE public."AssignmentStatus" OWNER TO postgres;

--
-- Name: EventStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EventStatus" AS ENUM (
    'UPCOMING',
    'ONGOING',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."EventStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ASSIGNMENT_COMPLETED',
    'TEST'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'WEBADMIN',
    'CORE_MEMBER',
    'TEAM_APERTURE',
    'WORKING_TEAM'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Announcement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Announcement" (
    id text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    "imageUrl" text,
    pinned boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text
);


ALTER TABLE public."Announcement" OWNER TO postgres;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    location text,
    "driveLink" text,
    "startsAt" timestamp(3) without time zone NOT NULL,
    "endsAt" timestamp(3) without time zone,
    status public."EventStatus" DEFAULT 'UPCOMING'::public."EventStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text
);


ALTER TABLE public."Event" OWNER TO postgres;

--
-- Name: EventAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EventAssignment" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "userId" text NOT NULL,
    status public."AssignmentStatus" DEFAULT 'ASSIGNED'::public."AssignmentStatus" NOT NULL,
    note text
);


ALTER TABLE public."EventAssignment" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignmentId" text,
    "eventId" text,
    "recipientId" text NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: PushSubscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PushSubscription" (
    id text NOT NULL,
    "userId" text NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PushSubscription" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'WORKING_TEAM'::public."Role" NOT NULL,
    title text,
    bio text,
    "avatarUrl" text,
    "contactNumber" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Announcement" (id, title, body, "imageUrl", pinned, "createdAt", "updatedAt", "authorId") FROM stdin;
seed-announcement-welcome	Welcome to the new Aperture portal	This is the working members portal for Aperture — The Digital Arts Society. Use it to find fellow members, track events, and stay on top of announcements.	\N	t	2026-08-20 19:38:25.959	2026-08-20 19:38:25.959	cmt1xaztr0000a8odexvabw7b
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Event" (id, title, description, location, "driveLink", "startsAt", "endsAt", status, "createdAt", "updatedAt", "createdById") FROM stdin;
seed-event-winter-expo	Winter Digital Art Exhibition	Annual showcase of member digital artwork across the campus gallery.	Main Gallery	\N	2026-09-03 19:38:25.842	\N	UPCOMING	2026-08-20 19:38:25.889	2026-08-20 19:38:25.889	cmt1xaztr0000a8odexvabw7b
cmt1xu8am0000pcodjeb275dz	helllooo	yoyo	online	\N	2026-08-21 19:52:00	2026-08-26 19:52:00	UPCOMING	2026-08-20 19:53:21.79	2026-08-20 19:53:21.79	cmt1xaztr0000a8odexvabw7b
\.


--
-- Data for Name: EventAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EventAssignment" (id, "eventId", "userId", status, note) FROM stdin;
cmt1xb10k0004a8od9suycfzo	seed-event-winter-expo	cmt1xb0mk0002a8odjw74p8nt	SORT_AND_EDIT	\N
cmt1xb10k0005a8odt3iq8lze	seed-event-winter-expo	cmt1xb0z40003a8odnkiy98ic	ASSIGNED	\N
cmt1xu8au0001pcodpzgaw9sv	cmt1xu8am0000pcodjeb275dz	cmt1xb09l0001a8odfwvf655c	ASSIGNED	\N
cmt1xu8au0002pcodc2mole71	cmt1xu8am0000pcodjeb275dz	cmt1xb0z40003a8odnkiy98ic	ASSIGNED	\N
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, type, title, message, read, "createdAt", "assignmentId", "eventId", "recipientId") FROM stdin;
cmt20w9700000a8odlx7irh9y	TEST	Test notification	🔔 This is a test notification from Aperture. Your notification system is working correctly.	t	2026-08-20 21:18:55.116	\N	\N	cmt1xaztr0000a8odexvabw7b
cmt20xhw10001a8od0w96awb2	TEST	Test notification	🔔 This is a test notification from Aperture. Your notification system is working correctly.	t	2026-08-20 21:19:53.041	\N	\N	cmt1xaztr0000a8odexvabw7b
cmt20xy9v0002a8od3w1g2uj6	TEST	Test notification	🔔 This is a test notification from Aperture. Your notification system is working correctly.	t	2026-08-20 21:20:14.275	\N	\N	cmt1xaztr0000a8odexvabw7b
cmt2vieud0003a8od25g60wph	TEST	Test notification	🔔 This is a test notification from Aperture. Your notification system is working correctly.	t	2026-08-21 11:35:57.349	\N	\N	cmt1xaztr0000a8odexvabw7b
cmt3qw3ka0004a8odadgyjuys	TEST	Test notification	🔔 This is a test notification from Aperture. Your notification system is working correctly.	t	2026-08-22 02:14:24.011	\N	\N	cmt1xaztr0000a8odexvabw7b
cmt7kokw20000cwod6v2qcjve	TEST	Test notification	🔔 This is a test notification from Aperture. Your notification system is working correctly.	f	2026-08-24 18:31:40.226	\N	\N	cmt1xaztr0000a8odexvabw7b
\.


--
-- Data for Name: PushSubscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PushSubscription" (id, "userId", endpoint, p256dh, auth, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "passwordHash", role, title, bio, "avatarUrl", "contactNumber", "isActive", "createdAt", "updatedAt") FROM stdin;
cmt1xaztr0000a8odexvabw7b	Aperture Webadmin	admin@apertureart.org	$2b$12$I5EgXWy3MDMYsWizUa4/uOJkk5rjYf7NKOuUKUt1yQGrMiqk8FZl2	WEBADMIN	Web Administrator	\N	\N	\N	t	2026-08-20 19:38:24.351	2026-08-20 19:46:33.132
cmt1xb09l0001a8odfwvf655c	Meera Iyer	meera@apertureart.org	$2b$12$rz9jWO7XddYouaqljJRpAOT73nD2W8Q.Y/a.vfu9JaS0VP9O1S6ri	CORE_MEMBER	Creative Director	Leads exhibition planning and the core committee.	\N	\N	t	2026-08-20 19:38:24.921	2026-08-20 19:46:33.684
cmt1xb0mk0002a8odjw74p8nt	Rohan Das	rohan@apertureart.org	$2b$12$GUGVfxmj5uMbA5TO/D.LbO3Q1gf91NkifP3ZeenKaK8dCOMjUPzb2	TEAM_APERTURE	Photography Team	\N	\N	\N	t	2026-08-20 19:38:25.388	2026-08-20 19:46:34.125
cmt1xb0z40003a8odnkiy98ic	Ananya Shah	ananya@apertureart.org	$2b$12$UPYy0S3dgH6mRavXZWWRVOSd4nXNtZeCeI.1CE2P0DUpWA2KHjwEu	WORKING_TEAM	Working Member — Design	\N	\N	\N	t	2026-08-20 19:38:25.84	2026-08-20 19:46:34.582
\.


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: EventAssignment EventAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventAssignment"
    ADD CONSTRAINT "EventAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PushSubscription PushSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Announcement_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Announcement_createdAt_idx" ON public."Announcement" USING btree ("createdAt");


--
-- Name: Announcement_pinned_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Announcement_pinned_idx" ON public."Announcement" USING btree (pinned);


--
-- Name: EventAssignment_eventId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EventAssignment_eventId_userId_key" ON public."EventAssignment" USING btree ("eventId", "userId");


--
-- Name: Event_startsAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Event_startsAt_idx" ON public."Event" USING btree ("startsAt");


--
-- Name: Event_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Event_status_idx" ON public."Event" USING btree (status);


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_read_idx" ON public."Notification" USING btree (read);


--
-- Name: Notification_recipientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_recipientId_idx" ON public."Notification" USING btree ("recipientId");


--
-- Name: PushSubscription_endpoint_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON public."PushSubscription" USING btree (endpoint);


--
-- Name: PushSubscription_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PushSubscription_userId_idx" ON public."PushSubscription" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: Announcement Announcement_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EventAssignment EventAssignment_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventAssignment"
    ADD CONSTRAINT "EventAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventAssignment EventAssignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventAssignment"
    ADD CONSTRAINT "EventAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Event Event_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."EventAssignment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_recipientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PushSubscription PushSubscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict L8XqvPNpdR5MlSk4CSo45PThsmGdVm2w3CnfiU6bUgwy64i1AaU2hULqHcYG5bp


CREATE EXTENSION "uuid-ossp";

-- Table: public.users
-- DROP TABLE public.users;

CREATE TABLE public.users
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  username character varying NOT NULL,
  password character varying NOT NULL,
  email character varying NOT NULL,
  profile jsonb,
  active boolean DEFAULT true,
  created_at time without time zone DEFAULT now(),
  updated_at time without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.users
  OWNER TO postgres;


-- Table: public.clients
-- DROP TABLE public.clients;

CREATE TABLE public.clients
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  secret uuid NOT NULL DEFAULT uuid_generate_v4(),
  redirect_uri character varying,
  created_at time without time zone DEFAULT now(),
  updated_at time without time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.clients
  OWNER TO postgres;


-- Table: public.access_tokens
-- DROP TABLE public.access_tokens;

CREATE TABLE public.access_tokens
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  value character varying,
  client_id uuid,
  user_id uuid,
  expires_in timestamp without time zone,
  refresh_token character varying,
  refresh_token_expires_in timestamp without time zone,
  created_at time without time zone DEFAULT now(),
  updated_at time without time zone DEFAULT now(),
  CONSTRAINT access_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT client_id_fk FOREIGN KEY (client_id)
      REFERENCES public.clients (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.access_tokens
  OWNER TO postgres;


-- Table: public.codes
-- DROP TABLE public.codes;

CREATE TABLE public.codes
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  value character varying,
  client_id uuid,
  user_id uuid,
  expires_in integer,
  created_at time without time zone DEFAULT now(),
  updated_at time without time zone DEFAULT now(),
  CONSTRAINT codes_pkey PRIMARY KEY (id),
  CONSTRAINT client_id_fk FOREIGN KEY (client_id)
      REFERENCES public.clients (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.codes
  OWNER TO postgres;


-- Table: public.services
-- DROP TABLE public.services;

CREATE TABLE public.services
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying,
  uri character varying,
  created_at time without time zone DEFAULT now(),
  updated_at time without time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.services
  OWNER TO postgres;


-- Table: public.users_has_resources
-- DROP TABLE public.users_has_resources;

CREATE TABLE public.users_has_resources
(
  user_id uuid NOT NULL,
  resource_id uuid NOT NULL,
  resource_type character varying NOT NULL,
  options jsonb,
  permission boolean DEFAULT true,
  scopes jsonb,
  created_at time without time zone DEFAULT now(),
  updated_at time without time zone DEFAULT now(),
  CONSTRAINT users_has_resources_pkey PRIMARY KEY (user_id, resource_id, resource_type),
  CONSTRAINT user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.users_has_resources
  OWNER TO postgres;

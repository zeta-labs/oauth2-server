CREATE EXTENSION "uuid-ossp";

-- Table: clients
-- DROP TABLE clients;

CREATE TABLE clients
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  secret uuid NOT NULL DEFAULT uuid_generate_v4(),
  redirect_uri character varying,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE clients
  OWNER TO postgres;

-- Table: users
-- DROP TABLE users;

CREATE TABLE users
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  username character varying,
  password character varying,
  email character varying,
  active boolean,
  created_at time without time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users
  OWNER TO postgres;

-- Table: access_tokens
-- DROP TABLE access_tokens;

CREATE TABLE access_tokens
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  value character varying,
  client_id uuid,
  user_id uuid,
  expires_in timestamp without time zone,
  CONSTRAINT access_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT client_id_fk FOREIGN KEY (client_id)
      REFERENCES clients (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT user_id_fk FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE access_tokens
  OWNER TO postgres;

-- Table: codes
-- DROP TABLE codes;

CREATE TABLE codes
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  value character varying,
  client_id uuid,
  user_id uuid,
  expires_in integer,
  CONSTRAINT codes_pkey PRIMARY KEY (id),
  CONSTRAINT client_id_fk FOREIGN KEY (client_id)
      REFERENCES clients (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT user_id_fk FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE codes
  OWNER TO postgres;

-- Table: services
-- DROP TABLE services;

CREATE TABLE services
(
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying,
  uri character varying,
  created_at time without time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE services
  OWNER TO postgres;

-- Table: users_has_resources
-- DROP TABLE users_has_resources;
CREATE TABLE users_has_resources
(
  user_id uuid NOT NULL,
  resource_id uuid NOT NULL,
  resource_type character varying NOT NULL,
  created_at time without time zone,
  options jsonb,
  permission boolean DEFAULT true,
  CONSTRAINT users_has_resources_pkey PRIMARY KEY (user_id, resource_id, resource_type),
  CONSTRAINT user_id_fk FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users_has_resources
  OWNER TO postgres;

-- Extensions
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;
COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;
COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

-- PostGIS related schemas and extensions (if needed, extracted from dump)
CREATE SCHEMA IF NOT EXISTS tiger;
CREATE SCHEMA IF NOT EXISTS tiger_data;
CREATE SCHEMA IF NOT EXISTS topology;

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;
COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;
COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';

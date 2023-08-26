CREATE OR REPLACE FUNCTION relevance_score(
    burn_type boolean,
	dana_burn_time timestamp with time zone,
	epoch timestamp with time zone,
	half_life interval,
	dana double precision)
    RETURNS double precision
AS $$
DECLARE
    sign INTEGER;
    diff_interval INTERVAL;
    diff_hours double precision;
BEGIN
    CASE
		WHEN burn_type THEN sign = 1;
		ELSE sign = -1;
	END CASE;
    diff_interval = dana_burn_time - epoch;
    diff_hours = EXTRACT(EPOCH FROM diff_interval)/3600;
    RETURN sign * dana * pow(2.0, (diff_hours/(CAST(EXTRACT(EPOCH FROM half_life) AS double precision)/3600.0)));
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE AGGREGATE total_relevance(double precision) (
  SFUNC = float8pl,
  STYPE = double precision
);
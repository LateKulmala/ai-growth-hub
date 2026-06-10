
ALTER TABLE public.experiments
  ADD COLUMN IF NOT EXISTS score_technical integer CHECK (score_technical IS NULL OR (score_technical BETWEEN 0 AND 20)),
  ADD COLUMN IF NOT EXISTS score_creativity integer CHECK (score_creativity IS NULL OR (score_creativity BETWEEN 0 AND 20)),
  ADD COLUMN IF NOT EXISTS score_practical integer CHECK (score_practical IS NULL OR (score_practical BETWEEN 0 AND 20)),
  ADD COLUMN IF NOT EXISTS score_documentation integer CHECK (score_documentation IS NULL OR (score_documentation BETWEEN 0 AND 20)),
  ADD COLUMN IF NOT EXISTS score_learning integer CHECK (score_learning IS NULL OR (score_learning BETWEEN 0 AND 20));

CREATE OR REPLACE FUNCTION public.experiments_compute_total()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.score_technical IS NOT NULL
     OR NEW.score_creativity IS NOT NULL
     OR NEW.score_practical IS NOT NULL
     OR NEW.score_documentation IS NOT NULL
     OR NEW.score_learning IS NOT NULL THEN
    NEW.score_total :=
      COALESCE(NEW.score_technical, 0)
      + COALESCE(NEW.score_creativity, 0)
      + COALESCE(NEW.score_practical, 0)
      + COALESCE(NEW.score_documentation, 0)
      + COALESCE(NEW.score_learning, 0);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS experiments_compute_total_trg ON public.experiments;
CREATE TRIGGER experiments_compute_total_trg
BEFORE INSERT OR UPDATE ON public.experiments
FOR EACH ROW EXECUTE FUNCTION public.experiments_compute_total();

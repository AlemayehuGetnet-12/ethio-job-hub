CREATE TYPE public.job_status AS ENUM ('draft','published','closed');

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  company_name text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  remote boolean NOT NULL DEFAULT false,
  employment_type text NOT NULL DEFAULT 'Full-time',
  category text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  education text NOT NULL DEFAULT '',
  salary_min integer NOT NULL DEFAULT 0,
  salary_max integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ETB',
  deadline date,
  description text NOT NULL DEFAULT '',
  requirements text[] NOT NULL DEFAULT '{}',
  responsibilities text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  status public.job_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX jobs_employer_idx ON public.jobs(employer_id);
CREATE INDEX jobs_status_idx ON public.jobs(status);

GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published jobs"
  ON public.jobs FOR SELECT
  USING (status = 'published');

CREATE POLICY "Employers can view their own jobs"
  ON public.jobs FOR SELECT TO authenticated
  USING (auth.uid() = employer_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employers can create their own jobs"
  ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = employer_id AND (public.has_role(auth.uid(), 'employer') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Employers can update their own jobs"
  ON public.jobs FOR UPDATE TO authenticated
  USING (auth.uid() = employer_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = employer_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employers can delete their own jobs"
  ON public.jobs FOR DELETE TO authenticated
  USING (auth.uid() = employer_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
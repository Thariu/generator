-- component_templates: versioned dynamic-template definitions (Pattern A + B sync).
-- Safe to run if the table already exists (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS public.component_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_romanized text,
  display_name text NOT NULL,
  category text NOT NULL,
  category_romanized text,
  unique_id text NOT NULL,
  section_id text,
  thumbnail_url text,
  description text,
  code_template text,
  html_markup text,
  default_props jsonb DEFAULT '{}'::jsonb,
  prop_schema jsonb DEFAULT '[]'::jsonb,
  style_schema jsonb DEFAULT '[]'::jsonb,
  css_files jsonb DEFAULT '[]'::jsonb,
  js_files jsonb DEFAULT '[]'::jsonb,
  custom_css_code text,
  is_active boolean NOT NULL DEFAULT true,
  is_draft boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  parent_id uuid REFERENCES public.component_templates (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS component_templates_unique_id_version_idx
  ON public.component_templates (unique_id, version DESC);

CREATE INDEX IF NOT EXISTS component_templates_is_draft_idx
  ON public.component_templates (is_draft)
  WHERE is_active = true;

ALTER TABLE public.component_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "component_templates_anon_all" ON public.component_templates;
CREATE POLICY "component_templates_anon_all"
  ON public.component_templates
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.component_templates IS 'Versioned LP component templates for dynamic-template runtime rendering.';

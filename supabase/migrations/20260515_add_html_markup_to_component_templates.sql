-- Runtime HTML for data-driven dynamic-template components (Pattern A).
-- Apply in Supabase SQL editor or via supabase db push.
ALTER TABLE public.component_templates
  ADD COLUMN IF NOT EXISTS html_markup text;

COMMENT ON COLUMN public.component_templates.html_markup IS 'Raw HTML with data-prop bindings; used by DynamicTemplateComponent at runtime.';

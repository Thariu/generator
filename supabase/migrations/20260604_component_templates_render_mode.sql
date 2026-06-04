-- render_mode: dynamic (html_markup) | react (fixed React component + DB variant props)
ALTER TABLE public.component_templates
  ADD COLUMN IF NOT EXISTS render_mode text NOT NULL DEFAULT 'dynamic',
  ADD COLUMN IF NOT EXISTS component_type text;

ALTER TABLE public.component_templates
  DROP CONSTRAINT IF EXISTS component_templates_render_mode_check;

ALTER TABLE public.component_templates
  ADD CONSTRAINT component_templates_render_mode_check
  CHECK (render_mode IN ('dynamic', 'react'));

COMMENT ON COLUMN public.component_templates.render_mode IS 'dynamic: DynamicTemplateComponent + html_markup; react: COMPONENT_TYPE_MAP + default_props';
COMMENT ON COLUMN public.component_templates.component_type IS 'When render_mode=react: kv, pricing, app-intro, etc.';

CREATE INDEX IF NOT EXISTS component_templates_render_mode_idx
  ON public.component_templates (render_mode)
  WHERE is_active = true;

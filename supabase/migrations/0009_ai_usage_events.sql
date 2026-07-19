-- Log for metered stateless AI actions (the /api/assistant RAG endpoint does not
-- persist to assistant_messages, so we need a dedicated counter source).
CREATE TABLE ai_usage_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_events_user_week ON ai_usage_events(user_id, created_at);

ALTER TABLE ai_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai usage"
  ON ai_usage_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION rpc_log_ai_usage(p_user_id UUID, p_kind TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO ai_usage_events (user_id, kind) VALUES (p_user_id, p_kind);
$$;

-- Re-count assistant usage from ai_usage_events instead of assistant_messages
CREATE OR REPLACE FUNCTION rpc_get_weekly_usage(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start TIMESTAMPTZ := date_trunc('week', now());
  v_flashcards INT;
  v_notes INT;
  v_assistant INT;
BEGIN
  SELECT COUNT(*) INTO v_flashcards
  FROM flashcards f
  JOIN flashcard_sets fs ON fs.id = f.set_id
  JOIN resources r ON r.id = fs.resource_id
  WHERE r.owner_id = p_user_id AND f.created_at >= v_week_start;

  SELECT COUNT(*) INTO v_notes
  FROM notes n
  JOIN resources r ON r.id = n.resource_id
  WHERE r.owner_id = p_user_id AND n.created_at >= v_week_start;

  SELECT COUNT(*) INTO v_assistant
  FROM ai_usage_events e
  WHERE e.user_id = p_user_id AND e.kind = 'assistant_messages' AND e.created_at >= v_week_start;

  RETURN json_build_object(
    'flashcards', v_flashcards,
    'notes', v_notes,
    'assistant_messages', v_assistant,
    'week_start', v_week_start,
    'week_resets_at', v_week_start + INTERVAL '7 days'
  );
END;
$$;
